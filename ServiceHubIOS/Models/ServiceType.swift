import Foundation

struct ServiceType: Identifiable, Hashable, Codable {
    let id: String              // matches web `service.id` (e.g., "chef")
    let name: String            // e.g., "Chef"
    let emojiIcon: String       // mapped from web config (🍳, 🍸, ...)

    // These mirror the *web UI cards* (ServiceOptions.js)
    let badge: String?          // "Most Booked" | "Top Rated" | "New"
    let avgPriceText: String    // e.g., "₹150/hr"
    let rating: Double          // e.g., 4.8
    let availabilityText: String // e.g., "Available"
}

