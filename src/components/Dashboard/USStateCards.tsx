import React, { useState, useEffect } from 'react';
import { MapPin, FileText, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StateData {
  name: string;
  abbr: string;
  opportunities: number;
  totalValue: number;
  federalContracts: number;
  stateContracts: number;
}

interface USStateCardsProps {
  onStateClick?: (state: string) => void;
  stateData?: Record<string, StateData>;
}

export default function USStateCards({ onStateClick, stateData = {} }: USStateCardsProps) {
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);

  const stateList = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  useEffect(() => {
    fetchStateData();
  }, []);

  const fetchStateData = async () => {
    try {
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('state, contract_type, award_value, budget_max')
        .eq('status', 'active');

      if (error) throw error;

      const stateStats: Record<string, StateData> = {};

      // Initialize all states
      stateList.forEach(stateName => {
        const abbr = getStateAbbreviation(stateName);
        stateStats[abbr] = {
          name: stateName,
          abbr: abbr,
          opportunities: 0,
          totalValue: 0,
          federalContracts: 0,
          stateContracts: 0
        };
      });

      // Process contracts
      contracts?.forEach(contract => {
        if (contract.state) {
          const stateAbbr = contract.state.length === 2 ? contract.state : 
                           getStateAbbreviation(contract.state);
          
          if (stateAbbr && stateStats[stateAbbr]) {
            const state = stateStats[stateAbbr];
            state.opportunities++;
            
            const value = contract.award_value || contract.budget_max || 0;
            state.totalValue += value;
            
            if (contract.contract_type === 'federal') {
              state.federalContracts++;
            } else {
              state.stateContracts++;
            }
          }
        }
      });

      // Convert to array and sort by opportunities
      const statesArray = Object.values(stateStats)
        .filter(state => state.opportunities > 0)
        .sort((a, b) => b.opportunities - a.opportunities);

      setStates(statesArray);
    } catch (error) {
      console.error('Error fetching state data:', error);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStateAbbreviation = (stateName: string): string => {
    const stateAbbreviations: Record<string, string> = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateAbbreviations[stateName] || '';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    } else {
      return `$${(value / 1000).toFixed(0)}K`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Opportunities by State
        </h3>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Opportunities by State
      </h3>
      
      {states.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
          {states.map((state) => (
            <div
              key={state.abbr}
              onClick={() => onStateClick?.(state.abbr)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{state.name}</h4>
                <span className="text-xs font-bold text-blue-600">{state.abbr}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>{state.opportunities} opportunities</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span>{formatValue(state.totalValue)}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Fed: {state.federalContracts}</span>
                  <span className="text-green-600">State: {state.stateContracts}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contract data available</p>
        </div>
      )}
    </div>
  );
}