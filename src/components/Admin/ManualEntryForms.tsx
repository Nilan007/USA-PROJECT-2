import React, { useState } from 'react';
import { Plus, Save, X, FileText, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ManualEntryFormsProps {
  type: 'contract' | 'contact';
  onSuccess: () => void;
}

export default function ManualEntryForms({ type, onSuccess }: ManualEntryFormsProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    type === 'contract' 
      ? {
          // Basic Information
          title: '',
          contract_name: '',
          description: '',
          
          // Organization Information
          agency: '',
          buying_organization: '',
          department: '',
          state: '',
          contract_type: 'federal',
          
          // Organization Levels
          buying_org_level_1: '',
          buying_org_level_2: '',
          buying_org_level_3: '',
          
          // Contract Details
          contract_number: '',
          solicitation_number: '',
          contractors: '',
          products_services: '',
          primary_requirement: '',
          place_of_performance_location: '',
          
          // Contact Information
          contact_first_name: '',
          contact_phone: '',
          contact_email: '',
          
          // Financial Information
          budget_min: '',
          budget_max: '',
          award_value: '',
          naics_code: '',
          set_aside_code: '',
          
          // Important Dates
          award_date: '',
          start_date: '',
          current_expiration_date: '',
          ultimate_expiration_date: '',
          response_deadline: '',
          
          // Status and Additional Information
          status: 'active',
          contract_status: 'open',
          source_url: '',
          
          // AI and Research
          ai_analysis_summary: '',
          keywords: ''
        }
      : {
          full_name: '',
          title: '',
          agency: '',
          department: '',
          state: '',
          email: '',
          phone: '',
          contact_type: 'procurement',
          is_federal: false
        }
  );
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'contract') {
        // Validate required fields
        if (!formData.title || !formData.agency) {
          alert('Please fill in at least the title and agency fields.');
          setLoading(false);
          return;
        }

        const contractData = {
          // Basic Information
          title: formData.title,
          contract_name: formData.contract_name || formData.title,
          description: formData.description || null,
          
          // Organization Information
          agency: formData.agency,
          buying_organization: formData.buying_organization || formData.agency,
          department: formData.department || null,
          state: formData.state || null,
          contract_type: formData.contract_type,
          
          // Organization Levels
          buying_org_level_1: formData.buying_org_level_1 || null,
          buying_org_level_2: formData.buying_org_level_2 || null,
          buying_org_level_3: formData.buying_org_level_3 || null,
          
          // Contract Details
          contract_number: formData.contract_number || null,
          solicitation_number: formData.solicitation_number || null,
          contractors: formData.contractors || null,
          products_services: formData.products_services || null,
          primary_requirement: formData.primary_requirement || null,
          place_of_performance_location: formData.place_of_performance_location || null,
          
          // Contact Information
          contact_first_name: formData.contact_first_name || null,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          
          // Financial Information
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          award_value: formData.award_value ? parseFloat(formData.award_value) : null,
          naics_code: formData.naics_code || null,
          set_aside_code: formData.set_aside_code || null,
          
          // Important Dates
          award_date: formData.award_date || null,
          start_date: formData.start_date || null,
          current_expiration_date: formData.current_expiration_date || null,
          ultimate_expiration_date: formData.ultimate_expiration_date || null,
          response_deadline: formData.response_deadline || null,
          
          // Status and Additional Information
          status: formData.status,
          contract_status: formData.contract_status,
          source_url: formData.source_url || null,
          
          // AI and Research
          ai_analysis_summary: formData.ai_analysis_summary || null,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : null,
          
          // System fields
          data_source: 'manual',
          updated_by: user?.id,
          posted_date: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };

        const { error } = await supabase
          .from('contracts')
          .insert([contractData]);

        if (error) throw error;
      } else {
        // Validate required fields for contacts
        if (!formData.full_name || !formData.title || !formData.agency) {
          alert('Please fill in the full name, title, and agency fields.');
          setLoading(false);
          return;
        }

        const contactData = {
          ...formData,
          data_source: 'manual'
        };

        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);

        if (error) throw error;
      }

      // Reset form
      setFormData(
        type === 'contract' 
          ? {
              // Basic Information
              title: '',
              contract_name: '',
              description: '',
              
              // Organization Information
              agency: '',
              buying_organization: '',
              department: '',
              state: '',
              contract_type: 'federal',
              
              // Organization Levels
              buying_org_level_1: '',
              buying_org_level_2: '',
              buying_org_level_3: '',
              
              // Contract Details
              contract_number: '',
              solicitation_number: '',
              contractors: '',
              products_services: '',
              primary_requirement: '',
              place_of_performance_location: '',
              
              // Contact Information
              contact_first_name: '',
              contact_phone: '',
              contact_email: '',
              
              // Financial Information
              budget_min: '',
              budget_max: '',
              award_value: '',
              naics_code: '',
              set_aside_code: '',
              
              // Important Dates
              award_date: '',
              start_date: '',
              current_expiration_date: '',
              ultimate_expiration_date: '',
              response_deadline: '',
              
              // Status and Additional Information
              status: 'active',
              contract_status: 'open',
              source_url: '',
              
              // AI and Research
              ai_analysis_summary: '',
              keywords: ''
            }
          : {
              full_name: '',
              title: '',
              agency: '',
              department: '',
              state: '',
              email: '',
              phone: '',
              contact_type: 'procurement',
              is_federal: false
            }
      );
      
      setShowForm(false);
      onSuccess();
      alert(`${type === 'contract' ? 'Contract' : 'Contact'} added successfully!`);
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      alert(`Error adding ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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

  const setAsideCodes = [
    { code: 'SBA', name: 'Total Small Business Set-Aside' },
    { code: '8A', name: '8(a) Set-Aside' },
    { code: 'HZC', name: 'HUBZone Set-Aside' },
    { code: 'SDVOSBC', name: 'Service-Disabled Veteran-Owned Small Business' },
    { code: 'WOSB', name: 'Women-Owned Small Business' },
    { code: 'EDWOSB', name: 'Economically Disadvantaged WOSB' }
  ];

  const contactTypes = [
    { value: 'cio', label: 'Chief Information Officer' },
    { value: 'cto', label: 'Chief Technology Officer' },
    { value: 'cpo', label: 'Chief Procurement Officer' },
    { value: 'procurement', label: 'Procurement Officer' },
    { value: 'director', label: 'Director' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {type === 'contract' ? (
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
          ) : (
            <Users className="h-6 w-6 text-green-600 mr-2" />
          )}
          <h3 className="text-lg font-medium text-gray-900">
            Manual {type === 'contract' ? 'Contract' : 'Contact'} Entry
          </h3>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {type === 'contract' ? 'Contract' : 'Contact'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'contract' ? (
            <>
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contract title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contract Name</label>
                    <input
                      type="text"
                      name="contract_name"
                      value={formData.contract_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Official contract name"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Contract description and requirements"
                  />
                </div>
              </div>

              {/* Organization Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Organization Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency *</label>
                    <input
                      type="text"
                      name="agency"
                      required
                      value={formData.agency}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contracting agency"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buying Organization</label>
                    <input
                      type="text"
                      name="buying_organization"
                      value={formData.buying_organization}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Buying organization name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buying Org: Level 1</label>
                    <input
                      type="text"
                      name="buying_org_level_1"
                      value={formData.buying_org_level_1}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Top level organization"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buying Org: Level 2</label>
                    <input
                      type="text"
                      name="buying_org_level_2"
                      value={formData.buying_org_level_2}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Second level organization"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buying Org: Level 3</label>
                    <input
                      type="text"
                      name="buying_org_level_3"
                      value={formData.buying_org_level_3}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Third level organization"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Department name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contract Type</label>
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="federal">Federal</option>
                      <option value="state">State</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Contract Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contract Number</label>
                    <input
                      type="text"
                      name="contract_number"
                      value={formData.contract_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Official contract number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solicitation Number</label>
                    <input
                      type="text"
                      name="solicitation_number"
                      value={formData.solicitation_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="RFP/Solicitation number"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Contractors</label>
                  <input
                    type="text"
                    name="contractors"
                    value={formData.contractors}
                    onChange={handleInputChange}
                    placeholder="Enter contractor names separated by commas"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Products & Services</label>
                    <textarea
                      name="products_services"
                      rows={2}
                      value={formData.products_services}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Products and services required"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Requirement</label>
                    <textarea
                      name="primary_requirement"
                      rows={2}
                      value={formData.primary_requirement}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Main requirement description"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Place of Performance - Location</label>
                  <input
                    type="text"
                    name="place_of_performance_location"
                    value={formData.place_of_performance_location}
                    onChange={handleInputChange}
                    placeholder="e.g., Sacramento, CA"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact First Name</label>
                    <input
                      type="text"
                      name="contact_first_name"
                      value={formData.contact_first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Procurement officer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contact phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contact email address"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Min ($)</label>
                    <input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Minimum budget"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Max ($)</label>
                    <input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Maximum budget"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Award Value ($)</label>
                    <input
                      type="number"
                      name="award_value"
                      value={formData.award_value}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Actual award value"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NAICS Code</label>
                    <input
                      type="text"
                      name="naics_code"
                      value={formData.naics_code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="NAICS industry code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Set-Aside Code</label>
                    <select
                      name="set_aside_code"
                      value={formData.set_aside_code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Set-Aside</option>
                      {setAsideCodes.map(code => (
                        <option key={code.code} value={code.code}>{code.code} - {code.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Important Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Award Date</label>
                    <input
                      type="date"
                      name="award_date"
                      value={formData.award_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response Deadline</label>
                    <input
                      type="datetime-local"
                      name="response_deadline"
                      value={formData.response_deadline}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Expiration Date</label>
                    <input
                      type="date"
                      name="current_expiration_date"
                      value={formData.current_expiration_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ultimate Expiration Date</label>
                    <input
                      type="date"
                      name="ultimate_expiration_date"
                      value={formData.ultimate_expiration_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Additional Information */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Status & Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
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
                      name="contract_status"
                      value={formData.contract_status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="awarded">Awarded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source URL</label>
                    <input
                      type="url"
                      name="source_url"
                      value={formData.source_url}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Source URL"
                    />
                  </div>
                </div>
              </div>

              {/* AI and Research */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">AI Analysis & Research</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">AI Analysis Summary</label>
                    <textarea
                      name="ai_analysis_summary"
                      rows={4}
                      value={formData.ai_analysis_summary}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="AI-generated analysis and insights"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keywords</label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter keywords separated by commas"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agency *</label>
                  <input
                    type="text"
                    name="agency"
                    required
                    value={formData.agency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Type</label>
                  <select
                    name="contact_type"
                    value={formData.contact_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {contactTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="is_federal"
                    checked={formData.is_federal}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Federal Contact
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              {loading ? 'Saving...' : `Save ${type === 'contract' ? 'Contract' : 'Contact'}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}