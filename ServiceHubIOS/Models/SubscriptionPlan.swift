import Foundation

enum BillingCycle: String, CaseIterable {
    case monthly
    case yearly
}

struct SubscriptionPlan: Identifiable, Hashable {
    let id: String          // "BASIC", "PREMIUM", "VIP"
    let name: String
    let monthlyPrice: Decimal
    let yearlyPrice: Decimal
    let color: String       // for theming (kept from web, but we’ll map lightly)
    let isRecommended: Bool
    let yearlySavingsINR: Decimal
    let benefits: [String]
    let features: [String]
}

struct SubscriptionUsageStats: Hashable {
    var servicesBooked: Int
    var savingsEarnedINR: Decimal
    var priorityBookings: Int
}

