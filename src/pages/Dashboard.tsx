import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/Dashboard/StatsCard';
import USStateCards from '../components/Dashboard/USStateCards';
import AIAnalytics from '../components/Dashboard/AIAnalytics';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { supabase } from '../lib/supabase';
import {
  Building2,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    federalOpportunities: 0,
    stateOpportunities: 0,
    totalValue: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch opportunities stats
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('opportunity_type, budget_min, budget_max')
        .eq('status', 'active');

      if (oppError) throw oppError;

      const totalOpportunities = opportunities?.length || 0;
      const federalOpportunities = opportunities?.filter(o => o.opportunity_type === 'federal').length || 0;
      const stateOpportunities = opportunities?.filter(o => o.opportunity_type === 'state').length || 0;
      const totalValue = opportunities?.reduce((sum, o) => sum + (o.budget_max || 0), 0) || 0;

      let totalUsers = 0;
      let activeSubscriptions = 0;
      let monthlyRevenue = 0;

      if (isAdmin) {
        // Fetch user stats for admin
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('is_active', true);

        if (userError) throw userError;
        totalUsers = users?.length || 0;

        // Fetch subscription stats
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('status, plan_price')
          .eq('status', 'active');

        if (subError) throw subError;
        activeSubscriptions = subscriptions?.length || 0;
        monthlyRevenue = subscriptions?.reduce((sum, s) => sum + s.plan_price, 0) || 0;
      }

      setStats({
        totalOpportunities,
        federalOpportunities,
        stateOpportunities,
        totalValue,
        totalUsers,
        activeSubscriptions,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = (state: string) => {
    console.log('State clicked:', state);
    // Navigate to opportunities filtered by state
  };

  const userStatsCards = [
    {
      title: 'Active Opportunities',
      value: stats.totalOpportunities,
      change: '+12%',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'blue' as const
    },
    {
      title: 'Total Contract Value',
      value: `$${(stats.totalValue / 1000000000).toFixed(1)}B`,
      change: '+8%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'green' as const
    },
    {
      title: 'Federal Contracts',
      value: stats.federalOpportunities,
      change: '+5%',
      changeType: 'increase' as const,
      icon: Building2,
      color: 'purple' as const
    },
    {
      title: 'State Contracts',
      value: stats.stateOpportunities,
      change: '+15%',
      changeType: 'increase' as const,
      icon: Globe,
      color: 'yellow' as const
    }
  ];

  const adminStatsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+23%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      change: '+18%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      change: '+12%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'purple' as const
    },
    {
      title: 'Total Opportunities',
      value: stats.totalOpportunities,
      change: '+9%',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'yellow' as const
    }
  ];

  const displayStats = isAdmin ? adminStatsCards : userStatsCards;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.full_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* US State Cards */}
        <div className="lg:col-span-2">
          <USStateCards onStateClick={handleStateClick} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* AI Analytics */}
      <div className="mb-8">
        <AIAnalytics />
      </div>

      {/* Additional Sections for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Data Sources Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SAM.gov</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">USAspending.gov</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">State Portals</span>
                <span className="text-sm font-medium text-green-600">48/50 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm font-medium">2 min ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Services</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}