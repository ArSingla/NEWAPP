import Foundation

enum WalletTransactionType: String, Codable, CaseIterable {
    case topUp = "topup"
    case payment = "payment"
    case cashback = "cashback"

    var displayTitle: String {
        switch self {
        case .topUp: return "Wallet Top-up"
        case .payment: return "Payment"
        case .cashback: return "Cashback Reward"
        }
    }
}

struct WalletTransaction: Identifiable, Hashable, Codable {
    let id: String
    let type: WalletTransactionType
    /// Positive for credits, negative for debits (matches the web mock).
    let amountINR: Decimal
    let date: Date
    let description: String
}

