import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { dataService } from '../services/dataService';
import { 
  FaCheck, FaCrown, FaStar, FaWallet, FaRocket,
  FaPercent, FaClock, FaUsers, FaShieldAlt, FaHeadset, FaGift
} from 'react-icons/fa';
import '../styles/customer-dashboard.css';

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [showComparison, setShowComparison] = useState(false);
  const [usageStats, setUsageStats] = useState({
    servicesBooked: 12,
    savingsEarned: 450,
    priorityBookings: 8
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || (document.cookie.match(/authToken=([^;]+)/)?.[1] || '');
      const [subRes, walletRes] = await Promise.all([
        fetch('http://localhost:8080/api/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.ok ? r.json() : { planType: 'BASIC', status: 'ACTIVE' }).catch(() => ({ planType: 'BASIC', status: 'ACTIVE' })),
        paymentAPI.getWalletBalance().catch(() => ({ data: { walletBalance: 0 } }))
      ]);
      
      setCurrentSubscription(subRes);
      setWalletBalance(walletRes.data?.walletBalance || 0);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    if (planType === 'BASIC') {
      setMessage({ type: 'info', text: 'Basic plan is free and already active' });
      return;
    }

    const planPrices = {
      PREMIUM: { monthly: 29.99, yearly: 299.99 },
      VIP: { monthly: 99.99, yearly: 999.99 }
    };

    const price = planPrices[planType][billingCycle];

    if (walletBalance < price) {
      setMessage({ 
        type: 'error', 
        text: `Insufficient wallet balance. You need ${dataService.formatPriceINR(price)}. Please add money to your wallet first.` 
      });
      return;
    }

    try {
      setSubscribing(true);
      setMessage({ type: '', text: '' });

      const token = localStorage.getItem('authToken') || (document.cookie.match(/authToken=([^;]+)/)?.[1] || '');
      const response = await fetch('http://localhost:8080/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType, paymentMethod: 'wallet' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      setMessage({ 
        type: 'success', 
        text: `🎉 Successfully subscribed to ${planType} plan!` 
      });
      
      await loadData();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to subscribe. Please try again.' 
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('authToken') || (document.cookie.match(/authToken=([^;]+)/)?.[1] || '');
      const response = await fetch('http://localhost:8080/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      setMessage({ 
        type: 'success', 
        text: 'Subscription cancelled successfully' 
      });
      
      await loadData();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to cancel subscription' 
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="skeleton h-12 w-64 mx-auto mb-4 rounded"></div>
          <div className="skeleton h-96 w-full max-w-4xl mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: { monthly: 0, yearly: 0 },
      Icon: FaCheck,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      recommended: false,
      benefits: [
        { text: 'Standard support', Icon: FaHeadset },
        { text: 'Basic features', Icon: FaCheck },
        { text: 'Email notifications', Icon: FaCheck },
        { text: 'Book services', Icon: FaCheck },
        { text: 'View booking history', Icon: FaCheck }
      ],
      features: ['Standard support', 'Basic features', 'Email notifications', 'Book services', 'View booking history']
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: { monthly: 29.99, yearly: 299.99 },
      Icon: FaStar,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      recommended: true,
      savings: { monthly: 0, yearly: 60 },
      benefits: [
        { text: 'All Basic features', Icon: FaCheck },
        { text: 'Priority support', Icon: FaHeadset },
        { text: 'Advanced features', Icon: FaRocket },
        { text: '10% service discounts', Icon: FaPercent },
        { text: 'SMS notifications', Icon: FaCheck },
        { text: 'Priority booking', Icon: FaClock }
      ],
      features: ['All Basic features', 'Priority support', 'Advanced features', '10% service discounts', 'SMS notifications', 'Priority booking']
    },
    {
      id: 'VIP',
      name: 'VIP',
      price: { monthly: 99.99, yearly: 999.99 },
      Icon: FaCrown,
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-600',
      recommended: false,
      savings: { monthly: 0, yearly: 200 },
      benefits: [
        { text: 'All Premium features', Icon: FaCheck },
        { text: '24/7 support', Icon: FaHeadset },
        { text: 'Exclusive deals', Icon: FaGift },
        { text: '20% service discounts', Icon: FaPercent },
        { text: 'Personal concierge', Icon: FaUsers },
        { text: 'Exclusive service providers', Icon: FaStar },
        { text: 'Personal account manager', Icon: FaUsers }
      ],
      features: ['All Premium features', '24/7 support', 'Exclusive deals', '20% service discounts', 'Personal concierge', 'Exclusive service providers', 'Personal account manager']
    }
  ];

  const currentPlan = currentSubscription?.planType || 'BASIC';
  const recommendedPlan = plans.find(p => p.recommended);

  // Calculate yearly savings
  const getYearlySavings = (plan) => {
    if (!plan.savings) return 0;
    return plan.savings.yearly || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
          Subscription Plans
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Choose the plan that best fits your needs
        </p>
      </motion.div>

      {/* Free Trial Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg text-white relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <FaStar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">7-Day Free Trial</h3>
              <p className="text-white/90">Try Premium or VIP plan free for 7 days. Cancel anytime!</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all"
          >
            Start Free Trial
          </motion.button>
        </div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
      </motion.div>

      {/* Wallet Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-800 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <FaWallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Wallet Balance:</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {dataService.formatPriceINR(walletBalance)}
          </span>
        </div>
        <Link 
          to="/wallet" 
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center gap-1"
        >
          Add Money <FaWallet className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* Message Display */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : message.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Cycle Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex items-center justify-center gap-4"
      >
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-16 h-8 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <motion.div
            animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
            Save up to ₹200/year
          </span>
        )}
      </motion.div>

      {/* Current Plan Badge */}
      {currentPlan && currentPlan !== 'BASIC' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{currentPlan}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium"
            >
              Cancel Subscription
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, index) => {
          const isCurrent = currentPlan === plan.id;
          const price = plan.price[billingCycle];
          const savings = getYearlySavings(plan);
          const isRecommended = plan.recommended;
          const PlanIcon = plan.Icon; // Extract component reference

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 ${
                isCurrent 
                  ? 'border-blue-500 dark:border-blue-400 shadow-2xl' 
                  : isRecommended
                  ? 'border-purple-500 dark:border-purple-400 shadow-xl'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                  ⭐ BEST VALUE
                </div>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  CURRENT
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}>
                {PlanIcon && <PlanIcon className="h-6 w-6" />}
              </div>

              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {price === 0 ? 'Free' : dataService.formatPriceINR(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-slate-500 dark:text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  )}
                </div>
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold">
                      Save ₹{savings}/year
                    </span>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <ul className="space-y-3 mb-6">
                {plan.benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 + idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`h-5 w-5 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5`}>
                      <FaCheck className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{benefit.text}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || subscribing || (price > 0 && walletBalance < price)}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  isCurrent
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : price > 0 && walletBalance < price
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl`
                }`}
              >
                {isCurrent 
                  ? 'Current Plan' 
                  : subscribing 
                  ? 'Processing...' 
                  : price === 0 
                  ? 'Select Plan' 
                  : `Subscribe for ${dataService.formatPriceINR(price)}`}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Table Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-between"
        >
          <span className="font-semibold text-slate-900 dark:text-white">Compare Plans</span>
          <motion.div
            animate={{ rotate: showComparison ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Features</th>
                      {plans.map(plan => (
                        <th key={plan.id} className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Standard Support', 'Priority Support', '24/7 Support', 'Service Discounts', 'SMS Notifications', 'Personal Concierge'].map((feature, idx) => (
                      <tr key={idx} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{feature}</td>
                        {plans.map(plan => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase().split(' ')[0])) ? (
                              <FaCheck className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Usage Tracker */}
      {currentPlan !== 'BASIC' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Subscription Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <FaCheck className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{usageStats.servicesBooked}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Services Booked</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <FaPercent className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{usageStats.savingsEarned}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Savings Earned</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <FaClock className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{usageStats.priorityBookings}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Priority Bookings</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
