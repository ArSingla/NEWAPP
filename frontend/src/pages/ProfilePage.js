import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { userAPI } from '../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaCog, FaSignOutAlt, 
  FaArrowRight, FaStar, FaCalendarAlt, FaCheckCircle, FaShieldAlt, FaHeart,
  FaCrown, FaToggleOn, FaToggleOff, FaGlobe, FaLock, FaQuestionCircle, FaAward
} from 'react-icons/fa';
import '../styles/customer-dashboard.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    gender: '',
    country: '',
    address: '',
    memberSince: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [favoriteProviders, setFavoriteProviders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await userAPI.getProfile();
        const data = response.data;
        if (!isMounted) return;
        
        const nameParts = (data.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setUserProfile(prev => ({
          ...prev,
          firstName: firstName,
          lastName: lastName,
          email: data.email || '',
          phone: data.phoneNumber || '',
          role: data.role || 'CUSTOMER',
          gender: data.gender || '',
          country: data.country || '',
          address: '',
          memberSince: data.createdAt ? new Date(data.createdAt) : new Date()
        }));
        
        setEditForm({
          firstName: firstName,
          lastName: lastName,
          phone: data.phoneNumber || '',
          gender: data.gender || '',
          country: data.country || '',
          address: ''
        });

        // Calculate profile completion
        const fields = [firstName, lastName, data.email, data.phoneNumber, data.gender, data.country];
        const filledFields = fields.filter(f => f && f.trim() !== '').length;
        setProfileCompletion(Math.round((filledFields / fields.length) * 100));

        // Mock favorite providers (replace with actual API call)
        setFavoriteProviders([
          { id: 1, name: 'Chef Raj', rating: 4.9, service: 'Chef' },
          { id: 2, name: 'Driver Kumar', rating: 4.8, service: 'Driver' }
        ]);

        // Mock saved addresses (replace with actual API call)
        setSavedAddresses([
          { id: 1, label: 'Home', address: '123 Main St, City, State', isDefault: true },
          { id: 2, label: 'Office', address: '456 Business Ave, City, State', isDefault: false }
        ]);
        
        if (data.preferredLanguage && data.preferredLanguage !== language) {
          changeLanguage(data.preferredLanguage);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: `${editForm.firstName} ${editForm.lastName}`.trim(),
        preferredLanguage: language,
        gender: editForm.gender,
        country: editForm.country,
        phoneNumber: editForm.phone,
      };
      
      const resp = await userAPI.updateProfile(payload);
      
      setUserProfile(prev => ({
        ...prev,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        gender: editForm.gender,
        country: editForm.country,
        address: editForm.address
      }));

      // Recalculate completion
      const fields = [editForm.firstName, editForm.lastName, userProfile.email, editForm.phone, editForm.gender, editForm.country];
      const filledFields = fields.filter(f => f && f.trim() !== '').length;
      setProfileCompletion(Math.round((filledFields / fields.length) * 100));
      
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save profile:', e);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone,
      gender: userProfile.gender,
      country: userProfile.country,
      address: userProfile.address
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const countries = [
    { code: 'IN', name: 'India', phoneCode: '+91' },
    { code: 'US', name: 'United States', phoneCode: '+1' },
    { code: 'RU', name: 'Russia', phoneCode: '+7' },
    { code: 'CN', name: 'China', phoneCode: '+86' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
    { code: 'DE', name: 'Germany', phoneCode: '+49' },
    { code: 'FR', name: 'France', phoneCode: '+33' },
    { code: 'JP', name: 'Japan', phoneCode: '+81' },
    { code: 'KR', name: 'South Korea', phoneCode: '+82' },
  ];

  const getPhoneCode = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.phoneCode : '';
  };

  const getMemberSinceText = () => {
    if (!userProfile.memberSince) return 'Recently';
    const months = Math.floor((new Date() - userProfile.memberSince) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'This month';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="page-container bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white/30 flex items-center justify-center text-4xl font-bold">
                      {userProfile.firstName.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <FaCheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {userProfile.firstName} {userProfile.lastName}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FaStar className="h-5 w-5 text-yellow-300" />
                        <span className="text-lg font-semibold">4.8</span>
                        <span className="text-white/80 text-sm">(12 reviews)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="h-4 w-4 text-white/80" />
                        <span className="text-white/80">Member since {getMemberSinceText()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="px-6 py-3 bg-white/20 backdrop-blur-lg hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 transition-all"
                  >
                    <FaEdit className="h-4 w-4" />
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
          </div>
        </motion.div>

        {/* Profile Completion Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Completion</h2>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            ></motion.div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {profileCompletion < 100 
              ? `Complete your profile to unlock all features! ${100 - profileCompletion}% remaining.`
              : '🎉 Your profile is complete!'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Account Status</h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl font-semibold flex items-center gap-2">
                  <FaUser className="h-4 w-4" />
                  Customer
                </span>
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl font-semibold flex items-center gap-2">
                  <FaCheckCircle className="h-4 w-4" />
                  Active User
                </span>
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl font-semibold flex items-center gap-2">
                  <FaCrown className="h-4 w-4" />
                  Premium Member
                </span>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h2>
                {isEditing ? (
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white font-semibold">{userProfile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white font-semibold">{userProfile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FaEnvelope className="h-4 w-4 text-slate-400" />
                    {userProfile.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <select
                        name="country"
                        value={editForm.country}
                        onChange={handleChange}
                        className="w-24 px-3 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Code</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.phoneCode}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <FaPhone className="h-4 w-4 text-slate-400" />
                      {userProfile.country ? `${getPhoneCode(userProfile.country)} ${userProfile.phone}` : userProfile.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white">
                      {userProfile.gender || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <select
                      name="country"
                      value={editForm.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <FaGlobe className="h-4 w-4 text-slate-400" />
                      {countries.find(c => c.code === userProfile.country)?.name || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Saved Addresses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
                  Saved Addresses
                </h2>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                  Add New
                </button>
              </div>
              {savedAddresses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FaMapMarkerAlt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved addresses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{address.label}</span>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{address.address}</p>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Favorite Providers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaHeart className="h-5 w-5 text-red-500" />
                  Favorite Providers
                </h2>
              </div>
              {favoriteProviders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FaHeart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No favorite providers yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteProviders.map((provider) => (
                    <div key={provider.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">{provider.name}</p>
                          <div className="flex items-center gap-2">
                            <FaStar className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">{provider.rating}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-500">•</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{provider.service}</span>
                          </div>
                        </div>
                        <button className="text-red-500 hover:text-red-600">
                          <FaHeart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Preferences
              </h3>
              
              {/* Theme Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Theme
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-between"
                >
                  <span className="font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  {isDark ? (
                    <FaToggleOn className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FaToggleOff className="h-6 w-6 text-slate-400" />
                  )}
                </motion.button>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Language
                </label>
                <select
                  value={language}
                  onChange={async (e) => {
                    const newLang = e.target.value;
                    changeLanguage(newLang);
                    try {
                      await userAPI.updateProfile({ preferredLanguage: newLang });
                    } catch (err) {
                      console.error('Error updating language:', err);
                    }
                  }}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Security & Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FaShieldAlt className="h-5 w-5 text-blue-600" />
                Security & Privacy
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3">
                  <FaLock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Change Password</span>
                </button>
                <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3">
                  <FaShieldAlt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Privacy Settings</span>
                </button>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FaQuestionCircle className="h-5 w-5 text-blue-600" />
                Support & Help
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3">
                  <FaQuestionCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Help Center</span>
                </button>
                <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3">
                  <FaEnvelope className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Support</span>
                </button>
              </div>
            </motion.div>

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all flex items-center justify-center gap-3 font-semibold"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span>Logout</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
