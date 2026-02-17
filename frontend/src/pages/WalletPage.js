import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentAPI } from '../services/api';
import { dataService } from '../services/dataService';
import { 
  FaWallet, FaPlus, FaRupeeSign, FaCheckCircle, FaExclamationCircle,
  FaArrowDown, FaArrowUp, FaGift, FaTicketAlt, FaHistory, FaCopy,
  FaStar, FaPercent, FaShieldAlt
} from 'react-icons/fa';
import '../styles/customer-dashboard.css';

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transactions, setTransactions] = useState([]);
  const [cashbackEarned, setCashbackEarned] = useState(0);
  const [rewardsProgress, setRewardsProgress] = useState(0);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getWalletBalance();
      setWalletBalance(response.data.walletBalance || 0);
      setPoints(response.data.points || 0);
      
      // Mock transaction history (replace with actual API call when available)
      setTransactions([
        { id: 1, type: 'topup', amount: 1000, date: new Date(), description: 'Wallet Top-up', icon: <FaArrowDown />, color: 'text-green-600' },
        { id: 2, type: 'payment', amount: -500, date: new Date(Date.now() - 86400000), description: 'Chef Service', icon: <FaArrowUp />, color: 'text-red-600' },
        { id: 3, type: 'cashback', amount: 50, date: new Date(Date.now() - 172800000), description: 'Cashback Reward', icon: <FaGift />, color: 'text-purple-600' },
        { id: 4, type: 'topup', amount: 2000, date: new Date(Date.now() - 259200000), description: 'Wallet Top-up', icon: <FaArrowDown />, color: 'text-green-600' },
      ]);
      
      // Calculate cashback (mock: 5% of total top-ups)
      const totalTopUps = transactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0);
      setCashbackEarned(totalTopUps * 0.05);
      
      // Calculate rewards progress (mock: based on points)
      setRewardsProgress(Math.min((points / 200) * 100, 100));
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setMessage({ type: 'error', text: 'Failed to load wallet data' });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (amount < 10) {
      setMessage({ type: 'error', text: 'Minimum top-up amount is ₹10' });
      return;
    }

    try {
      setTopUpLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await paymentAPI.topUpWallet(amount);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${dataService.formatPriceINR(amount)} to your wallet!` 
      });
      
      setWalletBalance(response.data.walletBalance);
      setTopUpAmount('');
      
      // Add bonus for first recharge
      if (transactions.length === 0) {
        setMessage({ 
          type: 'success', 
          text: `🎉 Welcome bonus! You got ₹${amount * 0.1} extra for your first recharge!` 
        });
      }
      
      // Reload wallet data
      await loadWalletData();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error topping up wallet:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to top up wallet. Please try again.' 
      });
    } finally {
      setTopUpLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];
  const promoCode = 'WELCOME10'; // Mock promo code

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="skeleton h-12 w-64 mx-auto mb-4 rounded"></div>
          <div className="skeleton h-32 w-full max-w-2xl mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
          My Wallet
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Manage your wallet balance, rewards, and transactions
        </p>
      </motion.div>

      {/* Animated Wallet Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">Wallet Balance</p>
                <div className="flex items-baseline gap-2">
                  <FaRupeeSign className="h-8 w-8 text-white" />
                  <span className="text-6xl font-bold text-white">
                    {walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="h-24 w-24 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center"
              >
                <FaWallet className="h-12 w-12 text-white" />
              </motion.div>
            </div>
            
            <div className="flex items-center gap-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-white/70 text-xs mb-1">Points Earned</p>
                <div className="flex items-center gap-2">
                  <FaStar className="h-5 w-5 text-yellow-300" />
                  <span className="text-2xl font-bold text-white">{points}</span>
                </div>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Cashback</p>
                <div className="flex items-center gap-2">
                  <FaGift className="h-5 w-5 text-pink-300" />
                  <span className="text-2xl font-bold text-white">₹{cashbackEarned.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>
      </motion.div>

      {/* Message Display */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <FaExclamationCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${
              message.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {message.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Up Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <FaPlus className="h-6 w-6 text-blue-600" />
            Add Money to Wallet
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter Amount (₹)
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <FaRupeeSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
              >
                <FaPlus className="h-4 w-4" />
                <span>{topUpLoading ? 'Adding...' : 'Add Money'}</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Amounts</div>
            <div className="grid grid-cols-5 gap-3">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-slate-700 dark:text-slate-300 font-semibold"
                >
                  ₹{amount}
                </motion.button>
              ))}
            </div>
          </div>

          {/* First Recharge Bonus Banner */}
          {transactions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <FaStar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200">First Recharge Bonus!</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Get 10% extra on your first wallet top-up</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Rewards & Cashback Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Rewards Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaGift className="h-5 w-5 text-purple-600" />
              Rewards Progress
            </h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Points to next reward</span>
                <span className="font-semibold text-slate-900 dark:text-white">{points}/200</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rewardsProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                ></motion.div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Earn 200 points to unlock exclusive rewards
            </p>
          </div>

          {/* Promo Codes */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTicketAlt className="h-5 w-5 text-blue-600" />
              Promo Codes
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 dark:text-blue-200">{promoCode}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard.writeText(promoCode);
                      setMessage({ type: 'success', text: 'Promo code copied!' });
                      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
                    }}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  >
                    <FaCopy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </motion.button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Get 10% off on your first booking</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaHistory className="h-6 w-6 text-blue-600" />
            Recent Transactions
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                    transaction.type === 'topup' ? 'from-green-500 to-emerald-600' :
                    transaction.type === 'payment' ? 'from-red-500 to-pink-600' :
                    'from-purple-500 to-pink-600'
                  } flex items-center justify-center text-white`}>
                    {transaction.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{transaction.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {dataService.formatDateTime(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${transaction.color}`}>
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <FaPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Add Money</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Add money to your wallet using the form above</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Instant Payments</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Use your wallet balance to pay for services instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <FaGift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Earn Rewards</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get cashback and points on every transaction</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
              <FaShieldAlt className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Secure & Safe</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your wallet balance is secure and can be used anytime</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
