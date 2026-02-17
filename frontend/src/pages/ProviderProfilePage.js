import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { 
  FaUser, FaStar, FaCheckCircle, FaEdit, FaUtensils, FaCocktail, 
  FaBroom, FaConciergeBell, FaCar, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaGlobe, FaPalette, FaToggleOn, FaToggleOff,
  FaAward, FaCertificate, FaShieldAlt
} from 'react-icons/fa';
import { getCookie } from '../utils/cookieUtils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const serviceCategories = {
  CHEF: { icon: <FaUtensils />, name: 'Chef', color: 'from-orange-500 to-red-500' },
  BARTENDER: { icon: <FaCocktail />, name: 'Bartender', color: 'from-purple-500 to-pink-500' },
  MAID: { icon: <FaBroom />, name: 'Maid', color: 'from-green-500 to-emerald-500' },
  WAITER: { icon: <FaConciergeBell />, name: 'Waiter', color: 'from-yellow-500 to-amber-500' },
  DRIVER: { icon: <FaCar />, name: 'Driver', color: 'from-blue-500 to-cyan-500' }
};

export default function ProviderProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [rating, setRating] = useState(4.7);
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setEditForm({
        name: response.data.name || '',
        phoneNumber: response.data.phoneNumber || '',
        country: response.data.country || '',
        gender: response.data.gender || '',
        preferredLanguage: response.data.preferredLanguage || 'en'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await userAPI.updateProfile(editForm);
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    const fields = ['name', 'email', 'phoneNumber', 'country', 'gender', 'providerType'];
    const completed = fields.filter(f => profile[f]).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateProfileCompleteness();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.name || getCookie('userName') || 'Provider';
  const providerType = profile?.providerType || 'CHEF';
  const serviceInfo = serviceCategories[providerType] || serviceCategories.CHEF;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-slate-800">
                <FaCheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{userName}</h1>
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                  <FaStar className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <FaShieldAlt className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Verified</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{profile?.email || ''}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${serviceInfo.color} text-white font-semibold shadow-lg`}>
                  {serviceInfo.icon}
                  {serviceInfo.name}
                </span>
                {profile?.country && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    <FaMapMarkerAlt className="h-4 w-4" />
                    {profile.country}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <FaEdit className="h-4 w-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Completeness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaAward className="h-5 w-5 text-amber-500" />
              Profile Completeness
            </h2>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completeness}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Complete your profile to get more bookings
          </p>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FaUser className="h-5 w-5 text-blue-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {profile?.name || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FaEnvelope className="h-4 w-4" />
                Email
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                {profile?.email || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FaPhone className="h-4 w-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {profile?.phoneNumber || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="h-4 w-4" />
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {profile?.country || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
              {isEditing ? (
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {profile?.gender || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service Type</label>
              <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${serviceInfo.color} text-white font-semibold`}>
                {serviceInfo.icon}
                {serviceInfo.name}
              </div>
            </div>
          </div>
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
            >
              Save Changes
            </motion.button>
          )}
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FaPalette className="h-5 w-5 text-purple-500" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <FaPalette className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Toggle theme</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-3 rounded-xl ${isDark ? 'bg-purple-500' : 'bg-slate-300'} text-white`}
              >
                {isDark ? <FaToggleOn className="h-6 w-6" /> : <FaToggleOff className="h-6 w-6" />}
              </motion.button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <FaGlobe className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Language</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Preferred language</div>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="hi">🇮🇳 हिंदी</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Service Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FaCertificate className="h-5 w-5 text-amber-500" />
            Service Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(serviceCategories).map(([key, service]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${service.color} text-white text-center cursor-pointer shadow-lg ${
                  providerType === key ? 'ring-4 ring-amber-400' : ''
                }`}
              >
                <div className="text-3xl mb-2 flex justify-center">{service.icon}</div>
                <div className="font-semibold text-sm">{service.name}</div>
                {providerType === key && (
                  <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-1">Active</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
