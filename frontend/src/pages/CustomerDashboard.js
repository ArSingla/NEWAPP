import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceOptions from '../components/ServiceOptions';
import ServiceBookingModal from '../components/ServiceBookingModal';
import { dataService } from '../services/dataService';
import { userAPI } from '../services/api';
import { getCookie } from '../utils/cookieUtils';
import { 
  FaSearch, FaCalendarAlt, FaClock, FaUser, FaStar, FaCheckCircle,
  FaTimes, FaEdit, FaComments, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaFire, FaAward
} from 'react-icons/fa';
import '../styles/customer-dashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [userName, setUserName] = useState('User');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableServices, setAvailableServices] = useState(5);
  const [nearbyProviders, setNearbyProviders] = useState(60);

  // Fetch user profile and active bookings
  useEffect(() => {
    loadUserProfile();
    loadActiveBookings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const name = response.data?.name || getCookie('userName') || 'User';
      setUserName(name.split(' ')[0] || 'User');
    } catch (error) {
      const cookieName = getCookie('userName');
      if (cookieName) {
        setUserName(cookieName.split(' ')[0] || 'User');
      }
    }
  };

  const loadActiveBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookings = await dataService.getActiveBookings();
      setActiveBookings(bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setActiveBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingSuccess = (bookingData) => {
    setLastBooking({ booking: bookingData });
    // Show confetti animation
    createConfetti();
    // Reload active bookings after a short delay
    setTimeout(() => {
      loadActiveBookings();
    }, 500);
    // Clear success message after 5 seconds
    setTimeout(() => {
      setLastBooking(null);
    }, 5000);
  };

  const createConfetti = () => {
    const colors = ['#22C55E', '#2563EB', '#F59E0B', '#8B5CF6'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 10);
    }
  };

  const serviceIcons = {
    chef: '🍳',
    bartender: '🍸',
    maid: '🧹',
    waiter: '🛎️',
    driver: '🚗'
  };

  const statusColors = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Upcoming',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  };

  return (
    <div className="page-container bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-welcome mb-12"
        >
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-3"
            >
              Welcome back, {userName} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-white/90 mb-6"
            >
              What do you need help with today?
            </motion.p>
            
            {/* Quick Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="search-bar-container"
            >
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Search services or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-bar"
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="stat-card bg-white dark:bg-slate-800 p-6 shadow-lg"
            style={{ '--stat-color-1': '#2563EB', '--stat-color-2': '#3B82F6' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FaCalendarAlt className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Active Bookings</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {loadingBookings ? '...' : activeBookings.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="stat-card bg-white dark:bg-slate-800 p-6 shadow-lg"
            style={{ '--stat-color-1': '#22C55E', '--stat-color-2': '#10B981' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <FaFire className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Available Services</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">{availableServices}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="stat-card bg-white dark:bg-slate-800 p-6 shadow-lg"
            style={{ '--stat-color-1': '#8B5CF6', '--stat-color-2': '#7C3AED' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <FaUser className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Trusted Providers</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{nearbyProviders}+</p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Success Message */}
        <AnimatePresence>
          {lastBooking && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    🎉 Successfully booked {lastBooking.booking?.serviceType || lastBooking.serviceType}!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Provider: {lastBooking.booking?.providerName || 'Provider'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services Section */}
        <section id="services" className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Our Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose from our wide range of professional services
            </p>
          </div>
          <ServiceOptions onSelect={setSelectedService} />
        </section>

        {/* Active Bookings Section */}
        <section id="bookings" className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Active Bookings
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your upcoming and ongoing services
              </p>
            </div>
          </div>

          {loadingBookings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="card p-6">
                  <div className="skeleton h-6 w-32 mb-4 rounded"></div>
                  <div className="skeleton h-20 w-full rounded"></div>
                </div>
              ))}
            </div>
          ) : activeBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="empty-state bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
            >
              <div className="empty-state-illustration">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" fill="#E2E8F0" opacity="0.3"/>
                  <path d="M60 100 L90 130 L140 70" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No active bookings yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Start by booking a service above. We're here to help you find the perfect service provider!
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Book Your First Service
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeBookings.map((booking, index) => {
                const serviceDate = booking.serviceDate ? new Date(booking.serviceDate) : new Date(booking.createdAt);
                const status = booking.status || 'PENDING';
                const statusStyle = statusColors[status] || statusColors.PENDING;
                
                return (
                  <motion.div
                    key={booking._id || booking.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="booking-timeline-card bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                          {serviceIcons[booking.serviceType?.toLowerCase()] || '📋'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {booking.serviceType?.charAt(0).toUpperCase() + booking.serviceType?.slice(1) || 'Service'}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {booking.providerName || 'Provider'}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <FaCalendarAlt className="h-4 w-4" />
                        <span>{dataService.formatDateTime(serviceDate)}</span>
                      </div>
                      {booking.durationHours && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FaClock className="h-4 w-4" />
                          <span>{booking.durationHours} hours</span>
                        </div>
                      )}
                      {booking.price && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                          <span>₹{booking.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button className="quick-action-btn px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center gap-2">
                        <FaComments className="h-3 w-3" />
                        Chat
                      </button>
                      <button className="quick-action-btn px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center gap-2">
                        <FaEdit className="h-3 w-3" />
                        Reschedule
                      </button>
                      {status === 'COMPLETED' && (
                        <button className="quick-action-btn px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/40 flex items-center gap-2">
                          <FaStar className="h-3 w-3" />
                          Rate
                        </button>
                      )}
                      {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                        <button className="quick-action-btn px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center gap-2">
                          <FaTimes className="h-3 w-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta">
        <button
          onClick={() => {
            const el = document.getElementById('services');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Book Now
        </button>
      </div>

      {/* Service Booking Modal */}
      {selectedService && (
        <ServiceBookingModal
          serviceType={selectedService}
          onClose={() => setSelectedService(null)}
          onBooked={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
