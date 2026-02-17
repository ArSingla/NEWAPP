import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

export default function ServiceBookingModal({ serviceType, onClose, onBooked }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadProviders() {
      setLoading(true);
      setError('');
      try {
        const list = await dataService.getServiceProviders(serviceType);
        if (isMounted) setProviders(list);
      } catch (e) {
        if (isMounted) setError('Failed to load providers');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (serviceType) {
      loadProviders();
    }
    return () => {
      isMounted = false;
    };
  }, [serviceType]);

  const handleSelectProvider = async (provider) => {
    try {
      setLoading(true);
      setError('');
      const bookingPayload = {
        serviceType,
        providerId: provider.id || provider._id || provider.email || provider.name,
        providerName: provider.name || provider.fullName || 'Provider',
        date: new Date().toISOString(),
        amount: provider.pricePerHour || 0,
        currency: 'INR'
      };
      const result = await dataService.bookService(bookingPayload);
      // Call onBooked with the booking data
      if (onBooked) {
        onBooked(result?.booking || result || bookingPayload);
      }
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    } catch (e) {
      console.error('Booking error:', e);
      setError('Failed to book service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const serviceMeta = dataService.getServiceTypeById(serviceType) || { 
    name: serviceType ? serviceType.charAt(0).toUpperCase() + serviceType.slice(1) : 'Service' 
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose && onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Choose a {serviceMeta.name} Provider
          </h3>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold disabled:opacity-50"
            title="Close"
          >
            ×
          </button>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}
        {loading && providers.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">No providers available for this service.</div>
        ) : (
          <div className="max-h-96 overflow-y-auto flex-1">
            <ul className="divide-y divide-gray-200 dark:divide-dark-700">
              {providers.map((p, index) => (
                <li key={p.id || p._id || p.email || p.name || index} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {p.name || p.fullName || p.email}
                        </div>
                        {p.isAvailable === false && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Busy</span>
                        )}
                        {p.isAvailable !== false && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">Available</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {p.rating && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            ⭐ {p.rating} ({p.totalRatings || 0} reviews)
                          </div>
                        )}
                        {p.experience && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.experience}</div>
                        )}
                        {p.pricePerHour && (
                          <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                            ₹{p.pricePerHour}/hr
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectProvider(p)}
                      disabled={p.isAvailable === false || loading}
                      className="ml-4 px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Booking...' : 'Select'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


