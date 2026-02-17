import { servicesAPI, userAPI } from './api';

// Service types configuration
export const SERVICE_TYPES = {
  CHEF: {
    id: 'chef',
    name: 'Chef',
    icon: '🍳',
    color: '#FF5722',
    description: 'Professional cooking and culinary services',
    basePrice: 150,
    categories: ['Home Cooking', 'Event Catering', 'Meal Prep']
  },
  BARTENDER: {
    id: 'bartender',
    name: 'Bartender',
    icon: '🍸',
    color: '#9C27B0',
    description: 'Expert beverage and bar services',
    basePrice: 120,
    categories: ['Private Events', 'Weddings', 'Corporate Functions']
  },
  MAID: {
    id: 'maid',
    name: 'Maid',
    icon: '🧹',
    color: '#4CAF50',
    description: 'Professional cleaning and housekeeping',
    basePrice: 80,
    categories: ['Regular Cleaning', 'Deep Cleaning', 'Move-in/out']
  },
  WAITER: {
    id: 'waiter',
    name: 'Waiter',
    icon: '🛎️',
    color: '#FFC107',
    description: 'Food service and hospitality',
    basePrice: 100,
    categories: ['Restaurants', 'Events', 'Private Dining']
  },
  DRIVER: {
    id: 'driver',
    name: 'Personal Driver',
    icon: '🚗',
    color: '#2196F3',
    description: 'Professional transportation services',
    basePrice: 200,
    categories: ['Airport Transfer', 'City Tours', 'Business Travel']
  }
};

// Membership tiers configuration
export const MEMBERSHIP_TIERS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 0,
    benefits: ['Standard support', 'Basic features', 'Email notifications'],
    features: ['Book services', 'View booking history', 'Basic customer support']
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    benefits: ['Priority support', 'Advanced features', 'Discounts', 'SMS notifications'],
    features: ['All Basic features', 'Priority booking', '10% service discounts', '24/7 support']
  },
  VIP: {
    id: 'vip',
    name: 'VIP',
    price: 99.99,
    benefits: ['24/7 support', 'All features', 'Exclusive deals', 'Personal concierge'],
    features: ['All Premium features', 'Exclusive service providers', '20% service discounts', 'Personal account manager']
  }
};

// Data service class
class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  clearCache() {
    this.cache.clear();
  }

  // Services
  async getServices() {
    const cached = this.getCache('services');
    if (cached) return cached;

    try {
      const response = await servicesAPI.getAllServices();
      this.setCache('services', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      // Return fallback data
      return Object.values(SERVICE_TYPES);
    }
  }

  async getServiceById(id) {
    const cached = this.getCache(`service_${id}`);
    if (cached) return cached;

    try {
      const response = await servicesAPI.getServiceById(id);
      this.setCache(`service_${id}`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      return SERVICE_TYPES[id.toUpperCase()] || null;
    }
  }

  async getServiceProviders(serviceType) {
    const cached = this.getCache(`providers_${serviceType}`);
    if (cached) return cached;

    try {
      const response = await servicesAPI.getServiceProviders(serviceType);
      this.setCache(`providers_${serviceType}`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  async bookService(bookingData) {
    try {
      const response = await servicesAPI.bookService(bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking service:', error);
      throw error;
    }
  }

  // User data
  async getUserProfile() {
    try {
      const response = await userAPI.getProfile();
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getUserBookings() {
    try {
      const response = await userAPI.getBookings();
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getActiveBookings() {
    try {
      const response = await userAPI.getActiveBookings();
      return response.data;
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      return [];
    }
  }

  async getUserMembership() {
    try {
      const response = await userAPI.getMembership();
      return response.data;
    } catch (error) {
      console.error('Error fetching membership:', error);
      return MEMBERSHIP_TIERS.BASIC;
    }
  }

  // Provider bookings
  async getProviderBookings() {
    try {
      const response = await userAPI.getProviderBookings?.();
      if (response?.data) return response.data;
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
    }
    return [];
  }

  // Static data getters
  getServiceTypes() {
    return SERVICE_TYPES;
  }

  getMembershipTiers() {
    return MEMBERSHIP_TIERS;
  }

  getServiceTypeById(id) {
    if (!id) return null;
    // Handle both lowercase and uppercase
    const upperId = id.toUpperCase();
    const lowerId = id.toLowerCase();
    
    // Map common variations
    const idMap = {
      'CHEF': 'CHEF',
      'BARTENDER': 'BARTENDER',
      'MAID': 'MAID',
      'WAITER': 'WAITER',
      'DRIVER': 'DRIVER',
      'chef': 'CHEF',
      'bartender': 'BARTENDER',
      'maid': 'MAID',
      'waiter': 'WAITER',
      'driver': 'DRIVER'
    };
    
    const mappedId = idMap[upperId] || idMap[lowerId] || upperId;
    return SERVICE_TYPES[mappedId] || null;
  }

  getMembershipTierById(id) {
    return MEMBERSHIP_TIERS[id.toUpperCase()] || MEMBERSHIP_TIERS.BASIC;
  }

  // Utility methods
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // INR specific formatting (India)
  formatPriceINR(amountInRupees) {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountInRupees || 0);
    } catch (_) {
      return `₹${(amountInRupees || 0).toFixed(2)}`;
    }
  }

  // Provider stats
  async getProviderStats() {
    try {
      const response = await userAPI.getProviderStats?.();
      if (response?.data) return response.data;
    } catch (error) {
      // ignore
    }
    // Fallback mock
    return {
      totalServicesProvided: 18,
      totalEarningsInPaise: 1250000, // ₹12,500.00
      pointsGathered: 180,
      userPoints: 180,
      rating: 4.7,
      recent: [
        { serviceType: 'chef', date: Date.now() - 86400000, amountInPaise: 350000 },
        { serviceType: 'maid', date: Date.now() - 2*86400000, amountInPaise: 150000 },
      ],
    };
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;
