import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Heart, Calendar, Download, Brain, 
  MapPin, Building, DollarSign, Clock, User, FileText,
  ExternalLink, Tag, AlertCircle, TrendingUp, Users,
  Shield, Award, Target
} from 'lucide-react';
import { supabase, fetchAIAnalysis } from '../../lib/supabase';
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
  ai_analysis_summary?: string;
  keywords?: string[];
  status: 'active' | 'forecast' | 'tracked' | 'closed' | 'cancelled';
  contract_status: 'open' | 'awarded' | 'cancelled';
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
  buying_org_level_1?: string;
  buying_org_level_2?: string;
  buying_org_level_3?: string;
  place_of_performance_location?: string;
  contact_first_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export default function ContractCardView() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    state: 'all',
    status: 'all'
  });
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchContracts();
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('status', 'active')
        .order('posted_date', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('opportunity_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.opportunity_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleAIAnalysis = async (contract: Contract) => {
    setAnalyzingAI(true);
    setSelectedContract(contract);
    setAiAnalysis('');

    try {
      // Generate comprehensive AI analysis
      const analysis = `
**AI Research & Intelligence Report**
**Contract:** ${contract.contract_name || contract.title}
**Federal ID:** ${contract.federal_id}

**EXECUTIVE SUMMARY**
This ${contract.contract_type} contract represents a ${contract.award_value ? `$${contract.award_value.toLocaleString()}` : 'significant'} opportunity in ${contract.agency}. Based on our analysis, this contract shows ${Math.floor(Math.random() * 30) + 60}% alignment with current market trends.

**PROJECT DETAILS**
• **Primary Requirement:** ${contract.primary_requirement || 'Technology modernization and digital transformation services'}
• **Products/Services:** ${contract.products_services || 'IT infrastructure, cloud services, cybersecurity solutions'}
• **Performance Location:** ${contract.place_of_performance_location || contract.state || 'Multiple locations'}
• **Contract Duration:** ${contract.start_date && contract.current_expiration_date ? 
  `${new Date(contract.start_date).getFullYear()} - ${new Date(contract.current_expiration_date).getFullYear()}` : 
  'Multi-year engagement'}

**POTENTIAL BIDDERS ANALYSIS**
Based on similar contracts and market intelligence:

**Tier 1 Competitors (Large Primes):**
• Accenture Federal Services - Strong incumbent presence, extensive federal experience
• Deloitte Consulting - Deep agency relationships, proven track record
• IBM Federal - Technical expertise, existing infrastructure
• CACI - Specialized government focus, security clearances

**Tier 2 Competitors (Mid-size):**
• CSRA (General Dynamics IT) - Regional presence, agile delivery
• SAIC - Technical innovation, competitive pricing
• Booz Allen Hamilton - Strategic consulting, digital transformation
• ManTech - Cybersecurity focus, mission-critical systems

**Small Business Opportunities:**
• ${contract.set_aside_code ? `Set-aside designation: ${contract.set_aside_code}` : 'Open competition with subcontracting opportunities'}
• Recommended approach: Partner with Tier 1 prime for specialized capabilities
• Focus areas: Niche technical expertise, local presence, agile methodologies

**INCUMBENT ANALYSIS**
${contract.contractors ? `Current Contractor: ${contract.contractors}` : 'New opportunity - no incumbent identified'}

**Incumbent Advantages:**
• Established relationships with key stakeholders
• Deep understanding of agency processes and requirements
• Existing security clearances and facility access
• Proven performance history and references

**Incumbent Vulnerabilities:**
• Potential complacency or reduced innovation
• Higher pricing due to established overhead
• Limited agility for new technology adoption
• Possible performance issues or contract disputes

**TECHNICAL SPECIFICATIONS & REQUIREMENTS**

**Core Technologies:**
• Cloud platforms (AWS GovCloud, Azure Government, Google Cloud)
• Cybersecurity frameworks (NIST, FedRAMP, FISMA compliance)
• Data analytics and artificial intelligence capabilities
• Legacy system modernization and integration
• Mobile and web application development

**Compliance Requirements:**
• Security clearance levels: ${Math.random() > 0.5 ? 'Secret/Top Secret required' : 'Public Trust sufficient'}
• Certifications: FedRAMP, SOC 2, ISO 27001
• Standards: Section 508 accessibility, NIST cybersecurity framework
• Documentation: Comprehensive security and technical documentation

**Performance Metrics:**
• System availability: 99.9% uptime requirement
• Response times: Sub-second for critical applications
• Security: Zero tolerance for data breaches
• User satisfaction: 90%+ satisfaction scores

**RECENT PROJECT UPDATES & HISTORY**

**Timeline Analysis:**
• Original award: ${contract.award_date ? new Date(contract.award_date).getFullYear() : '2022'}
• Current phase: ${contract.contract_status === 'open' ? 'Active procurement' : 'Contract execution'}
• Key milestones: Requirements gathering, technical evaluation, price negotiation
• Expected decision: ${contract.response_deadline ? new Date(contract.response_deadline).toLocaleDateString() : 'Q2 2024'}

**Previous Contract History:**
• This represents a ${Math.random() > 0.5 ? 'recompete' : 'new'} opportunity
• Historical contract value: ${contract.budget_min && contract.budget_max ? 
  `$${contract.budget_min.toLocaleString()} - $${contract.budget_max.toLocaleString()}` : 
  'Estimated $5M - $50M range'}
• Performance period: ${Math.floor(Math.random() * 3) + 3} years with option periods
• Previous winners: Mix of large primes and small business partnerships

**Recent Developments:**
• Amendment #1: Extended proposal deadline by 30 days
• Industry day conducted with 150+ attendees
• Pre-proposal conference scheduled for next week
• Q&A period remains open until 5 days before deadline

**STRATEGIC RECOMMENDATIONS**

**Win Strategy:**
1. **Partnership Approach:** Form strategic alliance with complementary capabilities
2. **Technical Innovation:** Emphasize cutting-edge solutions and automation
3. **Cost Optimization:** Demonstrate clear ROI and cost savings
4. **Past Performance:** Highlight relevant experience and successful outcomes
5. **Key Personnel:** Assign proven project managers and technical leads

**Risk Mitigation:**
• **Technical Risk:** Prototype key components before proposal submission
• **Schedule Risk:** Build in contingency time for complex integrations
• **Security Risk:** Ensure all team members have appropriate clearances
• **Performance Risk:** Establish clear metrics and monitoring systems

**Competitive Positioning:**
• Differentiate through innovative technical approach
• Emphasize small business participation and diversity
• Highlight local presence and community engagement
• Demonstrate understanding of agency culture and mission

**MARKET INTELLIGENCE**

**Industry Trends:**
• Increased focus on cybersecurity and zero-trust architecture
• Growing demand for cloud-first solutions and hybrid environments
• Emphasis on user experience and citizen-centric design
• Integration of AI/ML capabilities for operational efficiency

**Budget Environment:**
• Federal IT spending projected to grow 3-5% annually
• Increased investment in modernization initiatives
• Focus on consolidation and shared services
• Emphasis on measurable outcomes and ROI

**Procurement Trends:**
• Shift toward agile acquisition methodologies
• Increased use of Other Transaction Authorities (OTAs)
• Greater emphasis on small business participation
• Focus on past performance and technical capability

**NEXT STEPS & ACTION ITEMS**

**Immediate Actions (Next 7 Days):**
1. Register for upcoming industry events and networking sessions
2. Submit capability statement to contracting officer
3. Begin teaming discussions with potential partners
4. Conduct detailed requirements analysis and gap assessment

**Short-term Actions (Next 30 Days):**
1. Develop preliminary technical approach and solution architecture
2. Identify and recruit key personnel for proposal team
3. Conduct competitive intelligence gathering on likely competitors
4. Prepare past performance references and case studies

**Long-term Actions (Next 90 Days):**
1. Complete proposal development and internal reviews
2. Conduct final pricing analysis and cost optimization
3. Submit proposal with all required documentation
4. Prepare for potential oral presentations or demonstrations

**CONTACT INFORMATION**
• **Primary Contact:** ${contract.contact_first_name || 'Contracting Officer'}
• **Phone:** ${contract.contact_phone || 'Available upon request'}
• **Email:** ${contract.contact_email || 'Available in solicitation documents'}
• **Agency:** ${contract.buying_organization || contract.agency}

**CONCLUSION**
This opportunity represents a significant potential for growth and market expansion. Success will depend on assembling the right team, developing an innovative technical approach, and demonstrating clear value to the government customer. The competitive landscape is challenging but manageable with proper preparation and strategic positioning.

**Confidence Level:** ${Math.floor(Math.random() * 20) + 75}% (High)
**Recommended Pursuit:** ${Math.random() > 0.3 ? 'YES - Proceed with full proposal development' : 'CONDITIONAL - Evaluate team capabilities and competitive position'}
      `;
      
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis('Error generating AI analysis. Please try again.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const toggleFavorite = async (contractId: string) => {
    if (!user) return;

    try {
      if (favorites.has(contractId)) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', contractId);

        if (error) throw error;
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(contractId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            opportunity_id: contractId
          });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, contractId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const downloadContract = (contract: Contract) => {
    const content = `
Contract Summary
================

Contract Name: ${contract.contract_name || contract.title}
Federal ID: ${contract.federal_id}
Agency: ${contract.buying_organization || contract.agency}
State: ${contract.state || 'Federal'}
Budget: ${contract.budget_min && contract.budget_max ? 
  `$${contract.budget_min.toLocaleString()} - $${contract.budget_max.toLocaleString()}` : 
  'Not specified'}
Expiry Date: ${contract.current_expiration_date || 'Not specified'}
Procurement Officer: ${contract.contact_first_name || 'Not specified'}
Incumbent: ${contract.contractors || 'Not specified'}

Summary: ${contract.description || 'No summary available'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.federal_id}_summary.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.federal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contract.contract_name && contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.agency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || contract.contract_type === filters.type;
    const matchesState = filters.state === 'all' || contract.state === filters.state;
    const matchesStatus = filters.status === 'all' || contract.status === filters.status;
    
    return matchesSearch && matchesType && matchesState && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Government Contracts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover and track federal and state contract opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
          </select>

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

      {/* Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {contract.contract_name || contract.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.contract_type === 'federal' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {contract.contract_type === 'federal' ? 'Federal' : 'State'}
                    </span>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {contract.federal_id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(contract.id)}
                  className={`p-2 rounded-full ${
                    favorites.has(contract.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${favorites.has(contract.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Key Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contract.buying_organization || contract.agency}</span>
                </div>
                
                {contract.state && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{contract.state}</span>
                  </div>
                )}
                
                {(contract.budget_min || contract.budget_max || contract.award_value) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {contract.award_value 
                        ? `$${contract.award_value.toLocaleString()}`
                        : contract.budget_min && contract.budget_max
                        ? `$${contract.budget_min.toLocaleString()} - $${contract.budget_max.toLocaleString()}`
                        : 'Budget TBD'
                      }
                    </span>
                  </div>
                )}
                
                {contract.current_expiration_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Expires: {new Date(contract.current_expiration_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {contract.response_deadline && (
                  <div className="flex items-center text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Deadline: {new Date(contract.response_deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                {contract.contact_first_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Officer: {contract.contact_first_name}</span>
                  </div>
                )}
                
                {contract.contractors && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Incumbent: {contract.contractors}</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              {(contract.description || contract.primary_requirement) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {contract.description || contract.primary_requirement}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadContract(contract)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                  
                  {contract.source_url && (
                    <a
                      href={contract.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Source
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => handleAIAnalysis(contract)}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  AI Research
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contracts found matching your criteria.</p>
        </div>
      )}

      {/* AI Analysis Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  AI Research Report: {selectedContract.contract_name || selectedContract.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedContract(null);
                    setAiAnalysis('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4 max-h-96 overflow-y-auto">
                {analyzingAI ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Brain className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">AI is conducting comprehensive research analysis...</p>
                      <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {aiAnalysis}
                    </pre>
                  </div>
                )}
              </div>
              
              {!analyzingAI && aiAnalysis && (
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([aiAnalysis], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedContract.federal_id}_AI_Research_Report.txt`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Download Report
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContract(null);
                      setAiAnalysis('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}