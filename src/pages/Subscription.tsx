import React, { useState } from 'react';
import { Check, CreditCard, Shield, Star } from 'lucide-react';

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  const plans = [
    {
      id: 'trial',
      name: '7-Day Trial',
      price: 49,
      duration: '7 days',
      features: [
        'Access to all federal opportunities',
        'Basic state contract data',
        'Email notifications',
        'Standard support'
      ],
      popular: false
    },
    {
      id: '1month',
      name: 'Monthly Plan',
      price: 199,
      duration: 'per month',
      features: [
        'Complete federal & state data',
        'AI-powered contract analysis',
        'Advanced search & filters',
        'Export capabilities',
        'Contact directory access',
        'Priority support'
      ],
      popular: true
    },
    {
      id: '3months',
      name: '3-Month Plan',
      price: 499,
      duration: '3 months',
      originalPrice: 597,
      features: [
        'All Monthly Plan features',
        'Custom alerts & notifications',
        'Historical contract data',
        'Market intelligence reports',
        'API access (limited)',
        'Dedicated account manager'
      ],
      popular: false
    },
    {
      id: '6months',
      name: '6-Month Plan',
      price: 799,
      duration: '6 months',
      originalPrice: 1194,
      features: [
        'All 3-Month Plan features',
        'Unlimited AI analysis',
        'Full API access',
        'Custom data exports',
        'White-label reporting',
        'Training sessions'
      ],
      popular: false
    },
    {
      id: '9months',
      name: '9-Month Plan',
      price: 999,
      duration: '9 months',
      originalPrice: 1791,
      features: [
        'All 6-Month Plan features',
        'Early access to new features',
        'Custom integrations',
        'Bulk data downloads',
        'Priority feature requests'
      ],
      popular: false
    },
    {
      id: '1year',
      name: 'Annual Plan',
      price: 1199,
      duration: 'per year',
      originalPrice: 2388,
      features: [
        'All features included',
        'Maximum cost savings',
        'Quarterly business reviews',
        'Custom dashboards',
        'Unlimited everything',
        '24/7 premium support'
      ],
      popular: false
    }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', logo: '💳' },
    { id: 'skrill', name: 'Skrill', logo: '💰' },
    { id: 'neteller', name: 'Neteller', logo: '🏦' }
  ];

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    
    const plan = plans.find(p => p.id === selectedPlan);
    alert(`Processing subscription for ${plan?.name} using ${paymentMethod}. In production, this would redirect to payment gateway.`);
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-gray-600">
          Get access to comprehensive government contract intelligence
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {plan.duration}
                  </span>
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span className="ml-2 text-green-600 font-medium">
                      Save ${plan.originalPrice - plan.price}
                    </span>
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedPlan === plan.id
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <Check className="h-3 w-3 text-white transform translate-x-0.5 -translate-y-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      {selectedPlan && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Complete Your Subscription
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Selected Plan
              </h4>
              <div className="border border-gray-200 rounded-lg p-4">
                {(() => {
                  const plan = plans.find(p => p.id === selectedPlan);
                  return (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{plan?.name}</span>
                        <span className="text-lg font-bold">${plan?.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {plan?.duration}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Payment Method
              </h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{method.logo}</span>
                    <span className="font-medium">{method.name}</span>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 ${
                      paymentMethod === method.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === method.id && (
                        <Check className="h-3 w-3 text-white transform translate-x-0.5 -translate-y-0.5" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubscribe}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Subscribe Now
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Subscription requires admin approval. You'll receive access once approved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              For assistance, contact: support@federaltalks.com
            </p>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          Why Choose FederalTalks IQ?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">Comprehensive Coverage</h4>
            <p className="text-sm text-gray-600">
              Access to all 50 state procurement portals plus federal opportunities
            </p>
          </div>
          
          <div className="text-center">
            <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered Insights</h4>
            <p className="text-sm text-gray-600">
              Get intelligent analysis and recommendations for every contract
            </p>
          </div>
          
          <div className="text-center">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-2">Real-Time Updates</h4>
            <p className="text-sm text-gray-600">
              Automated web scraping ensures you never miss an opportunity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}