import Foundation

enum MockWalletData {
    static let promoCode: String = "WELCOME10"

    static let quickAmounts: [Decimal] = [100, 500, 1000, 2000, 5000]

    static let transactions: [WalletTransaction] = [
        WalletTransaction(
            id: "t1",
            type: .topUp,
            amountINR: 1000,
            date: .now,
            description: "Wallet Top-up"
        ),
        WalletTransaction(
            id: "t2",
            type: .payment,
            amountINR: -500,
            date: Calendar.current.date(byAdding: .day, value: -1, to: .now) ?? .now,
            description: "Chef Service"
        ),
        WalletTransaction(
            id: "t3",
            type: .cashback,
            amountINR: 50,
            date: Calendar.current.date(byAdding: .day, value: -2, to: .now) ?? .now,
            description: "Cashback Reward"
        ),
        WalletTransaction(
            id: "t4",
            type: .topUp,
            amountINR: 2000,
            date: Calendar.current.date(byAdding: .day, value: -3, to: .now) ?? .now,
            description: "Wallet Top-up"
        )
    ]
}

