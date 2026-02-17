import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import '../styles/provider-dashboard.css';
import { dataService } from '../services/dataService';
import { userAPI } from '../services/api';
import { 
  FaBriefcase, FaRupeeSign, FaStar, FaCoins, FaGift, FaWallet, 
  FaUtensils, FaCocktail, FaBroom, FaConciergeBell, FaCar,
  FaPlus, FaToggleOn, FaToggleOff, FaChartLine, FaCheckCircle,
  FaClock, FaUser, FaSmile, FaUserCircle
} from 'react-icons/fa';
import { getCookie } from '../utils/cookieUtils';

const serviceIcons = {
  chef: <FaUtensils className="h-5 w-5" />,
  bartender: <FaCocktail className="h-5 w-5" />,
  maid: <FaBroom className="h-5 w-5" />,
  waiter: <FaConciergeBell className="h-5 w-5" />,
  driver: <FaCar className="h-5 w-5" />
};

const statusColors = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', darkBg: 'dark:bg-amber-900/20', darkText: 'dark:text-amber-200' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900/20', darkText: 'dark:text-blue-200' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900/20', darkText: 'dark:text-purple-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900/20', darkText: 'dark:text-green-200' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900/20', darkText: 'dark:text-red-200' }
};

export default function ProviderDashboard() {
  const [stats, setStats] = useState({
    totalServicesProvided: 0,
    totalEarningsInPaise: 0,
    pointsGathered: 0,
    userPoints: 0,
    rating: 0,
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [redemptionInfo, setRedemptionInfo] = useState(null);
  const [showRedemption, setShowRedemption] = useState(false);
  const [redemptionPoints, setRedemptionPoints] = useState('');
  const [redemptionType, setRedemptionType] = useState('CASH');
  const [redeeming, setRedeeming] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [userName, setUserName] = useState('Provider');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const name = getCookie('userName') || 'Provider';
        setUserName(name);
        
        const [statsResp, bookingsResp, redemptionResp, profileResp] = await Promise.all([
          dataService.getProviderStats(),
          dataService.getProviderBookings?.() || [],
          userAPI.getRedemptionInfo?.().catch(() => null),
          userAPI.getProfile?.().catch(() => null)
        ]);
        if (isMounted) {
          setStats(statsResp);
          setBookings(bookingsResp || []);
          if (redemptionResp?.data) {
            setRedemptionInfo(redemptionResp.data);
          }
          if (profileResp?.data) {
            setUserProfile(profileResp.data);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingBookings(false);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleRedeem = async () => {
    const points = parseInt(redemptionPoints);
    if (!points || points < 200) {
      alert('Minimum 200 points required for redemption');
      return;
    }
    if (points > (stats.userPoints || 0)) {
      alert('Insufficient points');
      return;
    }

    setRedeeming(true);
    try {
      const response = redemptionType === 'CASH' 
        ? await userAPI.redeemCash(points)
        : await userAPI.redeemCoupon(points);
      
      if (response.data) {
        alert(redemptionType === 'CASH' 
          ? `Successfully redeemed ${points} points for ₹${response.data.redemption?.cashAmount || (points / 10 * 5)}`
          : `Coupon generated: ${response.data.redemption?.couponCode || 'N/A'}`
        );
        const statsResp = await dataService.getProviderStats();
        setStats(statsResp);
        const redemptionResp = await userAPI.getRedemptionInfo();
        if (redemptionResp?.data) setRedemptionInfo(redemptionResp.data);
        setShowRedemption(false);
        setRedemptionPoints('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  // Generate mock chart data
  const earningsData = [
    { month: 'Jan', earnings: 12000 },
    { month: 'Feb', earnings: 15000 },
    { month: 'Mar', earnings: 18000 },
    { month: 'Apr', earnings: 22000 },
    { month: 'May', earnings: 25000 },
    { month: 'Jun', earnings: (stats.totalEarningsInPaise || 0) / 100 }
  ];

  const servicesByCategory = stats.recent?.reduce((acc, service) => {
    const type = service.serviceType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  const pieData = Object.entries(servicesByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const earningsInINR = dataService.formatPriceINR((stats.totalEarningsInPaise || 0) / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    Welcome back, {userName}! 👋
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isOnline ? 'You\'re online and ready for bookings' : 'You\'re offline'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isOnline
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isOnline ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                {isOnline ? 'Online' : 'Go Online'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-100 text-sm font-medium">Services Provided</div>
              <div className="bg-white/20 rounded-lg p-3">
                <FaBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalServicesProvided || 0}</div>
            <div className="text-blue-100 text-sm">Completed services</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-green-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-100 text-sm font-medium">Total Earnings</div>
              <div className="bg-white/20 rounded-lg p-3">
                <FaRupeeSign className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{earningsInINR}</div>
            <div className="text-green-100 text-sm">From all services</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-amber-100 text-sm font-medium">Average Rating</div>
              <div className="bg-white/20 rounded-lg p-3">
                <FaStar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.rating?.toFixed(1) || '0.0'}</div>
            <div className="text-amber-100 text-sm">Based on reviews</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/30 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-purple-100 text-sm font-medium">Your Points</div>
              <div className="bg-white/20 rounded-lg p-3">
                <FaCoins className="h-6 w-6" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.userPoints || 0}</div>
            <div className="text-purple-100 text-sm">
              {redemptionInfo?.canRedeem ? `Redeem ₹${redemptionInfo.redeemableAmount || 0}` : `${redemptionInfo?.pointsNeeded || 200 - (stats.userPoints || 0)} to redeem`}
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="h-5 w-5 text-blue-500" />
                Earnings Over Time
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#22C55E" 
                  strokeWidth={3}
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Services by Category */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FaBriefcase className="h-5 w-5 text-purple-500" />
              Services by Category
            </h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FaBriefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No services data yet</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FaPlus />, label: 'Add Service', bgClass: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', borderClass: 'border-blue-200 dark:border-blue-800', iconClass: 'text-blue-600 dark:text-blue-400', textClass: 'text-blue-700 dark:text-blue-300', onClick: () => {} },
              { icon: <FaToggleOn />, label: 'Set Availability', bgClass: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', borderClass: 'border-green-200 dark:border-green-800', iconClass: 'text-green-600 dark:text-green-400', textClass: 'text-green-700 dark:text-green-300', onClick: () => setIsOnline(!isOnline) },
              { icon: <FaChartLine />, label: 'View Earnings', bgClass: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', borderClass: 'border-purple-200 dark:border-purple-800', iconClass: 'text-purple-600 dark:text-purple-400', textClass: 'text-purple-700 dark:text-purple-300', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
              { icon: <FaUserCircle />, label: 'View Profile', bgClass: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20', borderClass: 'border-amber-200 dark:border-amber-800', iconClass: 'text-amber-600 dark:text-amber-400', textClass: 'text-amber-700 dark:text-amber-300', onClick: () => window.location.href = '/provider/profile' }
            ].map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.bgClass} border ${action.borderClass} hover:shadow-lg transition-all`}
              >
                <div className={`${action.iconClass} mb-2 flex justify-center text-xl`}>
                  {action.icon}
                </div>
                <div className={`text-sm font-semibold ${action.textClass}`}>
                  {action.label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Services & Upcoming Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Services */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="h-5 w-5 text-green-500" />
              Recent Services
            </h2>
            {stats.recent?.length ? (
              <div className="space-y-3">
                {stats.recent.slice(0, 5).map((r, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white`}>
                      {serviceIcons[r.serviceType] || <FaBriefcase />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white capitalize">
                        {r.serviceType}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {dataService.formatDateTime(r.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {dataService.formatPriceINR((r.amountInPaise || 0) / 100)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <FaSmile className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No services yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Complete your first booking to see it here!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold shadow-lg"
                >
                  Get Started
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Upcoming Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FaClock className="h-5 w-5 text-blue-500" />
              Upcoming Bookings
            </h2>
            {loadingBookings ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : bookings && bookings.length ? (
              <div className="space-y-3">
                {bookings.map((b, idx) => {
                  const statusStyle = statusColors[b.status] || statusColors.PENDING;
                  return (
                    <motion.div
                      key={b._id || b.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      whileHover={{ x: -4, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white`}>
                        {serviceIcons[b.serviceType] || <FaBriefcase />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white capitalize">
                          {b.serviceType} - {b.providerName || 'Service'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {dataService.formatDateTime(b.serviceDate || b.bookingDate || b.createdAt)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.darkBg} ${statusStyle.darkText}`}>
                        {b.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
                  <FaClock className="h-12 w-12 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No upcoming bookings</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">When customers book your services, they'll appear here</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-amber-500 text-white rounded-xl font-semibold shadow-lg"
                >
                  Stay Online
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Points Redemption Card */}
        {stats.userPoints >= 200 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl shadow-purple-500/30 p-6 text-white mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎉 You can redeem points!</h3>
                <p className="text-purple-100 mb-4">
                  You have {stats.userPoints} points. Redeem them for cash or coupons!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRedemption(true)}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg"
                >
                  Redeem Now
                </motion.button>
              </div>
              <div className="hidden md:block">
                <FaCoins className="h-24 w-24 text-white/30" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Redemption Modal */}
        {showRedemption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !redeeming && setShowRedemption(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Redeem Points</h3>
              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Current Points: <span className="font-bold text-purple-600 dark:text-purple-400">{stats.userPoints || 0}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Rate: 10 points = ₹5 | Minimum: 200 points
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Redemption Type</label>
                <div className="flex gap-4">
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      redemptionType === 'CASH'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="CASH"
                      checked={redemptionType === 'CASH'}
                      onChange={(e) => setRedemptionType(e.target.value)}
                      className="sr-only"
                    />
                    <FaWallet className={`h-5 w-5 ${redemptionType === 'CASH' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${redemptionType === 'CASH' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>Cash</span>
                  </motion.label>
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      redemptionType === 'COUPON'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="COUPON"
                      checked={redemptionType === 'COUPON'}
                      onChange={(e) => setRedemptionType(e.target.value)}
                      className="sr-only"
                    />
                    <FaGift className={`h-5 w-5 ${redemptionType === 'COUPON' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${redemptionType === 'COUPON' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>Coupon</span>
                  </motion.label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Points to Redeem</label>
                <input
                  type="number"
                  min="200"
                  max={stats.userPoints || 0}
                  step="10"
                  value={redemptionPoints}
                  onChange={(e) => setRedemptionPoints(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter points (min 200)"
                />
                {redemptionPoints && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-semibold">
                    You'll get: ₹{Math.floor((parseInt(redemptionPoints) || 0) / 10 * 5)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRedeem}
                  disabled={redeeming || !redemptionPoints || parseInt(redemptionPoints) < 200}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeeming ? 'Processing...' : 'Redeem'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRedemption(false)}
                  disabled={redeeming}
                  className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Mobile Sticky CTA */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg ${
              isOnline
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
            }`}
          >
            {isOnline ? '✓ You\'re Online' : 'Go Online'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
