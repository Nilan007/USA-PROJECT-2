import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { supabase, Pipeline, PipelineStage, PipelineOpportunity, Opportunity } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PipelineManager() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<(PipelineOpportunity & { opportunity: Opportunity })[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPipelines();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPipeline) {
      fetchPipelineData();
    }
  }, [selectedPipeline]);

  const fetchPipelines = async () => {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPipelines(data || []);
      
      if (data && data.length > 0) {
        const defaultPipeline = data.find(p => p.is_default) || data[0];
        setSelectedPipeline(defaultPipeline.id);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineData = async () => {
    try {
      // Fetch stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('user_id', user?.id)
        .order('order_index', { ascending: true });

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Fetch pipeline opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('pipeline_opportunities')
        .select(`
          *,
          opportunity:opportunities(*)
        `)
        .eq('pipeline_id', selectedPipeline);

      if (opportunitiesError) throw opportunitiesError;
      setPipelineOpportunities(opportunitiesData || []);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;

    try {
      const { error } = await supabase
        .from('pipeline_opportunities')
        .update({ stage_id: newStageId })
        .eq('id', draggableId);

      if (error) throw error;
      
      // Update local state
      setPipelineOpportunities(prev =>
        prev.map(po =>
          po.id === draggableId ? { ...po, stage_id: newStageId } : po
        )
      );
    } catch (error) {
      console.error('Error updating pipeline opportunity:', error);
    }
  };

  const addOpportunityToPipeline = async (opportunityId: string, stageId: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_opportunities')
        .insert({
          pipeline_id: selectedPipeline,
          opportunity_id: opportunityId,
          stage_id: stageId,
          probability: 25
        });

      if (error) throw error;
      fetchPipelineData();
    } catch (error) {
      console.error('Error adding opportunity to pipeline:', error);
    }
  };

  const updateOpportunityNotes = async (pipelineOpportunityId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_opportunities')
        .update({ notes })
        .eq('id', pipelineOpportunityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const getOpportunitiesForStage = (stageId: string) => {
    return pipelineOpportunities.filter(po => po.stage_id === stageId);
  };

  const calculateStageValue = (stageId: string) => {
    const stageOpportunities = getOpportunitiesForStage(stageId);
    return stageOpportunities.reduce((total, po) => {
      const value = po.estimated_value || po.opportunity.budget_max || 0;
      return total + (value * (po.probability / 100));
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline Management</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPipeline}
            onChange={(e) => setSelectedPipeline(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {pipelines.map(pipeline => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Pipeline
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageOpportunities = getOpportunitiesForStage(stage.id);
            const stageValue = calculateStageValue(stage.id);
            
            return (
              <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{stage.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {stageOpportunities.length}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${stageValue.toLocaleString()}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-32 space-y-2 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {stageOpportunities.map((pipelineOpp, index) => (
                        <Draggable
                          key={pipelineOpp.id}
                          draggableId={pipelineOpp.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-3 rounded border shadow-sm ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {pipelineOpp.opportunity.title}
                              </h4>
                              
                              <div className="text-xs text-gray-600 mb-2">
                                {pipelineOpp.opportunity.agency}
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {pipelineOpp.probability}%
                                </span>
                                {pipelineOpp.estimated_value && (
                                  <span className="font-medium">
                                    ${pipelineOpp.estimated_value.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {pipelineOpp.assigned_to && (
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <Users className="h-3 w-3 mr-1" />
                                  Assigned
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Pipeline Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pipelineOpportunities.length}
            </div>
            <div className="text-sm text-gray-600">Total Opportunities</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${pipelineOpportunities.reduce((total, po) => {
                const value = po.estimated_value || po.opportunity.budget_max || 0;
                return total + value;
              }, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${pipelineOpportunities.reduce((total, po) => {
                const value = po.estimated_value || po.opportunity.budget_max || 0;
                return total + (value * (po.probability / 100));
              }, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Weighted Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pipelineOpportunities.length > 0 
                ? Math.round(pipelineOpportunities.reduce((total, po) => total + po.probability, 0) / pipelineOpportunities.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg. Probability</div>
          </div>
        </div>
      </div>
    </div>
  );
}