import Foundation

@MainActor
final class WalletViewModel: ObservableObject {
    @Published var isLoading: Bool = true
    @Published var isTopUpLoading: Bool = false

    @Published var balance: WalletBalance = WalletBalance(balanceINR: 0, points: 0)
    @Published var transactions: [WalletTransaction] = []

    @Published var topUpAmountText: String = ""

    @Published var banner: BannerMessage? = nil

    @Published var cashbackEarnedINR: Decimal = 0
    @Published var rewardsProgressPercent: Double = 0 // 0...100

    let promoCode: String = MockWalletData.promoCode
    let quickAmounts: [Decimal] = MockWalletData.quickAmounts

    private let api: WalletAPIProtocol

    init(api: WalletAPIProtocol = MockWalletAPI()) {
        self.api = api
        self.transactions = MockWalletData.transactions // mock, like the web UI
        recalcDerived()
    }

    func onAppear() {
        Task { await loadWallet() }
    }

    func loadWallet() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let dto = try await api.getWalletBalance()
            balance = WalletBalance(
                balanceINR: dto.walletBalance ?? 0,
                points: dto.points ?? 0
            )
            recalcDerived()
        } catch {
            banner = .error("Failed to load wallet data")
        }
    }

    func setTopUpAmount(_ amount: Decimal) {
        topUpAmountText = formatMoneyPlain(amount)
    }

    func topUp() async {
        let amount = parseAmount(topUpAmountText)
        guard amount > 0 else {
            banner = .error("Please enter a valid amount")
            return
        }
        guard amount >= 10 else {
            banner = .error("Minimum top-up amount is ₹10")
            return
        }

        isTopUpLoading = true
        defer { isTopUpLoading = false }

        do {
            let res = try await api.topUpWallet(amount: amount)
            let newBalance = res.walletBalance ?? (balance.balanceINR + amount)
            balance.balanceINR = newBalance

            banner = .success("Successfully added \(formatINR(amount)) to your wallet!")

            // Web logic: first recharge bonus if no transactions. (We keep same behavior.)
            if transactions.isEmpty {
                let bonus = amount * 0.10
                banner = .success("🎉 Welcome bonus! You got ₹\(formatMoneyPlain(bonus)) extra for your first recharge!")
            }

            // Add a local transaction record (since web has mock txns for now)
            transactions.insert(
                WalletTransaction(
                    id: UUID().uuidString,
                    type: .topUp,
                    amountINR: amount,
                    date: .now,
                    description: "Wallet Top-up"
                ),
                at: 0
            )

            topUpAmountText = ""
            recalcDerived()

            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 4_000_000_000)
                self.banner = nil
            }
        } catch {
            banner = .error("Failed to top up wallet. Please try again.")
        }
    }

    func copyPromoCode() {
        // Implemented in View via UIPasteboard (UIKit).
        banner = .success("Promo code copied!")
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            self.banner = nil
        }
    }

    // MARK: - Derived values

    private func recalcDerived() {
        let totalTopUps: Decimal = transactions
            .filter { $0.type == .topUp }
            .reduce(0) { $0 + max(0, $1.amountINR) }

        cashbackEarnedINR = totalTopUps * 0.05

        // Web: points/200 capped at 100%
        rewardsProgressPercent = min((Double(balance.points) / 200.0) * 100.0, 100.0)
    }

    // MARK: - Formatting/parsing

    func formatINR(_ amount: Decimal) -> String {
        // Simple INR formatting without locale dependencies for now.
        "₹" + formatMoneyPlain(amount)
    }

    func formatMoneyPlain(_ amount: Decimal) -> String {
        let ns = NSDecimalNumber(decimal: amount)
        // Keep 2 decimals like the web UI.
        return String(format: "%.2f", ns.doubleValue)
    }

    private func parseAmount(_ text: String) -> Decimal {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "₹", with: "")
            .replacingOccurrences(of: ",", with: "")
        return Decimal(string: cleaned) ?? 0
    }
}

struct BannerMessage: Identifiable, Hashable {
    enum Kind: Hashable { case success, error }
    let id = UUID()
    let kind: Kind
    let text: String

    static func success(_ text: String) -> BannerMessage { .init(kind: .success, text: text) }
    static func error(_ text: String) -> BannerMessage { .init(kind: .error, text: text) }
}

