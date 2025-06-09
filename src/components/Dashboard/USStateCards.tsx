import React from 'react';
import { MapPin, FileText, DollarSign } from 'lucide-react';

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
  const states: StateData[] = [
    { name: 'Alabama', abbr: 'AL', opportunities: 23, totalValue: 450000000, federalContracts: 15, stateContracts: 8 },
    { name: 'Alaska', abbr: 'AK', opportunities: 18, totalValue: 320000000, federalContracts: 12, stateContracts: 6 },
    { name: 'Arizona', abbr: 'AZ', opportunities: 35, totalValue: 680000000, federalContracts: 22, stateContracts: 13 },
    { name: 'Arkansas', abbr: 'AR', opportunities: 19, totalValue: 380000000, federalContracts: 11, stateContracts: 8 },
    { name: 'California', abbr: 'CA', opportunities: 89, totalValue: 2100000000, federalContracts: 54, stateContracts: 35 },
    { name: 'Colorado', abbr: 'CO', opportunities: 42, totalValue: 820000000, federalContracts: 28, stateContracts: 14 },
    { name: 'Connecticut', abbr: 'CT', opportunities: 31, totalValue: 590000000, federalContracts: 19, stateContracts: 12 },
    { name: 'Delaware', abbr: 'DE', opportunities: 15, totalValue: 280000000, federalContracts: 9, stateContracts: 6 },
    { name: 'Florida', abbr: 'FL', opportunities: 67, totalValue: 1350000000, federalContracts: 41, stateContracts: 26 },
    { name: 'Georgia', abbr: 'GA', opportunities: 52, totalValue: 980000000, federalContracts: 32, stateContracts: 20 },
    { name: 'Hawaii', abbr: 'HI', opportunities: 21, totalValue: 410000000, federalContracts: 14, stateContracts: 7 },
    { name: 'Idaho', abbr: 'ID', opportunities: 17, totalValue: 320000000, federalContracts: 10, stateContracts: 7 },
    { name: 'Illinois', abbr: 'IL', opportunities: 58, totalValue: 1120000000, federalContracts: 36, stateContracts: 22 },
    { name: 'Indiana', abbr: 'IN', opportunities: 39, totalValue: 740000000, federalContracts: 24, stateContracts: 15 },
    { name: 'Iowa', abbr: 'IA', opportunities: 26, totalValue: 490000000, federalContracts: 16, stateContracts: 10 },
    { name: 'Kansas', abbr: 'KS', opportunities: 28, totalValue: 530000000, federalContracts: 17, stateContracts: 11 },
    { name: 'Kentucky', abbr: 'KY', opportunities: 33, totalValue: 620000000, federalContracts: 20, stateContracts: 13 },
    { name: 'Louisiana', abbr: 'LA', opportunities: 37, totalValue: 710000000, federalContracts: 23, stateContracts: 14 },
    { name: 'Maine', abbr: 'ME', opportunities: 19, totalValue: 360000000, federalContracts: 12, stateContracts: 7 },
    { name: 'Maryland', abbr: 'MD', opportunities: 48, totalValue: 920000000, federalContracts: 31, stateContracts: 17 },
    { name: 'Massachusetts', abbr: 'MA', opportunities: 55, totalValue: 1050000000, federalContracts: 34, stateContracts: 21 },
    { name: 'Michigan', abbr: 'MI', opportunities: 46, totalValue: 870000000, federalContracts: 29, stateContracts: 17 },
    { name: 'Minnesota', abbr: 'MN', opportunities: 41, totalValue: 780000000, federalContracts: 26, stateContracts: 15 },
    { name: 'Mississippi', abbr: 'MS', opportunities: 24, totalValue: 450000000, federalContracts: 15, stateContracts: 9 },
    { name: 'Missouri', abbr: 'MO', opportunities: 38, totalValue: 720000000, federalContracts: 24, stateContracts: 14 },
    { name: 'Montana', abbr: 'MT', opportunities: 16, totalValue: 300000000, federalContracts: 10, stateContracts: 6 },
    { name: 'Nebraska', abbr: 'NE', opportunities: 22, totalValue: 420000000, federalContracts: 14, stateContracts: 8 },
    { name: 'Nevada', abbr: 'NV', opportunities: 29, totalValue: 550000000, federalContracts: 18, stateContracts: 11 },
    { name: 'New Hampshire', abbr: 'NH', opportunities: 18, totalValue: 340000000, federalContracts: 11, stateContracts: 7 },
    { name: 'New Jersey', abbr: 'NJ', opportunities: 51, totalValue: 970000000, federalContracts: 32, stateContracts: 19 },
    { name: 'New Mexico', abbr: 'NM', opportunities: 25, totalValue: 480000000, federalContracts: 16, stateContracts: 9 },
    { name: 'New York', abbr: 'NY', opportunities: 73, totalValue: 1420000000, federalContracts: 45, stateContracts: 28 },
    { name: 'North Carolina', abbr: 'NC', opportunities: 49, totalValue: 930000000, federalContracts: 31, stateContracts: 18 },
    { name: 'North Dakota', abbr: 'ND', opportunities: 14, totalValue: 260000000, federalContracts: 9, stateContracts: 5 },
    { name: 'Ohio', abbr: 'OH', opportunities: 54, totalValue: 1020000000, federalContracts: 34, stateContracts: 20 },
    { name: 'Oklahoma', abbr: 'OK', opportunities: 32, totalValue: 610000000, federalContracts: 20, stateContracts: 12 },
    { name: 'Oregon', abbr: 'OR', opportunities: 36, totalValue: 680000000, federalContracts: 23, stateContracts: 13 },
    { name: 'Pennsylvania', abbr: 'PA', opportunities: 59, totalValue: 1130000000, federalContracts: 37, stateContracts: 22 },
    { name: 'Rhode Island', abbr: 'RI', opportunities: 16, totalValue: 300000000, federalContracts: 10, stateContracts: 6 },
    { name: 'South Carolina', abbr: 'SC', opportunities: 34, totalValue: 640000000, federalContracts: 21, stateContracts: 13 },
    { name: 'South Dakota', abbr: 'SD', opportunities: 13, totalValue: 240000000, federalContracts: 8, stateContracts: 5 },
    { name: 'Tennessee', abbr: 'TN', opportunities: 43, totalValue: 810000000, federalContracts: 27, stateContracts: 16 },
    { name: 'Texas', abbr: 'TX', opportunities: 82, totalValue: 1580000000, federalContracts: 51, stateContracts: 31 },
    { name: 'Utah', abbr: 'UT', opportunities: 27, totalValue: 510000000, federalContracts: 17, stateContracts: 10 },
    { name: 'Vermont', abbr: 'VT', opportunities: 12, totalValue: 220000000, federalContracts: 7, stateContracts: 5 },
    { name: 'Virginia', abbr: 'VA', opportunities: 61, totalValue: 1170000000, federalContracts: 39, stateContracts: 22 },
    { name: 'Washington', abbr: 'WA', opportunities: 47, totalValue: 890000000, federalContracts: 30, stateContracts: 17 },
    { name: 'West Virginia', abbr: 'WV', opportunities: 20, totalValue: 380000000, federalContracts: 12, stateContracts: 8 },
    { name: 'Wisconsin', abbr: 'WI', opportunities: 40, totalValue: 760000000, federalContracts: 25, stateContracts: 15 },
    { name: 'Wyoming', abbr: 'WY', opportunities: 11, totalValue: 200000000, federalContracts: 7, stateContracts: 4 }
  ];

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    } else {
      return `$${(value / 1000).toFixed(0)}K`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Opportunities by State
      </h3>
      
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
    </div>
  );
}