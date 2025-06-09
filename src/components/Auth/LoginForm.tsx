import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Shield, Users, Calendar, CheckCircle, Star, Zap, Globe, Brain, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'demo'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error);
        }
      } else if (activeTab === 'signup') {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.companyName
        );
        if (error) {
          setError(error);
        } else {
          setSuccess('Account created successfully! Please wait for admin approval to access the platform.');
          setActiveTab('login');
          setFormData({ email: '', password: '', fullName: '', companyName: '', phone: '', message: '' });
        }
      } else if (activeTab === 'demo') {
        // Handle demo request
        const { error } = await supabase
          .from('demo_requests')
          .insert([{
            email: formData.email,
            full_name: formData.fullName,
            company_name: formData.companyName,
            phone: formData.phone,
            message: formData.message,
            status: 'pending'
          }]);

        if (error) {
          setError('Error submitting demo request. Please try again.');
        } else {
          setSuccess('Demo request submitted successfully! Our team will contact you within 24 hours.');
          setFormData({ email: '', password: '', fullName: '', companyName: '', phone: '', message: '' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const features = [
    {
      icon: Globe,
      title: 'Comprehensive Coverage',
      description: 'Access to all 50 state procurement portals plus federal opportunities from SAM.gov and USAspending.gov'
    },
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI analysis provides competitive insights, bidder analysis, and strategic recommendations'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Updates',
      description: 'Automated web scraping ensures you never miss an opportunity with instant notifications'
    },
    {
      icon: Award,
      title: 'Expert Support',
      description: 'Dedicated account managers and procurement experts to help you win more contracts'
    }
  ];

  const stats = [
    { number: '50+', label: 'State Portals' },
    { number: '$2.4T', label: 'Contract Value' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Product Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo and Brand */}
          <div>
            <div className="flex items-center mb-8">
              <Shield className="h-10 w-10 text-blue-300 mr-3" />
              <div>
                <h1 className="text-3xl font-bold">FederalTalks IQ</h1>
                <p className="text-blue-200 text-sm">Government Contract Intelligence Platform</p>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Win More Government Contracts with AI-Powered Intelligence
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Access comprehensive federal and state contract opportunities, get AI-powered competitive analysis, 
                and never miss a deadline with our intelligent platform.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-300">{stat.number}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Why Choose FederalTalks IQ?</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-blue-200" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-100 mb-1">{feature.title}</h4>
                    <p className="text-sm text-blue-200 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-8 p-6 bg-blue-800 bg-opacity-50 rounded-lg border border-blue-700">
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-blue-100 italic mb-3">
              "FederalTalks IQ helped us identify and win $2.3M in federal contracts in our first year. 
              The AI insights are game-changing."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-blue-200">Sarah Johnson</div>
              <div className="text-blue-300">CEO, TechSolutions Inc.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FederalTalks IQ</h1>
                <p className="text-gray-600 text-sm">Government Contract Intelligence</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Tab Navigation */}
            <div className="flex justify-center space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Sign Up
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'demo'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Demo
              </button>
            </div>

            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'login' && 'Welcome Back'}
                {activeTab === 'signup' && 'Create Account'}
                {activeTab === 'demo' && 'Request Demo'}
              </h2>
              <p className="text-gray-600 mt-2">
                {activeTab === 'login' && 'Sign in to access your dashboard'}
                {activeTab === 'signup' && 'Join thousands of successful contractors'}
                {activeTab === 'demo' && 'See how FederalTalks IQ can help you win'}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {(activeTab === 'signup' || activeTab === 'demo') && (
                <>
                  <div>
                    <label htmlFor="fullName\" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your company name"
                    />
                  </div>
                  {activeTab === 'demo' && (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              {activeTab !== 'demo' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'demo' && (
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your requirements and what you'd like to see in the demo..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 text-sm">{error}</div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {success}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {activeTab === 'login' && 'Sign In'}
                    {activeTab === 'signup' && 'Create Account'}
                    {activeTab === 'demo' && 'Request Demo'}
                  </>
                )}
              </button>
            </form>

            {/* Additional Information */}
            <div className="mt-6 text-center">
              {activeTab === 'signup' && (
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                  Your account will be activated after admin approval.
                </p>
              )}

              {activeTab === 'demo' && (
                <p className="text-xs text-gray-500">
                  Request a personalized demo of FederalTalks IQ.
                  Our team will contact you within 24 hours to schedule your demo.
                </p>
              )}

              {activeTab === 'login' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveTab('signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up here
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">
                    Want to see it first?{' '}
                    <button
                      onClick={() => setActiveTab('demo')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Request a demo
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}