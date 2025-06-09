import React, { useState, useEffect } from 'react';
import { 
  Search, Edit, Eye, Trash2, FileText, Calendar, DollarSign, 
  Building, MapPin, Tag, ExternalLink, Plus, Upload
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
  data_source?: string;
  last_updated: string;
  created_at: string;
  // New fields
  award_date?: string;
  contract_name?: string;
  buying_organization?: string;
  contractors?: string;
  contract_number?: string;
  products_services?: string;
  primary_requirement?: string;
  start_date?: string;
  current_expiration_date?: string;
  ultimate_expiration_date?: string;
  award_value?: number;
  // Additional new fields
  buying_org_level_1?: string;
  buying_org_level_2?: string;
  buying_org_level_3?: string;
  place_of_performance_location?: string;
  contact_first_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export default function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchContracts();
  }, []);

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

  const handleUpdateContract = async (contractId: string, updates: Partial<Contract>) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ ...updates, updated_by: user?.id, last_updated: new Date().toISOString() })
        .eq('id', contractId);

      if (error) throw error;
      
      fetchContracts();
      setShowEditModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.federal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contract.contract_name && contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (contract.contractors && contract.contractors.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        <h2 className="text-2xl font-bold text-gray-900">All Contracts</h2>
        <div className="text-sm text-gray-500">
          {filteredContracts.length} contracts found
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Federal ID, title, agency, contract name, or contractors..."
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

      {/* Contracts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Award Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contractors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products & Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Requirement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Expiration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ultimate Expiration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Award Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Org: Level 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Org: Level 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Org: Level 3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitation Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Place of Performance - Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.award_date ? new Date(contract.award_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contract.contract_name || contract.title}
                    </div>
                    <div className="text-sm text-blue-600 font-mono">
                      {contract.federal_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.buying_organization || contract.agency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contractors || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contract_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                    {contract.products_services || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                    {contract.primary_requirement || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.current_expiration_date ? new Date(contract.current_expiration_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.ultimate_expiration_date ? new Date(contract.ultimate_expiration_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.award_value ? `$${contract.award_value.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.buying_org_level_1 || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.buying_org_level_2 || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.buying_org_level_3 || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.solicitation_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.place_of_performance_location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contact_first_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contact_phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contact_email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContract(contract.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {contract.source_url && (
                        <a
                          href={contract.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                          title="View Source"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contracts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contract Details: {selectedContract.federal_id}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Contract Name:</strong> {selectedContract.contract_name || 'N/A'}</div>
                    <div><strong>Title:</strong> {selectedContract.title}</div>
                    <div><strong>Federal ID:</strong> {selectedContract.federal_id}</div>
                    <div><strong>Contract Number:</strong> {selectedContract.contract_number || 'N/A'}</div>
                    <div><strong>Solicitation Number:</strong> {selectedContract.solicitation_number || 'N/A'}</div>
                    <div><strong>Status:</strong> {selectedContract.status}</div>
                    <div><strong>Contract Status:</strong> {selectedContract.contract_status}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Organization</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Buying Organization:</strong> {selectedContract.buying_organization || selectedContract.agency}</div>
                    <div><strong>Buying Org Level 1:</strong> {selectedContract.buying_org_level_1 || 'N/A'}</div>
                    <div><strong>Buying Org Level 2:</strong> {selectedContract.buying_org_level_2 || 'N/A'}</div>
                    <div><strong>Buying Org Level 3:</strong> {selectedContract.buying_org_level_3 || 'N/A'}</div>
                    <div><strong>Agency:</strong> {selectedContract.agency}</div>
                    <div><strong>Department:</strong> {selectedContract.department || 'N/A'}</div>
                    <div><strong>Contractors:</strong> {selectedContract.contractors || 'N/A'}</div>
                    <div><strong>State:</strong> {selectedContract.state || 'N/A'}</div>
                    <div><strong>Type:</strong> {selectedContract.contract_type}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Contact First Name:</strong> {selectedContract.contact_first_name || 'N/A'}</div>
                    <div><strong>Contact Phone:</strong> {selectedContract.contact_phone || 'N/A'}</div>
                    <div><strong>Contact Email:</strong> {selectedContract.contact_email || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location & Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Place of Performance:</strong> {selectedContract.place_of_performance_location || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Financial Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Award Value:</strong> {selectedContract.award_value ? `$${selectedContract.award_value.toLocaleString()}` : 'N/A'}</div>
                    <div><strong>Budget Range:</strong> {selectedContract.budget_min && selectedContract.budget_max ? `$${selectedContract.budget_min.toLocaleString()} - $${selectedContract.budget_max.toLocaleString()}` : 'N/A'}</div>
                    <div><strong>NAICS Code:</strong> {selectedContract.naics_code || 'N/A'}</div>
                    <div><strong>Set-Aside:</strong> {selectedContract.set_aside_code || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Important Dates</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Award Date:</strong> {selectedContract.award_date ? new Date(selectedContract.award_date).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Start Date:</strong> {selectedContract.start_date ? new Date(selectedContract.start_date).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Current Expiration:</strong> {selectedContract.current_expiration_date ? new Date(selectedContract.current_expiration_date).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Ultimate Expiration:</strong> {selectedContract.ultimate_expiration_date ? new Date(selectedContract.ultimate_expiration_date).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Response Deadline:</strong> {selectedContract.response_deadline ? new Date(selectedContract.response_deadline).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Products & Services</h4>
                  <div className="text-sm text-gray-700">
                    {selectedContract.products_services || 'N/A'}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Primary Requirement</h4>
                  <div className="text-sm text-gray-700">
                    {selectedContract.primary_requirement || 'N/A'}
                  </div>
                </div>
                
                {selectedContract.description && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <div className="text-sm text-gray-700">
                      {selectedContract.description}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedContract(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Contract: {selectedContract.federal_id}
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedContract.status}
                    onChange={(e) => setSelectedContract(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="forecast">Forecast</option>
                    <option value="tracked">Tracked</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Status</label>
                  <select
                    value={selectedContract.contract_status}
                    onChange={(e) => setSelectedContract(prev => prev ? { ...prev, contract_status: e.target.value as any } : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="awarded">Awarded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Name</label>
                  <input
                    type="text"
                    value={selectedContract.contract_name || ''}
                    onChange={(e) => setSelectedContract(prev => prev ? { ...prev, contract_name: e.target.value } : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Award Value</label>
                  <input
                    type="number"
                    value={selectedContract.award_value || ''}
                    onChange={(e) => setSelectedContract(prev => prev ? { ...prev, award_value: parseFloat(e.target.value) || undefined } : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Award Date</label>
                    <input
                      type="date"
                      value={selectedContract.award_date ? new Date(selectedContract.award_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedContract(prev => prev ? { ...prev, award_date: e.target.value } : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={selectedContract.start_date ? new Date(selectedContract.start_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedContract(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContract(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateContract(selectedContract.id, selectedContract)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}