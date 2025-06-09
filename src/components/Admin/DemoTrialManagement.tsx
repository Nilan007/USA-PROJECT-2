import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Mail, Phone, Building, MessageSquare, 
  CheckCircle, XCircle, Clock, Eye, Send, Filter, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DemoRequest {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'demo_scheduled' | 'completed' | 'declined';
  created_at: string;
  updated_at: string;
}

interface TrialRequest {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  trial_days_remaining: number;
  is_active: boolean;
  created_at: string;
}

export default function DemoTrialManagement() {
  const [activeTab, setActiveTab] = useState<'demo' | 'trial'>('demo');
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'demo') {
      fetchDemoRequests();
    } else {
      fetchTrialRequests();
    }
  }, [activeTab]);

  const fetchDemoRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDemoRequests(data || []);
    } catch (error) {
      console.error('Error fetching demo requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, company_name, phone, trial_days_remaining, is_active, created_at')
        .gt('trial_days_remaining', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrialRequests(data || []);
    } catch (error) {
      console.error('Error fetching trial requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDemoStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('demo_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchDemoRequests();
    } catch (error) {
      console.error('Error updating demo status:', error);
    }
  };

  const handleApproveTrialExtension = async (userId: string, additionalDays: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          trial_days_remaining: additionalDays,
          is_active: true
        })
        .eq('id', userId);

      if (error) throw error;
      fetchTrialRequests();
      alert(`Trial extended by ${additionalDays} days`);
    } catch (error) {
      console.error('Error extending trial:', error);
    }
  };

  const handleConvertToSubscription = async (userId: string) => {
    try {
      // Create a subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: '1month',
          plan_price: 199,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          payment_method: 'manual'
        });

      if (subError) throw subError;

      // Update user status
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          trial_days_remaining: 0,
          is_active: true
        })
        .eq('id', userId);

      if (userError) throw userError;

      fetchTrialRequests();
      alert('User converted to paid subscription');
    } catch (error) {
      console.error('Error converting to subscription:', error);
    }
  };

  const sendResponse = async () => {
    if (!selectedRequest || !responseMessage.trim()) return;

    try {
      // In a real implementation, this would send an email
      // For now, we'll just update the status and show a success message
      await handleUpdateDemoStatus(selectedRequest.id, 'contacted');
      
      setShowResponseModal(false);
      setResponseMessage('');
      setSelectedRequest(null);
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const filteredDemoRequests = demoRequests.filter(request => {
    const matchesSearch = request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.company_name && request.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTrialRequests = trialRequests.filter(request => {
    const matchesSearch = request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.company_name && request.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'demo_scheduled': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'contacted': return <Mail className="h-4 w-4" />;
      case 'demo_scheduled': return <Calendar className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Demo & Trial Management</h2>
        <div className="text-sm text-gray-500">
          {activeTab === 'demo' ? filteredDemoRequests.length : filteredTrialRequests.length} requests
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'demo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-5 w-5 mr-2 inline" />
            Demo Requests
          </button>
          <button
            onClick={() => setActiveTab('trial')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trial'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5 mr-2 inline" />
            Trial Users
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {activeTab === 'demo' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="demo_scheduled">Demo Scheduled</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          )}
        </div>
      </div>

      {/* Demo Requests Table */}
      {activeTab === 'demo' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDemoRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.email}
                        </div>
                        {request.phone && (
                          <div className="text-sm text-gray-500">
                            {request.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.company_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                      {request.message || 'No message'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowResponseModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Send Response"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <select
                          value={request.status}
                          onChange={(e) => handleUpdateDemoStatus(request.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="demo_scheduled">Demo Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDemoRequests.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No demo requests found.</p>
            </div>
          )}
        </div>
      )}

      {/* Trial Users Table */}
      {activeTab === 'trial' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trial Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrialRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.email}
                        </div>
                        {request.phone && (
                          <div className="text-sm text-gray-500">
                            {request.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.company_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.trial_days_remaining > 3 ? 'bg-green-100 text-green-800' :
                        request.trial_days_remaining > 1 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.trial_days_remaining} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {request.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTrialExtension(request.id, 7)}
                          className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded"
                        >
                          +7 Days
                        </button>
                        <button
                          onClick={() => handleApproveTrialExtension(request.id, 14)}
                          className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded"
                        >
                          +14 Days
                        </button>
                        <button
                          onClick={() => handleConvertToSubscription(request.id)}
                          className="text-purple-600 hover:text-purple-900 text-xs px-2 py-1 border border-purple-300 rounded"
                        >
                          Convert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTrialRequests.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No trial users found.</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Demo Request Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded">
                    {selectedRequest.message || 'No message provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requested</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowResponseModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Send Response to {selectedRequest.full_name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Template</label>
                  <select
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a template...</option>
                    <option value={`Dear ${selectedRequest.full_name},\n\nThank you for your interest in FederalTalks IQ. We'd be happy to schedule a personalized demo for you.\n\nPlease let us know your preferred time slots and we'll coordinate accordingly.\n\nBest regards,\nFederalTalks IQ Team`}>
                      Demo Scheduling
                    </option>
                    <option value={`Dear ${selectedRequest.full_name},\n\nThank you for requesting a demo of FederalTalks IQ.\n\nWe've reviewed your requirements and believe our platform can significantly help your organization identify and win government contracts.\n\nI'll be reaching out shortly to schedule a convenient time for your demo.\n\nBest regards,\nFederalTalks IQ Team`}>
                      Initial Contact
                    </option>
                    <option value={`Dear ${selectedRequest.full_name},\n\nThank you for your interest in FederalTalks IQ.\n\nUnfortunately, we're unable to accommodate your demo request at this time due to capacity constraints.\n\nWe'll keep your information on file and reach out when we have availability.\n\nBest regards,\nFederalTalks IQ Team`}>
                      Decline Request
                    </option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={8}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Type your response message..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseMessage('');
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={sendResponse}
                  disabled={!responseMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}