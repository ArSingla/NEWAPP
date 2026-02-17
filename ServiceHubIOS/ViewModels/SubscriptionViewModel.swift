import Foundation

@MainActor
final class SubscriptionViewModel: ObservableObject {
    @Published var plans: [SubscriptionPlan] = MockSubscriptionData.plans
    @Published var currentPlanId: String = "BASIC"
    @Published var billingCycle: BillingCycle = .monthly
    @Published var walletBalanceINR: Decimal = 0
    @Published var isLoading: Bool = true
    @Published var isProcessing: Bool = false
    @Published var banner: BannerMessage? = nil
    @Published var showComparison: Bool = false
    @Published var usageStats: SubscriptionUsageStats = MockSubscriptionData.usageStats

    private let subscriptionAPI: SubscriptionAPIProtocol
    private let walletAPI: WalletAPIProtocol

    init(
        subscriptionAPI: SubscriptionAPIProtocol = MockSubscriptionAPI(),
        walletAPI: WalletAPIProtocol = MockWalletAPI()
    ) {
        self.subscriptionAPI = subscriptionAPI
        self.walletAPI = walletAPI
    }

    func onAppear() {
        Task { await loadData() }
    }

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let subTask = subscriptionAPI.getCurrentSubscription()
            async let walletTask = walletAPI.getWalletBalance()

            let (subDTO, walletDTO) = try await (subTask, walletTask)

            currentPlanId = subDTO.planType ?? "BASIC"
            walletBalanceINR = walletDTO.walletBalance ?? 0
        } catch {
            // Use defaults; show optional error later.
        }
    }

    func subscribe(to plan: SubscriptionPlan) async {
        guard !isProcessing else { return }

        if plan.id == "BASIC" {
            banner = .success("Basic plan is free and already active")
            return
        }

        let price = price(for: plan, cycle: billingCycle)
        if walletBalanceINR < price {
            banner = .error("Insufficient wallet balance. You need \(formatINR(price)). Please add money to your wallet first.")
            return
        }

        isProcessing = true
        defer { isProcessing = false }

        do {
            let updated = try await subscriptionAPI.subscribe(planType: plan.id, billingCycle: billingCycle)
            currentPlanId = updated.planType ?? currentPlanId
            banner = .success("🎉 Successfully subscribed to \(plan.name) plan!")

            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 5_000_000_000)
                self.banner = nil
            }
        } catch {
            banner = .error("Failed to subscribe. Please try again.")
        }
    }

    func cancelSubscription() async {
        guard !isProcessing else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            let updated = try await subscriptionAPI.cancel()
            currentPlanId = updated.planType ?? "BASIC"
            banner = .success("Subscription cancelled successfully")

            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 5_000_000_000)
                self.banner = nil
            }
        } catch {
            banner = .error("Failed to cancel subscription")
        }
    }

    // MARK: - Helpers

    func price(for plan: SubscriptionPlan, cycle: BillingCycle) -> Decimal {
        switch cycle {
        case .monthly: return plan.monthlyPrice
        case .yearly: return plan.yearlyPrice
        }
    }

    func formatINR(_ amount: Decimal) -> String {
        let ns = NSDecimalNumber(decimal: amount)
        return "₹" + String(format: "%.2f", ns.doubleValue)
    }

    var recommendedPlan: SubscriptionPlan? {
        plans.first(where: { $0.isRecommended })
    }

    var currentPlan: SubscriptionPlan? {
        plans.first(where: { $0.id == currentPlanId })
    }
}

