import Foundation

enum MockSubscriptionData {
    static let plans: [SubscriptionPlan] = [
        SubscriptionPlan(
            id: "BASIC",
            name: "Basic",
            monthlyPrice: 0,
            yearlyPrice: 0,
            color: "blue",
            isRecommended: false,
            yearlySavingsINR: 0,
            benefits: [
                "Standard support",
                "Basic features",
                "Email notifications",
                "Book services",
                "View booking history"
            ],
            features: [
                "Standard support",
                "Basic features",
                "Email notifications",
                "Book services",
                "View booking history"
            ]
        ),
        SubscriptionPlan(
            id: "PREMIUM",
            name: "Premium",
            monthlyPrice: 29.99,
            yearlyPrice: 299.99,
            color: "purple",
            isRecommended: true,
            yearlySavingsINR: 60,
            benefits: [
                "All Basic features",
                "Priority support",
                "Advanced features",
                "10% service discounts",
                "SMS notifications",
                "Priority booking"
            ],
            features: [
                "All Basic features",
                "Priority support",
                "Advanced features",
                "10% service discounts",
                "SMS notifications",
                "Priority booking"
            ]
        ),
        SubscriptionPlan(
            id: "VIP",
            name: "VIP",
            monthlyPrice: 99.99,
            yearlyPrice: 999.99,
            color: "yellow",
            isRecommended: false,
            yearlySavingsINR: 200,
            benefits: [
                "All Premium features",
                "24/7 support",
                "Exclusive deals",
                "20% service discounts",
                "Personal concierge",
                "Exclusive service providers",
                "Personal account manager"
            ],
            features: [
                "All Premium features",
                "24/7 support",
                "Exclusive deals",
                "20% service discounts",
                "Personal concierge",
                "Exclusive service providers",
                "Personal account manager"
            ]
        )
    ]

    static let usageStats = SubscriptionUsageStats(
        servicesBooked: 12,
        savingsEarnedINR: 450,
        priorityBookings: 8
    )
}

