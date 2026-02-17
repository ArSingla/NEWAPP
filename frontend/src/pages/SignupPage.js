import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import SocialSignupButtons from '../components/SocialSignupButtons';
import { SERVICE_TYPES } from '../services/dataService';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaUserPlus } from 'react-icons/fa';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    providerType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      setLoading(false);
      return;
    }

    // Validate provider type if role is SERVICE_PROVIDER
    if (formData.role === 'SERVICE_PROVIDER' && !formData.providerType) {
      setError('Please select a service type you want to provide');
      setLoading(false);
      return;
    }

    try {
      // Combine firstName and lastName into name for backend
      const backendData = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: formData.role,
        providerType: formData.role === 'SERVICE_PROVIDER' ? formData.providerType : null
      };
      
      const response = await authAPI.register(backendData);
      
      if (response.data.requiresVerification) {
        // Store email for verification
        localStorage.setItem('verificationEmail', formData.email);
        navigate('/verify-email');
      } else {
        // Redirect to login
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center animate-fade-in-down">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
              <FaUserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('signup')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('welcomeMessage')}
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6 animate-fade-in-up" onSubmit={handleSubmit}>
            <div className="form-container glass-effect">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder={t('firstName')}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="input-field"
                    placeholder={t('lastName')}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder={t('email')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="input-field pl-10"
                  placeholder={t('phone')}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={formData.role === 'CUSTOMER'}
                      onChange={(e) => {
                        handleChange(e);
                        if (e.target.value === 'CUSTOMER') {
                          setFormData(prev => ({ ...prev, providerType: '' }));
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hire Services</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="SERVICE_PROVIDER"
                      checked={formData.role === 'SERVICE_PROVIDER'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Provide Services</span>
                  </label>
                </div>
              </div>

              {/* Service Type Selection (only for SERVICE_PROVIDER) */}
              {formData.role === 'SERVICE_PROVIDER' && (
                <div className="animate-fade-in mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Which service do you want to provide? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.values(SERVICE_TYPES).map((service) => (
                      <label
                        key={service.id}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                          formData.providerType === service.id.toUpperCase()
                            ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/30 shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-dark-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="providerType"
                          value={service.id.toUpperCase()}
                          checked={formData.providerType === service.id.toUpperCase()}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-4xl mb-2">{service.icon}</span>
                        <span className={`text-sm font-medium text-center ${
                          formData.providerType === service.id.toUpperCase()
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {service.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                          {service.description}
                        </span>
                      </label>
                    ))}
                  </div>
                  {!formData.providerType && (
                    <p className="mt-3 text-xs text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Please select a service type to continue
                    </p>
                  )}
                </div>
              )}

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pl-10 pr-12"
                    placeholder={t('password')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-12"
                    placeholder={t('confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('loading')}
                  </div>
                ) : (
                  t('signup')
                )}
              </button>

              {/* Social Signup */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400">
                      {t('signupWith')}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <SocialSignupButtons />
                </div>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('alreadyHaveAccount')}{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors hover:underline"
                  >
                    {t('login')}
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
