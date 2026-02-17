import Foundation

enum MockCatalog {
    static let services: [ServiceType] = [
        ServiceType(id: "chef", name: "Chef", emojiIcon: "🍳", badge: "Most Booked", avgPriceText: "₹150/hr", rating: 4.8, availabilityText: "Available"),
        ServiceType(id: "bartender", name: "Bartender", emojiIcon: "🍸", badge: "Top Rated", avgPriceText: "₹120/hr", rating: 4.9, availabilityText: "Available"),
        ServiceType(id: "maid", name: "Maids", emojiIcon: "🧹", badge: nil, avgPriceText: "₹80/hr", rating: 4.7, availabilityText: "Available"),
        ServiceType(id: "waiter", name: "Waiters", emojiIcon: "🛎️", badge: "New", avgPriceText: "₹100/hr", rating: 4.6, availabilityText: "Available"),
        ServiceType(id: "driver", name: "Personal Drivers", emojiIcon: "🚗", badge: nil, avgPriceText: "₹200/hr", rating: 4.8, availabilityText: "Available"),
    ]

    static func emoji(for serviceTypeId: String) -> String {
        services.first(where: { $0.id.lowercased() == serviceTypeId.lowercased() })?.emojiIcon ?? "📋"
    }
}

