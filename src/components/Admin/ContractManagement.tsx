import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Upload, FileText, 
  Calendar, DollarSign, Building, MapPin, Tag, 
  Paperclip, Bell, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Contract {
  id: string;
  federal_id: string;
  title: string;
  description?: string;
  agency: string;
  department?: string;
  state?: string;
  contract_type: 'federal' | 'state';
  budget_min?: number;
  budget_max?: number;
  naics_code?: string;
  set_aside_code?: string;
  solicitation_number?: string;
  response_deadline?: string;
  posted_date: string;
  source_url?: string;
  status: 'active' | 'forecast' | 'tracked' | 'closed' | 'cancelled';
  contract_status: 'open' | 'awarded' | 'cancelled';
  last_updated: string;
  created_at: string;
}

interface ContractUpdate {
  id: string;
  contract_id: string;
  update_type: string;
  title: string;
  description?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

interface ContractAttachment {
  id: string;
  contract_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  attachment_type: string;
  created_at: string;
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractUpdates, setContractUpdates] = useState<ContractUpdate[]>([]);
  const [contractAttachments, setContractAttachments] = useState<ContractAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    update_type: 'general'
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (selectedContract) {
      fetchContractDetails();
    }
  }, [selectedContract]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractDetails = async () => {
    if (!selectedContract) return;

    try {
      // Fetch updates
      const { data: updates, error: updatesError } = await supabase
        .from('contract_updates')
        .select('*')
        .eq('contract_id', selectedContract.id)
        .order('created_at', { ascending: false });

      if (updatesError) throw updatesError;
      setContractUpdates(updates || []);

      // Fetch attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('contract_attachments')
        .select('*')
        .eq('contract_id', selectedContract.id)
        .order('created_at', { ascending: false });

      if (attachmentsError) throw attachmentsError;
      setContractAttachments(attachments || []);
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  };

  const handleUpdateContract = async (contractId: string, updates: Partial<Contract>) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ ...updates, updated_by: user?.id, last_updated: new Date().toISOString() })
        .eq('id', contractId);

      if (error) throw error;
      
      fetchContracts();
      if (selectedContract?.id === contractId) {
        setSelectedContract({ ...selectedContract, ...updates } as Contract);
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedContract || !newUpdate.title.trim()) return;

    try {
      const { error } = await supabase
        .from('contract_updates')
        .insert({
          contract_id: selectedContract.id,
          title: newUpdate.title,
          description: newUpdate.description,
          update_type: newUpdate.update_type,
          created_by: user?.id
        });

      if (error) throw error;
      
      setNewUpdate({ title: '', description: '', update_type: 'general' });
      setShowUpdateModal(false);
      fetchContractDetails();
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  const handlePublishUpdate = async (updateId: string) => {
    try {
      const { error } = await supabase
        .from('contract_updates')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('id', updateId);

      if (error) throw error;
      fetchContractDetails();
    } catch (error) {
      console.error('Error publishing update:', error);
    }
  };

  const handleFileUpload = async (file: File, attachmentType: string) => {
    if (!selectedContract) return;

    try {
      // In a real implementation, you would upload to a file storage service
      // For now, we'll just store the file metadata
      const { error } = await supabase
        .from('contract_attachments')
        .insert({
          contract_id: selectedContract.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          attachment_type: attachmentType,
          uploaded_by: user?.id
        });

      if (error) throw error;
      
      setShowAttachmentModal(false);
      fetchContractDetails();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.federal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.agency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'forecast': return 'bg-blue-100 text-blue-800';
      case 'tracked': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'forecast': return <Clock className="h-4 w-4" />;
      case 'tracked': return <Eye className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contract Management</h2>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Federal ID, title, or agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="forecast">Forecast</option>
            <option value="tracked">Tracked</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {filteredContracts.length} Contracts Found
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${
                    selectedContract?.id === contract.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {contract.federal_id}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {getStatusIcon(contract.status)}
                          <span className="ml-1 capitalize">{contract.status}</span>
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {contract.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {contract.agency}
                        </div>
                        
                        {contract.state && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {contract.state}
                          </div>
                        )}
                        
                        {contract.budget_min && contract.budget_max && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${contract.budget_min.toLocaleString()} - ${contract.budget_max.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Last updated: {new Date(contract.last_updated).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle quick status change
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contract Details Panel */}
        <div className="lg:col-span-1">
          {selectedContract ? (
            <div className="space-y-6">
              {/* Contract Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Contract Details</h3>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Update
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedContract.status}
                      onChange={(e) => handleUpdateContract(selectedContract.id, { status: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="forecast">Forecast</option>
                      <option value="tracked">Tracked</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Federal ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedContract.federal_id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContract.agency}</p>
                  </div>
                  
                  {selectedContract.response_deadline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deadline</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedContract.response_deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Updates */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Updates</h3>
                  <button
                    onClick={() => setShowAttachmentModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach File
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {contractUpdates.map((update) => (
                    <div key={update.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{update.title}</h4>
                        {!update.is_published && (
                          <button
                            onClick={() => handlePublishUpdate(update.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Publish
                          </button>
                        )}
                      </div>
                      
                      {update.description && (
                        <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{update.update_type}</span>
                        <span>{new Date(update.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {update.is_published && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {contractUpdates.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No updates yet</p>
                  )}
                </div>
              </div>

              {/* Contract Attachments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                
                <div className="space-y-2">
                  {contractAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{attachment.file_name}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{attachment.attachment_type}</span>
                    </div>
                  ))}
                  
                  {contractAttachments.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a contract to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Contract Update</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Update Type</label>
                  <select
                    value={newUpdate.update_type}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, update_type: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="amendment">Amendment</option>
                    <option value="deadline_change">Deadline Change</option>
                    <option value="award">Award</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Update title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Update description"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUpdate}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Attachment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attachment Type</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="document">Document</option>
                    <option value="announcement">Announcement</option>
                    <option value="amendment">Amendment</option>
                    <option value="award">Award</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle file upload
                    setShowAttachmentModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}