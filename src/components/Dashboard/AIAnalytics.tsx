import React, { useState } from 'react';
import { Brain, TrendingUp, BarChart3, PieChart, Download, RefreshCw } from 'lucide-react';

export default function AIAnalytics() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  const generateAnalysis = async () => {
    setLoading(true);
    setAnalysis('');

    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis(`
**AI Market Intelligence Report - Generated ${new Date().toLocaleDateString()}**

**Executive Summary:**
The government contracting landscape shows strong growth across multiple sectors, with technology and healthcare leading the charge.

**Key Insights:**
• **Technology Sector:** 34% increase in IT modernization contracts
• **Healthcare:** 28% growth in digital health initiatives
• **Infrastructure:** $2.1B in transportation and utilities projects
• **Defense:** Steady 15% annual growth in cybersecurity contracts

**Market Trends:**
1. **Small Business Set-Asides:** 23% of total contract value
2. **State vs Federal:** 60% federal, 40% state opportunities
3. **Average Contract Value:** $2.3M (up 12% from last year)
4. **Competition Level:** Moderate (8-12 bidders per opportunity)

**Sector Analysis:**
• **Information Technology:** $8.2B total value, 1,247 opportunities
• **Professional Services:** $3.8B total value, 892 opportunities
• **Construction:** $5.1B total value, 634 opportunities
• **Healthcare:** $2.9B total value, 456 opportunities

**Geographic Distribution:**
• **Top States:** California (89), Texas (82), New York (73)
• **Fastest Growing:** Florida (+18%), Colorado (+15%), Virginia (+12%)
• **Emerging Markets:** Arizona, North Carolina, Washington

**Competitive Intelligence:**
• **Prime Contractors:** Large businesses dominate 67% of contract value
• **Subcontracting:** 45% of primes use small business subcontractors
• **Win Rates:** Average 12% for new entrants, 28% for incumbents

**Recommendations:**
1. **Focus Areas:** Cybersecurity, cloud migration, digital transformation
2. **Target States:** California, Texas, Virginia for federal; Florida, Colorado for state
3. **Partnership Strategy:** Team with established primes for large opportunities
4. **Timing:** Q2 and Q4 show highest opportunity release rates

**Risk Assessment:**
• **Low Risk:** Established agencies with clear requirements
• **Medium Risk:** New programs with evolving specifications
• **High Risk:** Highly competitive markets with incumbent advantages

**Next Steps:**
1. Monitor emerging opportunities in identified growth sectors
2. Develop capabilities in high-demand technology areas
3. Build relationships with key procurement officials
4. Prepare for upcoming recompete opportunities
      `);
      setLoading(false);
    }, 3000);
  };

  const downloadReport = () => {
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Market_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Market Analytics</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </button>
          
          {analysis && (
            <button
              onClick={downloadReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">AI is analyzing market trends and opportunities...</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Growth Rate</p>
                  <p className="text-2xl font-bold text-blue-600">+23%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">$24.2B</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <PieChart className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Opportunities</p>
                  <p className="text-2xl font-bold text-purple-600">2,847</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">AI Score</p>
                  <p className="text-2xl font-bold text-orange-600">94/100</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {analysis}
            </pre>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Click "Generate Analysis" to get AI-powered market insights</p>
          <p className="text-sm text-gray-400 mt-1">
            Comprehensive analysis of government contracting trends and opportunities
          </p>
        </div>
      )}
    </div>
  );
}