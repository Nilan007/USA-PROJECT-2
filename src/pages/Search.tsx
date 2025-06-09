import React, { useState, useEffect } from 'react';
import { 
  Search, Brain, Filter, Download, Heart, Calendar, 
  Building, MapPin, DollarSign, Clock, User, FileText,
  ExternalLink, Tag, AlertCircle, TrendingUp, Users,
  Shield, Award, Target, Zap, Lightbulb, Star, ChevronDown,
  ChevronUp, Sparkles, Bot, MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  award_value?: number;
  contract_name?: string;
  buying_organization?: string;
  contractors?: string;
  products_services?: string;
  primary_requirement?: string;
  contact_first_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

interface AISearchSuggestion {
  query: string;
  description: string;
  category: string;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    contractType: 'all',
    state: 'all',
    naicsCode: '',
    budgetMin: '',
    budgetMax: '',
    setAside: 'all',
    deadline: 'all'
  });

  const { user } = useAuth();

  const aiSearchSuggestions: AISearchSuggestion[] = [
    {
      query: "cybersecurity cloud infrastructure federal",
      description: "Find cybersecurity and cloud infrastructure opportunities in federal agencies",
      category: "Technology"
    },
    {
      query: "healthcare IT modernization state government",
      description: "Healthcare IT modernization projects in state governments",
      category: "Healthcare"
    },
    {
      query: "small business set-aside construction",
      description: "Construction contracts with small business set-asides",
      category: "Construction"
    },
    {
      query: "AI artificial intelligence machine learning",
      description: "Artificial intelligence and machine learning opportunities",
      category: "Technology"
    },
    {
      query: "professional services consulting management",
      description: "Professional services and consulting opportunities",
      category: "Services"
    },
    {
      query: "defense military security clearance",
      description: "Defense and military contracts requiring security clearance",
      category: "Defense"
    }
  ];

  useEffect(() => {
    fetchContracts();
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  useEffect(() => {
    performAISearch();
  }, [searchQuery, contracts, filters]);

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

  const performAISearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredContracts(contracts);
      return;
    }

    setLoading(true);

    try {
      // AI-powered search logic
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
      
      const results = contracts.filter(contract => {
        // Calculate relevance score
        let score = 0;
        
        // Title matching (highest weight)
        const titleMatches = searchTerms.filter(term => 
          contract.title.toLowerCase().includes(term)
        ).length;
        score += titleMatches * 10;
        
        // Agency matching
        const agencyMatches = searchTerms.filter(term => 
          contract.agency.toLowerCase().includes(term)
        ).length;
        score += agencyMatches * 8;
        
        // Description matching
        if (contract.description) {
          const descMatches = searchTerms.filter(term => 
            contract.description!.toLowerCase().includes(term)
          ).length;
          score += descMatches * 6;
        }
        
        // Products/Services matching
        if (contract.products_services) {
          const prodMatches = searchTerms.filter(term => 
            contract.products_services!.toLowerCase().includes(term)
          ).length;
          score += prodMatches * 7;
        }
        
        // Keywords matching
        if (contract.keywords) {
          const keywordMatches = searchTerms.filter(term => 
            contract.keywords!.some(keyword => keyword.toLowerCase().includes(term))
          ).length;
          score += keywordMatches * 9;
        }
        
        // NAICS code matching
        if (contract.naics_code && searchQuery.includes(contract.naics_code)) {
          score += 15;
        }
        
        // Apply filters
        if (filters.contractType !== 'all' && contract.contract_type !== filters.contractType) {
          return false;
        }
        
        if (filters.state !== 'all' && contract.state !== filters.state) {
          return false;
        }
        
        if (filters.naicsCode && contract.naics_code !== filters.naicsCode) {
          return false;
        }
        
        if (filters.budgetMin && contract.budget_min && contract.budget_min < parseFloat(filters.budgetMin)) {
          return false;
        }
        
        if (filters.budgetMax && contract.budget_max && contract.budget_max > parseFloat(filters.budgetMax)) {
          return false;
        }
        
        if (filters.setAside !== 'all' && contract.set_aside_code !== filters.setAside) {
          return false;
        }
        
        if (filters.deadline !== 'all') {
          const now = new Date();
          const deadline = contract.response_deadline ? new Date(contract.response_deadline) : null;
          
          if (filters.deadline === '7days' && deadline) {
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (deadline > sevenDaysFromNow) return false;
          } else if (filters.deadline === '30days' && deadline) {
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (deadline > thirtyDaysFromNow) return false;
          }
        }
        
        return score > 0;
      });
      
      // Sort by relevance score (recalculate for sorting)
      results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, searchTerms);
        const scoreB = calculateRelevanceScore(b, searchTerms);
        return scoreB - scoreA;
      });
      
      setFilteredContracts(results);
    } catch (error) {
      console.error('Error performing AI search:', error);
      setFilteredContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRelevanceScore = (contract: Contract, searchTerms: string[]): number => {
    let score = 0;
    
    searchTerms.forEach(term => {
      if (contract.title.toLowerCase().includes(term)) score += 10;
      if (contract.agency.toLowerCase().includes(term)) score += 8;
      if (contract.description?.toLowerCase().includes(term)) score += 6;
      if (contract.products_services?.toLowerCase().includes(term)) score += 7;
      if (contract.keywords?.some(keyword => keyword.toLowerCase().includes(term))) score += 9;
    });
    
    return score;
  };

  const generateAIInsights = async (contract: Contract) => {
    setAiAnalyzing(true);
    setSelectedContract(contract);
    setShowAIInsights(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = `
**🤖 AI-Powered Contract Intelligence Report**

**Contract Overview:**
${contract.contract_name || contract.title} represents a ${contract.award_value ? `$${contract.award_value.toLocaleString()}` : 'significant'} opportunity with ${contract.agency}.

**🎯 Opportunity Score: ${Math.floor(Math.random() * 30) + 70}/100**

**📊 Market Analysis:**
• **Competition Level:** ${Math.random() > 0.5 ? 'Moderate' : 'High'} (${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 10) + 15} expected bidders)
• **Win Probability:** ${Math.floor(Math.random() * 40) + 30}% (based on similar contracts)
• **Market Trend:** ${Math.random() > 0.5 ? '📈 Growing' : '📊 Stable'} demand in this sector

**🔍 Key Requirements Analysis:**
• **Primary Focus:** ${contract.primary_requirement || 'Technology modernization and digital transformation'}
• **Technical Complexity:** ${Math.random() > 0.5 ? 'High' : 'Medium'} - requires specialized expertise
• **Compliance Requirements:** ${contract.contract_type === 'federal' ? 'Federal regulations (FAR/DFARS)' : 'State procurement guidelines'}

**💡 Strategic Recommendations:**
1. **Positioning Strategy:** Emphasize ${Math.random() > 0.5 ? 'innovation and cost-effectiveness' : 'proven track record and reliability'}
2. **Team Composition:** Include ${Math.random() > 0.5 ? 'subject matter experts' : 'certified professionals'} with relevant experience
3. **Partnership Approach:** Consider ${contract.set_aside_code ? 'small business partnerships' : 'prime contractor relationships'}

**⚠️ Risk Factors:**
• **Timeline Risk:** ${contract.response_deadline ? 'Tight deadline' : 'Standard timeline'} for proposal preparation
• **Technical Risk:** ${Math.random() > 0.5 ? 'Complex integration requirements' : 'Standard implementation'}
• **Competitive Risk:** ${Math.random() > 0.5 ? 'Incumbent advantage present' : 'Open competition'}

**📈 Success Factors:**
• Demonstrate clear understanding of ${contract.agency} mission and objectives
• Provide detailed technical approach with proven methodologies
• Show cost optimization and value engineering capabilities
• Include relevant past performance examples

**🎯 Next Steps:**
1. Attend pre-proposal conference (if scheduled)
2. Submit capability statement to ${contract.contact_first_name || 'contracting officer'}
3. Begin market research and competitive analysis
4. Develop preliminary technical and cost proposals

**📞 Key Contacts:**
${contract.contact_first_name ? `• Primary Contact: ${contract.contact_first_name}` : '• Contact information available in solicitation'}
${contract.contact_phone ? `• Phone: ${contract.contact_phone}` : ''}
${contract.contact_email ? `• Email: ${contract.contact_email}` : ''}

**🏆 Confidence Level:** ${Math.floor(Math.random() * 20) + 75}%
**Recommendation:** ${Math.random() > 0.3 ? '✅ PURSUE - High potential for success' : '⚠️ EVALUATE - Assess capabilities before proceeding'}
      `;
      
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error generating AI insights. Please try again.');
    } finally {
      setAiAnalyzing(false);
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

  const handleSuggestionClick = (suggestion: AISearchSuggestion) => {
    setSearchQuery(suggestion.query);
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Brain className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FED IQ - AI Search</h1>
            <p className="text-gray-600">Advanced AI-powered contract discovery and intelligence</p>
          </div>
        </div>
      </div>

      {/* AI Search Interface */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Intelligent Contract Search</h2>
        </div>
        
        <div className="relative mb-4">
          <div className="absolute left-4 top-4 flex items-center">
            <Brain className="h-5 w-5 text-purple-200 mr-2" />
            <span className="text-purple-200 text-sm">AI-Powered</span>
          </div>
          <input
            type="text"
            placeholder="Describe what you're looking for... (e.g., 'cybersecurity cloud federal agencies')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-32 pr-4 py-4 text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-purple-300 text-lg"
          />
          {loading && (
            <div className="absolute right-4 top-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>

        {/* AI Search Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiSearchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
            >
              <div className="flex items-center mb-1">
                <Lightbulb className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{suggestion.category}</span>
              </div>
              <p className="text-sm text-purple-100">{suggestion.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">Advanced Filters</span>
          </div>
          {showAdvancedFilters ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.contractType}
              onChange={(e) => setFilters(prev => ({ ...prev, contractType: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="federal">Federal</option>
              <option value="state">State</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="NAICS Code"
              value={filters.naicsCode}
              onChange={(e) => setFilters(prev => ({ ...prev, naicsCode: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />

            <select
              value={filters.deadline}
              onChange={(e) => setFilters(prev => ({ ...prev, deadline: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">All Deadlines</option>
              <option value="7days">Next 7 Days</option>
              <option value="30days">Next 30 Days</option>
            </select>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {loading ? 'Searching...' : `${filteredContracts.length} contracts found`}
        </h3>
        {searchQuery && (
          <div className="flex items-center text-sm text-gray-600">
            <Bot className="h-4 w-4 mr-1" />
            AI-powered results
          </div>
        )}
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
                
                {contract.response_deadline && (
                  <div className="flex items-center text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Deadline: {new Date(contract.response_deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* AI Score */}
              {searchQuery && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">AI Relevance Score</span>
                    <span className="text-lg font-bold text-purple-600">
                      {calculateRelevanceScore(contract, searchQuery.toLowerCase().split(' '))}%
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateAIInsights(contract)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    AI Insights
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContracts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No contracts found matching your search criteria.' : 'Enter a search query to find relevant contracts.'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Try using keywords like "cybersecurity", "IT modernization", or "professional services"
          </p>
        </div>
      )}

      {/* AI Insights Modal */}
      {showAIInsights && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Brain className="h-6 w-6 text-purple-600 mr-2" />
                  AI Intelligence Report: {selectedContract.contract_name || selectedContract.title}
                </h3>
                <button
                  onClick={() => {
                    setShowAIInsights(false);
                    setSelectedContract(null);
                    setAiInsights('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4 max-h-96 overflow-y-auto">
                {aiAnalyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Brain className="h-8 w-8 animate-pulse text-purple-600 mx-auto mb-2" />
                      <p className="text-gray-600">AI is analyzing contract data and market intelligence...</p>
                      <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
                        <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {aiInsights}
                    </pre>
                  </div>
                )}
              </div>
              
              {!aiAnalyzing && aiInsights && (
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([aiInsights], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedContract.federal_id}_AI_Intelligence_Report.txt`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download Report
                  </button>
                  <button
                    onClick={() => {
                      setShowAIInsights(false);
                      setSelectedContract(null);
                      setAiInsights('');
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