import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = 'https://igzxtsuheqxtmiwqnqvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnenh0c3VoZXF4dG1pd3FucXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTc5NDMsImV4cCI6MjA2NTAzMzk0M30.bHj5_Fkwb9jeZa9A04UiOUuQPRA3Np38kK6BBTaWww8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  trial_days_remaining: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'trial' | '1month' | '3months' | '6months' | '9months' | '1year';
  plan_price: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  payment_method?: string;
  payment_id?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  agency: string;
  department?: string;
  state?: string;
  opportunity_type: 'federal' | 'state';
  budget_min?: number;
  budget_max?: number;
  naics_code?: string;
  set_aside_code?: string;
  solicitation_number?: string;
  response_deadline?: string;
  posted_date: string;
  source_url?: string;
  ai_analysis_summary?: string;
  keywords?: string[];
  status: 'active' | 'closed' | 'cancelled';
  data_source?: string;
  last_updated?: string;
  created_at: string;
}

export interface Contract {
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
  ai_analysis_summary?: string;
  keywords?: string[];
  status: 'active' | 'forecast' | 'tracked' | 'closed' | 'cancelled';
  contract_status: 'open' | 'awarded' | 'cancelled';
  data_source?: string;
  last_updated: string;
  created_at: string;
  updated_by?: string;
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

export interface Contact {
  id: string;
  full_name: string;
  title: string;
  agency: string;
  department?: string;
  state?: string;
  email?: string;
  phone?: string;
  contact_type: 'cio' | 'cto' | 'cpo' | 'procurement' | 'director';
  is_federal: boolean;
  data_source?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
}

export interface UserReminder {
  id: string;
  user_id: string;
  opportunity_id: string;
  reminder_date: string;
  message?: string;
  is_sent: boolean;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  color: string;
  created_at: string;
}

export interface PipelineOpportunity {
  id: string;
  pipeline_id: string;
  opportunity_id: string;
  stage_id: string;
  assigned_to?: string;
  notes?: string;
  probability: number;
  estimated_value?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  member_email: string;
  member_name: string;
  role: string;
  is_active: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  source_type: 'federal' | 'state';
  state_code?: string;
  is_active: boolean;
  last_scraped?: string;
  scrape_frequency_hours: number;
}

export interface UploadLog {
  id: string;
  uploaded_by: string;
  file_name: string;
  file_type: string;
  records_processed: number;
  records_successful: number;
  records_failed: number;
  error_details?: any;
  upload_type: 'opportunities' | 'contacts';
  created_at: string;
}

export interface DemoRequest {
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

// Real-time data fetching functions
export const fetchRealTimeOpportunities = async () => {
  try {
    // This would integrate with actual APIs in production
    const sources = [
      'https://api.sam.gov/opportunities/v2/search',
      'https://api.usaspending.gov/api/v2/search/spending_by_award/',
      // Add more federal and state APIs
    ];

    // For now, return empty array - in production this would fetch from actual APIs
    return [];
  } catch (error) {
    console.error('Error fetching real-time opportunities:', error);
    return [];
  }
};

export const fetchAIAnalysis = async (opportunity: Opportunity) => {
  try {
    // This would integrate with OpenAI API in production
    const prompt = `Analyze this government contract opportunity:
    Title: ${opportunity.title}
    Agency: ${opportunity.agency}
    Budget: $${opportunity.budget_min?.toLocaleString()} - $${opportunity.budget_max?.toLocaleString()}
    NAICS: ${opportunity.naics_code}
    Description: ${opportunity.description}
    
    Provide detailed analysis including market intelligence, competition assessment, and strategic recommendations.`;

    // Mock AI response for demo
    return `
**Contract Analysis Report**

**Opportunity Overview:**
${opportunity.title} represents a significant procurement opportunity with ${opportunity.agency}.

**Key Insights:**
• **Budget Range:** $${opportunity.budget_min?.toLocaleString()} - $${opportunity.budget_max?.toLocaleString()}
• **NAICS Code:** ${opportunity.naics_code || 'Not specified'}
• **Set-Aside:** ${opportunity.set_aside_code || 'Not specified'}
• **Competition Level:** Moderate to High

**Strategic Recommendations:**
1. **Past Performance:** Research similar contracts with this agency
2. **Key Personnel:** Identify decision makers and technical evaluators
3. **Partnership Opportunities:** Consider teaming arrangements
4. **Compliance Requirements:** Review all mandatory requirements

**Market Intelligence:**
• Similar contracts typically see 8-15 proposals
• Agency prefers vendors with federal experience
• Strong emphasis on cybersecurity and compliance
• Previous awards show preference for small business participation

**Risk Assessment:**
• **Low Risk:** Clear requirements and established process
• **Medium Risk:** Competitive market with incumbents
• **Mitigation:** Focus on unique value proposition

**Next Steps:**
1. Attend pre-proposal conference if scheduled
2. Submit capability statement to contracting officer
3. Begin teaming discussions with partners
4. Prepare preliminary technical approach
    `;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return 'Error generating AI analysis. Please try again.';
  }
};

// Enhanced file parsing utilities for CSV and Excel
export const parseFileData = (file: File, type: 'opportunities' | 'contacts'): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const data = parseCSVData(csvText, type);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to the same format as CSV parsing
          const parsedData = parseExcelData(jsonData, type);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please use CSV, XLS, or XLSX files.'));
    }
  });
};

export const parseCSVData = (csvText: string, type: 'opportunities' | 'contacts') => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/\s+/g, '_'));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      data.push(record);
    }
  }

  return data;
};

export const parseExcelData = (jsonData: any[][], type: 'opportunities' | 'contacts') => {
  if (jsonData.length === 0) return [];
  
  const headers = jsonData[0].map((h: any) => 
    String(h).trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );
  const data = [];

  for (let i = 1; i < jsonData.length; i++) {
    if (jsonData[i] && jsonData[i].some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = jsonData[i][index] ? String(jsonData[i][index]).trim() : '';
      });
      data.push(record);
    }
  }

  return data;
};

export const validateUploadData = (data: any[], type: 'opportunities' | 'contacts') => {
  const errors: string[] = [];
  const validRecords: any[] = [];

  if (type === 'opportunities') {
    const requiredFields = ['title', 'agency'];
    
    data.forEach((record, index) => {
      const missing = requiredFields.filter(field => {
        const fieldVariations = [
          field,
          field.replace('_', ' '),
          field.replace('_', ''),
          `contract_${field}`,
          `opportunity_${field}`
        ];
        return !fieldVariations.some(variation => record[variation] || record[variation.toLowerCase()]);
      });
      
      if (missing.length > 0) {
        errors.push(`Row ${index + 2}: Missing required fields: ${missing.join(', ')}`);
      } else {
        // Comprehensive field mapping for contracts
        const mappedRecord = {
          // Basic Information
          title: record.title || record.contract_title || record.opportunity_title || record.contract_name || '',
          contract_name: record.contract_name || record.title || record.contract_title || '',
          description: record.description || record.contract_description || record.opportunity_description || record.summary || '',
          
          // Organization Information
          agency: record.agency || record.contracting_agency || record.issuing_agency || record.buying_organization || '',
          buying_organization: record.buying_organization || record.agency || record.contracting_agency || '',
          department: record.department || record.contracting_department || record.division || '',
          state: record.state || record.contract_state || record.location || record.performance_state || '',
          contract_type: (record.contract_type || record.opportunity_type || record.type || 'federal').toLowerCase() === 'state' ? 'state' : 'federal',
          
          // Organization Levels
          buying_org_level_1: record.buying_org_level_1 || record['buying_org:_level_1'] || record.buying_org_1 || '',
          buying_org_level_2: record.buying_org_level_2 || record['buying_org:_level_2'] || record.buying_org_2 || '',
          buying_org_level_3: record.buying_org_level_3 || record['buying_org:_level_3'] || record.buying_org_3 || '',
          
          // Contract Details
          contract_number: record.contract_number || record.contract_id || record.award_number || '',
          solicitation_number: record.solicitation_number || record.rfp_number || record.solicitation_id || '',
          contractors: record.contractors || record.contractor || record.vendor || record.awardee || '',
          products_services: record.products_services || record['products_&_services'] || record.products_and_services || record.scope || '',
          primary_requirement: record.primary_requirement || record.main_requirement || record.key_requirement || '',
          place_of_performance_location: record.place_of_performance_location || record['place_of_performance_-_location'] || record.performance_location || record.work_location || '',
          
          // Contact Information
          contact_first_name: record.contact_first_name || record.contact_name || record.poc_name || '',
          contact_phone: record.contact_phone || record.contact_telephone || record.phone || '',
          contact_email: record.contact_email || record.contact_mail || record.email || '',
          
          // Financial Information
          budget_min: parseFloat(record.budget_min || record.minimum_budget || record.min_value || record.floor_value || '0') || null,
          budget_max: parseFloat(record.budget_max || record.maximum_budget || record.max_value || record.ceiling_value || record.contract_value || '0') || null,
          award_value: parseFloat(record.award_value || record.total_value || record.contract_amount || '0') || null,
          naics_code: record.naics_code || record.naics || record.industry_code || '',
          set_aside_code: record.set_aside_code || record.set_aside || record.small_business || '',
          
          // Important Dates
          award_date: record.award_date || record.date_awarded || null,
          start_date: record.start_date || record.performance_start || record.begin_date || null,
          current_expiration_date: record.current_expiration_date || record.expiration_date || record.end_date || null,
          ultimate_expiration_date: record.ultimate_expiration_date || record.final_expiration || record.ultimate_end || null,
          response_deadline: record.response_deadline || record.deadline || record.due_date || record.submission_deadline || null,
          
          // Status and Additional Information
          status: record.status || 'active',
          contract_status: record.contract_status || 'open',
          source_url: record.source_url || record.url || record.link || record.reference_url || '',
          
          // AI and Research
          ai_analysis_summary: record.ai_analysis_summary || record.analysis || record.ai_summary || '',
          keywords: record.keywords || record.tags || record.categories || '',
          
          // System fields
          data_source: 'upload',
          posted_date: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };
        
        validRecords.push(mappedRecord);
      }
    });
  } else if (type === 'contacts') {
    const requiredFields = ['full_name', 'title', 'agency'];
    
    data.forEach((record, index) => {
      const missing = requiredFields.filter(field => {
        const fieldVariations = [
          field,
          field.replace('_', ' '),
          field.replace('_', ''),
          `contact_${field}`
        ];
        return !fieldVariations.some(variation => record[variation] || record[variation.toLowerCase()]);
      });
      
      if (missing.length > 0) {
        errors.push(`Row ${index + 2}: Missing required fields: ${missing.join(', ')}`);
      } else {
        // Map common field variations for contacts
        const mappedRecord = {
          full_name: record.full_name || record.name || record.contact_name || record.person_name || '',
          title: record.title || record.position || record.job_title || record.role || '',
          agency: record.agency || record.organization || record.department || record.company || '',
          department: record.department || record.division || record.office || record.unit || '',
          state: record.state || record.location || record.state_province || '',
          email: record.email || record.email_address || record.contact_email || '',
          phone: record.phone || record.phone_number || record.telephone || record.contact_phone || '',
          contact_type: record.contact_type || record.position_type || record.type || 'procurement',
          is_federal: (record.is_federal || record.federal || record.government_level || 'false').toString().toLowerCase() === 'true' || 
                     (record.is_federal || record.federal || record.government_level) === '1' ||
                     (record.is_federal || record.federal || record.government_level) === 1,
          data_source: 'upload'
        };
        
        validRecords.push(mappedRecord);
      }
    });
  }

  return { validRecords, errors };
};

// Generate template files for download with complete column structure
export const generateTemplateFile = (type: 'opportunities' | 'contacts', format: 'csv' | 'excel') => {
  let headers: string[] = [];
  let sampleData: any[] = [];

  if (type === 'opportunities') {
    // Complete headers matching the database structure exactly
    headers = [
      // Basic Information
      'title',
      'contract_name', 
      'description',
      
      // Organization Information
      'agency',
      'buying_organization',
      'department',
      'state',
      'contract_type',
      'buying_org_level_1',
      'buying_org_level_2', 
      'buying_org_level_3',
      
      // Contract Details
      'contract_number',
      'solicitation_number',
      'contractors',
      'products_services',
      'primary_requirement',
      'place_of_performance_location',
      
      // Contact Information
      'contact_first_name',
      'contact_phone',
      'contact_email',
      
      // Financial Information
      'budget_min',
      'budget_max',
      'award_value',
      'naics_code',
      'set_aside_code',
      
      // Important Dates (YYYY-MM-DD format)
      'award_date',
      'start_date',
      'current_expiration_date',
      'ultimate_expiration_date',
      'response_deadline',
      
      // Status and Additional Information
      'status',
      'contract_status',
      'source_url',
      
      // AI and Research
      'ai_analysis_summary',
      'keywords'
    ];
    
    sampleData = [{
      // Basic Information
      title: 'IT Infrastructure Modernization Services',
      contract_name: 'Statewide IT Infrastructure Modernization Contract',
      description: 'Comprehensive IT infrastructure upgrade including cloud migration, network modernization, and cybersecurity enhancements for state agencies',
      
      // Organization Information
      agency: 'California Department of Technology',
      buying_organization: 'State of California - Department of Technology',
      department: 'Information Technology Division',
      state: 'California',
      contract_type: 'state',
      buying_org_level_1: 'State of California',
      buying_org_level_2: 'Government Operations Agency',
      buying_org_level_3: 'Department of Technology',
      
      // Contract Details
      contract_number: 'CA-2024-IT-001',
      solicitation_number: 'RFP-2024-CDT-001',
      contractors: 'TechCorp Solutions Inc., CloudFirst Technologies LLC',
      products_services: 'Cloud Infrastructure, Network Equipment, Cybersecurity Solutions, Professional Services',
      primary_requirement: 'Modernize legacy IT systems and migrate critical applications to secure cloud infrastructure',
      place_of_performance_location: 'Sacramento, CA',
      
      // Contact Information
      contact_first_name: 'John',
      contact_phone: '(916) 555-0123',
      contact_email: 'john.doe@technology.ca.gov',
      
      // Financial Information
      budget_min: 5000000,
      budget_max: 15000000,
      award_value: 12500000,
      naics_code: '541511',
      set_aside_code: 'SBA',
      
      // Important Dates
      award_date: '2024-01-15',
      start_date: '2024-02-01',
      current_expiration_date: '2025-01-31',
      ultimate_expiration_date: '2026-01-31',
      response_deadline: '2024-03-15',
      
      // Status and Additional Information
      status: 'active',
      contract_status: 'open',
      source_url: 'https://www.technology.ca.gov/contracts/it-modernization',
      
      // AI and Research
      ai_analysis_summary: 'High-value IT modernization opportunity with strong potential for small business participation. Competitive landscape includes 3-5 major players.',
      keywords: 'IT modernization, cloud migration, cybersecurity, infrastructure, technology services'
    }];
  } else {
    headers = [
      'full_name', 'title', 'agency', 'department', 'state', 'email',
      'phone', 'contact_type', 'is_federal'
    ];
    sampleData = [{
      full_name: 'John Smith',
      title: 'Chief Information Officer',
      agency: 'Department of Technology',
      department: 'IT Division',
      state: 'California',
      email: 'john.smith@ca.gov',
      phone: '(916) 555-0123',
      contact_type: 'cio',
      is_federal: false
    }];
  }

  if (format === 'csv') {
    const csvContent = [
      headers.join(','),
      sampleData.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')).join('\n')
    ].join('\n');
    
    return {
      content: csvContent,
      filename: `${type}_template.csv`,
      mimeType: 'text/csv'
    };
  } else {
    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    return {
      content: excelBuffer,
      filename: `${type}_template.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
};

// Admin upload functions using direct database insertion
export const adminUploadContacts = async (contactData: any[]) => {
  try {
    let successCount = 0;
    const errors: string[] = [];

    for (const contact of contactData) {
      try {
        const { error } = await supabase
          .from('contacts')
          .insert([contact]);

        if (error) {
          errors.push(`Error inserting contact ${contact.full_name}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        errors.push(`Error processing contact ${contact.full_name}: ${err.message}`);
      }
    }

    return { success: successCount, errors };
  } catch (error) {
    console.error('Error uploading contacts:', error);
    throw error;
  }
};

export const adminUploadContracts = async (contractData: any[]) => {
  try {
    let successCount = 0;
    const errors: string[] = [];

    for (const contract of contractData) {
      try {
        // Ensure required fields are present
        if (!contract.title || !contract.agency) {
          errors.push(`Missing required fields for contract: ${contract.title || 'Unknown'}`);
          continue;
        }

        // Process keywords if it's a string
        if (contract.keywords && typeof contract.keywords === 'string') {
          contract.keywords = contract.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
        }

        // Clean up numeric fields
        const cleanContract = {
          ...contract,
          budget_min: contract.budget_min ? parseFloat(contract.budget_min) : null,
          budget_max: contract.budget_max ? parseFloat(contract.budget_max) : null,
          award_value: contract.award_value ? parseFloat(contract.award_value) : null,
          // Ensure dates are properly formatted or null
          award_date: contract.award_date && contract.award_date !== '' ? contract.award_date : null,
          start_date: contract.start_date && contract.start_date !== '' ? contract.start_date : null,
          current_expiration_date: contract.current_expiration_date && contract.current_expiration_date !== '' ? contract.current_expiration_date : null,
          ultimate_expiration_date: contract.ultimate_expiration_date && contract.ultimate_expiration_date !== '' ? contract.ultimate_expiration_date : null,
          response_deadline: contract.response_deadline && contract.response_deadline !== '' ? contract.response_deadline : null,
        };

        const { error } = await supabase
          .from('contracts')
          .insert([cleanContract]);

        if (error) {
          errors.push(`Error inserting contract ${contract.title}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        errors.push(`Error processing contract ${contract.title || 'Unknown'}: ${err.message}`);
      }
    }

    return { success: successCount, errors };
  } catch (error) {
    console.error('Error uploading contracts:', error);
    throw error;
  }
};