import Foundation

// Web mapping:
// - GET /api/subscription          -> current subscription { planType, status, ... }
// - POST /api/subscription/subscribe { planType, paymentMethod } -> subscription + updates wallet
// - POST /api/subscription/cancel  -> cancel active subscription
//
// Here we define DTOs and a mock implementation only. Real wiring can reuse the same endpoints.

protocol SubscriptionAPIProtocol {
    func getCurrentSubscription() async throws -> SubscriptionDTO
    func subscribe(planType: String, billingCycle: BillingCycle) async throws -> SubscriptionDTO
    func cancel() async throws -> SubscriptionDTO
}

struct SubscriptionDTO: Codable {
    let planType: String?
    let status: String?
}

final class MockSubscriptionAPI: SubscriptionAPIProtocol {
    private var current: SubscriptionDTO = SubscriptionDTO(planType: "BASIC", status: "ACTIVE")

    func getCurrentSubscription() async throws -> SubscriptionDTO {
        try await Task.sleep(nanoseconds: 200_000_000)
        return current
    }

    func subscribe(planType: String, billingCycle: BillingCycle) async throws -> SubscriptionDTO {
        try await Task.sleep(nanoseconds: 300_000_000)
        current = SubscriptionDTO(planType: planType, status: "ACTIVE")
        return current
    }

    func cancel() async throws -> SubscriptionDTO {
        try await Task.sleep(nanoseconds: 200_000_000)
        current = SubscriptionDTO(planType: "BASIC", status: "ACTIVE")
        return current
    }
}

