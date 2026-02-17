import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || getCookie('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Soft-handle unauthorized: clear token but do not hard redirect
      // Let the caller decide how to react (e.g., show login modal or message)
      try { localStorage.removeItem('authToken'); } catch (_) {}
    }
    return Promise.reject(error);
  }
);

// Helper function to get cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (verificationData) => api.post('/auth/verify-email', verificationData),
  resendVerification: (emailData) => api.post('/auth/resend-verification', emailData),
  googleAuth: (token) => api.post('/auth/google', token),
  facebookAuth: (token) => api.post('/auth/facebook', token),
  instagramAuth: (token) => api.post('/auth/instagram', token),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (userData) => api.put('/profile', userData),
  getBookings: () => api.get('/user/bookings'),
  getActiveBookings: () => api.get('/bookings/active'),
  getMembership: () => api.get('/user/membership'),
  getProviderStats: () => api.get('/provider/stats'),
  getProviderBookings: () => api.get('/provider/bookings'),
  getRedemptionInfo: () => api.get('/redemption/info'),
  getRedemptionHistory: () => api.get('/redemption/history'),
  redeemCash: (points) => api.post('/redemption/cash', { points }),
  redeemCoupon: (points) => api.post('/redemption/coupon', { points }),
};

// Services API
export const servicesAPI = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id) => api.get(`/services/${id}`),
  bookService: (bookingData) => api.post('/services/book', bookingData),
  getServiceProviders: (serviceType) => api.get(`/services/providers/${serviceType}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getPaymentHistory: () => api.get('/payments/history'),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (methodData) => api.post('/payments/methods', methodData),
  topUpWallet: (amount) => api.post('/payment/wallet/top-up', { amount }),
  getWalletBalance: () => api.get('/payment/wallet/balance'),
  payFromWallet: (paymentData) => api.post('/payment/wallet/pay', paymentData),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (settings) => api.put('/settings/notifications', settings),
};

export default api;
