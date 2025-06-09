import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Shield, Eye, EyeOff, 
  UserCheck, Settings, Lock, Unlock, Search, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface InternalUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'assistance' | 'admin_super_assistance' | 'admin_star_assistance';
  permissions: string[];
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function UserAccessManagement() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'assistance' as const,
    permissions: [] as string[]
  });
  const { user } = useAuth();

  const availablePermissions: Permission[] = [
    // Dashboard & Analytics
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access to analytics and reports', category: 'Dashboard' },
    
    // User Management
    { id: 'view_users', name: 'View Users', description: 'View user list and details', category: 'User Management' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, delete users', category: 'User Management' },
    { id: 'manage_subscriptions', name: 'Manage Subscriptions', description: 'Handle user subscriptions', category: 'User Management' },
    { id: 'manage_trials', name: 'Manage Trials', description: 'Approve/deny trial requests', category: 'User Management' },
    { id: 'manage_demo_requests', name: 'Manage Demo Requests', description: 'Handle demo requests', category: 'User Management' },
    
    // Contract Management
    { id: 'view_contracts', name: 'View Contracts', description: 'View contract listings', category: 'Contract Management' },
    { id: 'add_contracts', name: 'Add Contracts', description: 'Create new contracts manually', category: 'Contract Management' },
    { id: 'edit_contracts', name: 'Edit Contracts', description: 'Modify existing contracts', category: 'Contract Management' },
    { id: 'delete_contracts', name: 'Delete Contracts', description: 'Remove contracts', category: 'Contract Management' },
    { id: 'upload_contracts', name: 'Upload Contracts', description: 'Bulk upload contracts', category: 'Contract Management' },
    { id: 'manage_contract_updates', name: 'Manage Contract Updates', description: 'Add and publish contract updates', category: 'Contract Management' },
    
    // Contact Management
    { id: 'view_contacts', name: 'View Contacts', description: 'View contact listings', category: 'Contact Management' },
    { id: 'add_contacts', name: 'Add Contacts', description: 'Create new contacts manually', category: 'Contact Management' },
    { id: 'edit_contacts', name: 'Edit Contacts', description: 'Modify existing contacts', category: 'Contact Management' },
    { id: 'delete_contacts', name: 'Delete Contacts', description: 'Remove contacts', category: 'Contact Management' },
    { id: 'upload_contacts', name: 'Upload Contacts', description: 'Bulk upload contacts', category: 'Contact Management' },
    
    // System Settings
    { id: 'view_settings', name: 'View Settings', description: 'Access system settings', category: 'System' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Modify system settings', category: 'System' },
    { id: 'manage_data_sources', name: 'Manage Data Sources', description: 'Configure data sources', category: 'System' },
    { id: 'view_upload_logs', name: 'View Upload Logs', description: 'Access upload history', category: 'System' },
    
    // Internal User Management
    { id: 'manage_internal_users', name: 'Manage Internal Users', description: 'Create and manage internal users', category: 'Internal' }
  ];

  useEffect(() => {
    fetchInternalUsers();
    setPermissions(availablePermissions);
  }, []);

  const fetchInternalUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInternalUsers(data || []);
    } catch (error) {
      console.error('Error fetching internal users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('internal_users')
        .insert([{
          email: newUser.email,
          password_hash: newUser.password, // In production, hash this properly
          full_name: newUser.full_name,
          role: newUser.role,
          permissions: newUser.permissions,
          is_active: true,
          created_by: user?.id
        }]);

      if (error) throw error;

      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'assistance',
        permissions: []
      });
      setShowCreateModal(false);
      fetchInternalUsers();
      alert('Internal user created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<InternalUser>) => {
    try {
      const { error } = await supabase
        .from('internal_users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      
      fetchInternalUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this internal user?')) return;

    try {
      const { error } = await supabase
        .from('internal_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchInternalUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await handleUpdateUser(userId, { is_active: !currentStatus });
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'assistance':
        return [
          'view_dashboard',
          'view_contracts',
          'view_contacts',
          'add_contracts',
          'add_contacts'
        ];
      case 'admin_super_assistance':
        return [
          'view_dashboard',
          'view_analytics',
          'view_contracts',
          'view_contacts',
          'add_contracts',
          'add_contacts',
          'edit_contracts',
          'edit_contacts',
          'upload_contracts',
          'upload_contacts',
          'view_users',
          'manage_trials',
          'manage_demo_requests'
        ];
      case 'admin_star_assistance':
        return availablePermissions.map(p => p.id).filter(id => id !== 'manage_internal_users');
      default:
        return [];
    }
  };

  const filteredUsers = internalUsers.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'assistance': return 'Assistance';
      case 'admin_super_assistance': return 'Admin Super Assistance';
      case 'admin_star_assistance': return 'Admin Star Assistance';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'assistance': return 'bg-blue-100 text-blue-800';
      case 'admin_super_assistance': return 'bg-purple-100 text-purple-800';
      case 'admin_star_assistance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading user access management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Access Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Internal User
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="assistance">Assistance</option>
            <option value="admin_super_assistance">Admin Super Assistance</option>
            <option value="admin_star_assistance">Admin Star Assistance</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredUsers.length} Internal Users
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.permissions?.length || 0} permissions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No internal users found.</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Internal User</h3>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUser.full_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => {
                        const role = e.target.value as any;
                        setNewUser(prev => ({ 
                          ...prev, 
                          role,
                          permissions: getRolePermissions(role)
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="assistance">Assistance</option>
                      <option value="admin_super_assistance">Admin Super Assistance</option>
                      <option value="admin_star_assistance">Admin Star Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                    {Object.entries(
                      availablePermissions.reduce((acc, permission) => {
                        if (!acc[permission.category]) acc[permission.category] = [];
                        acc[permission.category].push(permission);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <label key={permission.id} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={newUser.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUser(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission.id]
                                    }));
                                  } else {
                                    setNewUser(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission.id)
                                    }));
                                  }
                                }}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit User: {selectedUser.full_name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => {
                      const role = e.target.value as any;
                      setSelectedUser(prev => prev ? { 
                        ...prev, 
                        role,
                        permissions: getRolePermissions(role)
                      } : null);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="assistance">Assistance</option>
                    <option value="admin_super_assistance">Admin Super Assistance</option>
                    <option value="admin_star_assistance">Admin Star Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                    {Object.entries(
                      availablePermissions.reduce((acc, permission) => {
                        if (!acc[permission.category]) acc[permission.category] = [];
                        acc[permission.category].push(permission);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <label key={permission.id} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedUser.permissions?.includes(permission.id) || false}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUser(prev => prev ? {
                                      ...prev,
                                      permissions: [...(prev.permissions || []), permission.id]
                                    } : null);
                                  } else {
                                    setSelectedUser(prev => prev ? {
                                      ...prev,
                                      permissions: (prev.permissions || []).filter(p => p !== permission.id)
                                    } : null);
                                  }
                                }}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(selectedUser.id, selectedUser)}
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