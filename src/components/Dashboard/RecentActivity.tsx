import React from 'react';
import { Clock, Building, MapPin } from 'lucide-react';

interface Activity {
  id: string;
  type: 'new_opportunity' | 'deadline_approaching' | 'contract_awarded';
  title: string;
  agency: string;
  state?: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'new_opportunity',
      title: 'IT Infrastructure Modernization',
      agency: 'California Department of Technology',
      state: 'CA',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'deadline_approaching',
      title: 'Cybersecurity Services Contract',
      agency: 'Department of Homeland Security',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'contract_awarded',
      title: 'Healthcare System Integration',
      agency: 'Texas Department of Health',
      state: 'TX',
      timestamp: '6 hours ago'
    },
    {
      id: '4',
      type: 'new_opportunity',
      title: 'Cloud Migration Services',
      agency: 'New York State CIO',
      state: 'NY',
      timestamp: '8 hours ago'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'new_opportunity':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'deadline_approaching':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'contract_awarded':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getActivityText = (type: Activity['type']) => {
    switch (type) {
      case 'new_opportunity':
        return 'New Opportunity';
      case 'deadline_approaching':
        return 'Deadline Soon';
      case 'contract_awarded':
        return 'Contract Awarded';
      default:
        return 'Activity';
    }
  };

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {displayActivities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== displayActivities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                  )}
                  <div className="relative flex space-x-3">
                    <div className="flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{getActivityText(activity.type)}</span>
                          : {activity.title}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Building className="h-3 w-3 mr-1" />
                          {activity.agency}
                          {activity.state && (
                            <>
                              <MapPin className="h-3 w-3 ml-2 mr-1" />
                              {activity.state}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}