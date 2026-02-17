import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaCocktail, FaBroom, FaConciergeBell, FaCar, FaFire, FaAward, FaStar } from 'react-icons/fa';
import './ServiceOptions.css';

const services = [
  { 
    id: 'chef', 
    name: 'Chef', 
    Icon: FaUtensils, 
    color: "#FF5722",
    gradient: "from-orange-500 to-red-600",
    badge: "Most Booked",
    BadgeIcon: FaFire,
    avgPrice: "₹150/hr",
    rating: 4.8,
    availability: "Available"
  },
  { 
    id: 'bartender', 
    name: 'Bartender', 
    Icon: FaCocktail, 
    color: "#9C27B0",
    gradient: "from-purple-500 to-pink-600",
    badge: "Top Rated",
    BadgeIcon: FaAward,
    avgPrice: "₹120/hr",
    rating: 4.9,
    availability: "Available"
  },
  { 
    id: 'maid', 
    name: 'Maids', 
    Icon: FaBroom, 
    color: "#4CAF50",
    gradient: "from-green-500 to-emerald-600",
    badge: null,
    BadgeIcon: null,
    avgPrice: "₹80/hr",
    rating: 4.7,
    availability: "Available"
  },
  { 
    id: 'waiter', 
    name: 'Waiters', 
    Icon: FaConciergeBell, 
    color: "#FFC107",
    gradient: "from-yellow-500 to-amber-600",
    badge: "New",
    BadgeIcon: FaStar,
    avgPrice: "₹100/hr",
    rating: 4.6,
    availability: "Available"
  },
  { 
    id: 'driver', 
    name: 'Personal Drivers', 
    Icon: FaCar, 
    color: "#2196F3",
    gradient: "from-blue-500 to-cyan-600",
    badge: null,
    BadgeIcon: null,
    avgPrice: "₹200/hr",
    rating: 4.8,
    availability: "Available"
  }
];

const badgeColors = {
  "Most Booked": "bg-red-500 text-white",
  "Top Rated": "bg-yellow-500 text-white",
  "New": "bg-green-500 text-white"
};

export default function ServiceOptions({ onSelect }) {
  return (
    <div className="service-options-grid">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -8 }}
          className="service-card bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg cursor-pointer relative overflow-hidden group"
        >
          {/* Badge */}
          {service.badge && service.BadgeIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`service-badge ${badgeColors[service.badge]} flex items-center gap-1`}
            >
              <service.BadgeIcon />
              <span>{service.badge}</span>
            </motion.div>
          )}

          {/* Icon */}
          <div className={`mb-4 h-20 w-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-xl transition-shadow`}>
            <service.Icon />
          </div>

          {/* Service Name */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {service.name}
          </h3>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Avg. Price</span>
              <span className="font-semibold text-slate-900 dark:text-white">{service.avgPrice}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Rating</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold text-slate-900 dark:text-white">{service.rating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Status</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                {service.availability}
              </span>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-2xl pointer-events-none"></div>
          
          {/* Click Handler */}
          <div 
            className="absolute inset-0 z-10"
            onClick={() => onSelect && onSelect(service.id)}
          ></div>
        </motion.div>
      ))}
    </div>
  );
}
