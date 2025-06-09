import React, { useState, useEffect } from 'react';
import { Search, Building, MapPin, Phone, Mail, Upload } from 'lucide-react';
import { supabase, Contact } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    contactType: 'all',
    state: 'all',
    isFederal: 'all'
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.contactType === 'all' || contact.contact_type === filters.contactType;
    const matchesState = filters.state === 'all' || contact.state === filters.state;
    const matchesFederal = filters.isFederal === 'all' || 
                          (filters.isFederal === 'federal' && contact.is_federal) ||
                          (filters.isFederal === 'state' && !contact.is_federal);
    
    return matchesSearch && matchesType && matchesState && matchesFederal;
  });

  const contactTypes = [
    { value: 'cio', label: 'Chief Information Officer' },
    { value: 'cto', label: 'Chief Technology Officer' },
    { value: 'cpo', label: 'Chief Procurement Officer' },
    { value: 'procurement', label: 'Procurement Officer' },
    { value: 'director', label: 'Director' }
  ];

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const getContactTypeLabel = (type: string) => {
    const contactType = contactTypes.find(ct => ct.value === type);
    return contactType ? contactType.label : type.toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Government Contacts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Directory of key procurement officials and decision makers
            </p>
          </div>
          
          {isAdmin && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-4 w-4 mr-2" />
              Upload Contacts
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filters.contactType}
            onChange={(e) => setFilters(prev => ({ ...prev, contactType: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Positions</option>
            {contactTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filters.isFederal}
            onChange={(e) => setFilters(prev => ({ ...prev, isFederal: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Federal & State</option>
            <option value="federal">Federal Only</option>
            <option value="state">State Only</option>
          </select>
        </div>

        <div className="mt-4">
          <select
            value={filters.state}
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredContacts.length} Contacts Found
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    {contact.full_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {getContactTypeLabel(contact.contact_type)}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-2">{contact.agency}</span>
                  </div>
                  
                  {contact.state && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      {contact.state}
                    </div>
                  )}
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contact.is_federal 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {contact.is_federal ? 'Federal' : 'State'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="hover:text-blue-600 truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="hover:text-blue-600"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
              
              {contact.department && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Department: {contact.department}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}