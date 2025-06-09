import React, { useState, useEffect } from 'react';
import { Clock, Building, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent contracts
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('id, title, agency, state, created_at, response_deadline, status')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedActivities: Activity[] = contracts?.map(contract => ({
        id: contract.id,
        type: contract.response_deadline && new Date(contract.response_deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
          ? 'deadline_approaching' 
          : contract.status === 'awarded' 
          ? 'contract_awarded' 
          : 'new_opportunity',
        title: contract.title,
        agency: contract.agency,
        state: contract.state,
        timestamp: getRelativeTime(contract.created_at)
      })) || [];

      setRecentActivities(formattedActivities.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

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

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        {recentActivities.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== recentActivities.length - 1 && (
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
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}