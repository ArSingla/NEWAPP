import Foundation

// Web mapping:
// - paymentAPI.getWalletBalance() -> GET /api/payment/wallet/balance -> { walletBalance, points }
// - paymentAPI.topUpWallet(amount) -> POST /api/payment/wallet/top-up -> { walletBalance, amountAdded }
//
// NOTE: The web wallet page uses mock transactions for now. We do the same in iOS.

protocol WalletAPIProtocol {
    func getWalletBalance() async throws -> WalletBalanceDTO
    func topUpWallet(amount: Decimal) async throws -> WalletTopUpResponseDTO
}

struct WalletBalanceDTO: Codable {
    let walletBalance: Decimal?
    let points: Int?
}

struct WalletTopUpResponseDTO: Codable {
    let message: String?
    let walletBalance: Decimal?
    let amountAdded: Decimal?
}

final class MockWalletAPI: WalletAPIProtocol {
    private var currentBalance: Decimal = 2450.75
    private var currentPoints: Int = 120

    func getWalletBalance() async throws -> WalletBalanceDTO {
        try await Task.sleep(nanoseconds: 200_000_000)
        return WalletBalanceDTO(walletBalance: currentBalance, points: currentPoints)
    }

    func topUpWallet(amount: Decimal) async throws -> WalletTopUpResponseDTO {
        try await Task.sleep(nanoseconds: 300_000_000)
        currentBalance += amount
        // Simple mock points award (optional): 1 point per ₹50
        let awarded = NSDecimalNumber(decimal: amount / 50).intValue
        currentPoints += max(0, awarded)
        return WalletTopUpResponseDTO(message: "Wallet topped up successfully", walletBalance: currentBalance, amountAdded: amount)
    }
}

