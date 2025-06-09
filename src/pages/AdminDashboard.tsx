import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, Settings, BarChart3, DollarSign, TrendingUp, UserCheck, Shield, Calendar, Download, Eye, FolderOpen, Bell, Plus, Activity, Database, Globe, Zap, Target, Award, Briefcase, Mail, Phone, MapPin, Clock, CheckCircle, AlertTriangle, XCircle, ArrowRight, PieChart, LineChart, TrendingDown, Star, Filter, Layers, Server, UploadCloud as CloudUpload, UserPlus, FileSpreadsheet, BarChart, Users2, MessageSquare, Cog, Home, ChevronRight } from 'lucide-react';
import BulkUpload from '../components/Admin/BulkUpload';
import ContractManagement from '../components/Admin/ContractManagement';
import ManualEntryForms from '../components/Admin/ManualEntryForms';
import ContractsList from '../components/Admin/ContractsList';
import ContactsList from '../components/Admin/ContactsList';
import UserAccessManagement from '../components/Admin/UserAccessManagement';
import DemoTrialManagement from '../components/Admin/DemoTrialManagement';
import USAMap from '../components/Dashboard/USAMap';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingTrials: 0,
    totalContracts: 0,
    totalContacts: 0,
    monthlyGrowth: 0,
    recentUploads: [],
    pendingDemoRequests: 0
  });
  const [loading, setLoading] = useState(true);

  const menuSections = [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      description: 'System overview and analytics'
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      description: 'Manage contracts and contacts',
      subItems: [
        { id: 'contracts-list', title: 'All Contracts', icon: FolderOpen },
        { id: 'contacts-list', title: 'All Contacts', icon: Users },
        { id: 'manual-contract', title: 'Add Contract', icon: Plus },
        { id: 'manual-contact', title: 'Add Contact', icon: UserPlus },
        { id: 'upload-contracts', title: 'Upload Contracts', icon: CloudUpload },
        { id: 'upload-contacts', title: 'Upload Contacts', icon: Upload }
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: Users2,
      color: 'from-green-500 to-green-600',
      description: 'Manage users and access',
      subItems: [
        { id: 'users', title: 'All Users', icon: Users },
        { id: 'user-access', title: 'Access Control', icon: Shield },
        { id: 'subscriptions', title: 'Subscriptions', icon: DollarSign },
        { id: 'trials', title: 'Trial Requests', icon: Clock }
      ]
    },
    {
      id: 'communications',
      title: 'Communications',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      description: 'Demo requests and support',
      subItems: [
        { id: 'demo-requests', title: 'Demo Requests', icon: Calendar },
        { id: 'support-tickets', title: 'Support Tickets', icon: Bell }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: BarChart,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Performance metrics and insights',
      subItems: [
        { id: 'analytics', title: 'Platform Analytics', icon: TrendingUp },
        { id: 'reports', title: 'Custom Reports', icon: FileSpreadsheet },
        { id: 'usa-map', title: 'USA Contract Map', icon: MapPin }
      ]
    },
    {
      id: 'system',
      title: 'System Settings',
      icon: Cog,
      color: 'from-gray-500 to-gray-600',
      description: 'Configuration and maintenance',
      subItems: [
        { id: 'settings', title: 'General Settings', icon: Settings },
        { id: 'data-sources', title: 'Data Sources', icon: Server }
      ]
    }
  ];

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch users
      const { data: users } = await supabase.from('users').select('*');
      
      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');
      
      // Fetch contracts
      const { data: contracts } = await supabase.from('contracts').select('id');
      
      // Fetch contacts
      const { data: contacts } = await supabase.from('contacts').select('id');
      
      // Fetch demo requests
      const { data: demoRequests } = await supabase
        .from('demo_requests')
        .select('*')
        .eq('status', 'pending');
      
      // Fetch upload logs
      const { data: uploads } = await supabase
        .from('upload_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const totalRevenue = subscriptions?.reduce((sum, sub) => sum + sub.plan_price, 0) || 0;
      const pendingTrials = users?.filter(u => u.trial_days_remaining > 0).length || 0;

      setStats({
        totalUsers: users?.length || 0,
        activeSubscriptions: subscriptions?.length || 0,
        totalRevenue,
        pendingTrials,
        totalContracts: contracts?.length || 0,
        totalContacts: contacts?.length || 0,
        monthlyGrowth: 23, // Mock data
        recentUploads: uploads || [],
        pendingDemoRequests: demoRequests?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    fetchAdminStats();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header - Smaller and more modern */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Command Center</h1>
            <p className="text-blue-100">Manage your FederalTalks IQ platform</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Smaller 3D cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500 transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 font-medium">+{stats.monthlyGrowth}%</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500 transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-xl font-bold text-gray-900">${(stats.totalRevenue/1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 font-medium">+18%</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-purple-500 transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Contracts</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalContracts}</p>
              <p className="text-xs text-green-600 font-medium">+15%</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-orange-500 transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Contacts</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalContacts}</p>
              <p className="text-xs text-green-600 font-medium">+12%</p>
            </div>
            <div className="bg-orange-100 rounded-full p-2">
              <UserCheck className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards - Smaller and more modern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuSections.slice(1).map((section) => (
          <div
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className={`h-1 bg-gradient-to-r ${section.color}`}></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-r ${section.color} rounded-lg p-2 text-white shadow-lg`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors group-hover:translate-x-1" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{section.description}</p>
              
              {section.subItems && (
                <div className="space-y-1">
                  {section.subItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center text-xs text-gray-500">
                      <item.icon className="h-3 w-3 mr-2" />
                      {item.title}
                    </div>
                  ))}
                  {section.subItems.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{section.subItems.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats and Recent Activity - Smaller cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-green-500" />
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentUploads.slice(0, 3).map((upload: any, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <Upload className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                      {upload.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {upload.records_successful} records
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(upload.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {stats.recentUploads.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No recent uploads</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Items - Smaller cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-bold text-gray-900">Demo Requests</h3>
            <div className="bg-yellow-100 rounded-full p-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingDemoRequests}</p>
          <p className="text-sm text-gray-600 mb-3">Pending review</p>
          <button
            onClick={() => setActiveSection('demo-requests')}
            className="w-full bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            Review
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-bold text-gray-900">Trial Users</h3>
            <div className="bg-blue-100 rounded-full p-2">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingTrials}</p>
          <p className="text-sm text-gray-600 mb-3">Active trials</p>
          <button
            onClick={() => setActiveSection('trials')}
            className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Manage
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 transform hover:scale-105 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-bold text-gray-900">Subscriptions</h3>
            <div className="bg-green-100 rounded-full p-2">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.activeSubscriptions}</p>
          <p className="text-sm text-gray-600 mb-3">Active</p>
          <button
            onClick={() => setActiveSection('subscriptions')}
            className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionMenu = (section: any) => (
    <div className="space-y-6">
      {/* Section Header */}
      <div className={`bg-gradient-to-r ${section.color} rounded-xl p-6 text-white shadow-2xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
            <p className="text-white text-opacity-90">{section.description}</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <section.icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards - Smaller and more modern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.subItems?.map((item: any) => (
          <div
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 p-4 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-r ${section.color} rounded-lg p-2 text-white shadow-lg`}>
                <item.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors group-hover:translate-x-1" />
            </div>
            
            <h3 className="text-md font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {item.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Click to access</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeSection === 'overview') {
      return renderOverview();
    }

    // Check if it's a main section (show submenu)
    const mainSection = menuSections.find(s => s.id === activeSection);
    if (mainSection && mainSection.subItems) {
      return renderSectionMenu(mainSection);
    }

    // Render specific content
    switch (activeSection) {
      case 'contracts-list':
        return <ContractsList />;
      case 'contacts-list':
        return <ContactsList />;
      case 'manual-contract':
        return <ManualEntryForms type="contract" onSuccess={handleDataUpdate} />;
      case 'manual-contact':
        return <ManualEntryForms type="contact" onSuccess={handleDataUpdate} />;
      case 'upload-contracts':
        return <BulkUpload type="opportunities" onUploadComplete={handleDataUpdate} />;
      case 'upload-contacts':
        return <BulkUpload type="contacts" onUploadComplete={handleDataUpdate} />;
      case 'user-access':
        return <UserAccessManagement />;
      case 'demo-requests':
      case 'trials':
        return <DemoTrialManagement />;
      case 'usa-map':
        return <USAMap />;
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">John Smith</h4>
                  <p className="text-sm text-gray-600">john.smith@company.com</p>
                  <p className="text-xs text-gray-500">Active Subscription - Monthly Plan</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">View</button>
                  <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">Suspend</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Monthly - $199</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">User Engagement</h4>
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-sm text-blue-700">Daily active users</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-green-600">34%</p>
                  <p className="text-sm text-green-700">Trial to paid</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Contract Engagement</h4>
                  <p className="text-2xl font-bold text-purple-600">92%</p>
                  <p className="text-sm text-purple-700">Users viewing contracts</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Auto Contract Sync</h4>
                  <p className="text-sm text-gray-600">Automatically sync contract data from government portals</p>
                </div>
                <button className="bg-green-500 text-white px-4 py-2 rounded">Enabled</button>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setActiveSection('overview')}
                className="flex items-center space-x-3 text-gray-900 hover:text-blue-600 transition-colors"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">FederalTalks IQ</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Admin</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">
                  {menuSections.find(s => s.id === activeSection)?.title || 
                   menuSections.find(s => s.subItems?.some(sub => sub.id === activeSection))?.subItems?.find(sub => sub.id === activeSection)?.title || 
                   'Dashboard'}
                </span>
              </div>

              {/* Back Button */}
              {activeSection !== 'overview' && (
                <button
                  onClick={() => setActiveSection('overview')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>
    </div>
  );
}