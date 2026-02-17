import SwiftUI
import UIKit

// Web mapping:
// `frontend/src/pages/WalletPage.js` -> WalletView
// - Gradient wallet balance card
// - Top-up input + quick amounts
// - Rewards progress + promo code
// - Recent transactions (mock in web -> mock in iOS)

struct WalletView: View {
    @StateObject private var vm = WalletViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    header

                    walletBalanceCard

                    if let banner = vm.banner {
                        bannerView(banner)
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }

                    topUpSection
                    rewardsAndPromoSection
                    transactionsSection
                    infoSection
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .background(SHTheme.Colors.background)
            .navigationTitle("My Wallet")
            .navigationBarTitleDisplayMode(.large)
            .task { vm.onAppear() }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("My Wallet")
                .font(.largeTitle.weight(.bold))
            Text("Manage your wallet balance, rewards, and transactions")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Wallet Card

    private var walletBalanceCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [SHTheme.Colors.primary, SHTheme.Colors.purple, Color.pink],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Wallet Balance")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.8))

                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("₹")
                                .font(.title.weight(.bold))
                                .foregroundStyle(.white)
                            Text(vm.formatMoneyPlain(vm.balance.balanceINR))
                                .font(.system(size: 44, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                                .minimumScaleFactor(0.6)
                                .lineLimit(1)
                        }
                    }

                    Spacer()

                    ZStack {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(.white.opacity(0.18))
                        Image(systemName: "wallet.pass.fill")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .frame(width: 72, height: 72)
                }

                Divider().overlay(.white.opacity(0.22))

                HStack(spacing: 18) {
                    statPill(title: "Points Earned", value: "\(vm.balance.points)", symbol: "star.fill", symbolColor: .yellow)
                    statPill(title: "Cashback", value: vm.formatINR(vm.cashbackEarnedINR), symbol: "gift.fill", symbolColor: .pink)
                }
            }
            .padding(18)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Wallet balance \(vm.formatINR(vm.balance.balanceINR))")
    }

    private func statPill(title: String, value: String, symbol: String, symbolColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.white.opacity(0.75))
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .foregroundStyle(symbolColor.opacity(0.95))
                Text(value)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Banner

    private func bannerView(_ banner: BannerMessage) -> some View {
        let isSuccess = banner.kind == .success
        return HStack(spacing: 10) {
            Image(systemName: isSuccess ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                .foregroundStyle(isSuccess ? SHTheme.Colors.success : .red)
            Text(banner.text)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(uiColor: .systemBackground))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke((isSuccess ? SHTheme.Colors.success : .red).opacity(0.25), lineWidth: 1)
                )
        )
    }

    // MARK: - Top Up

    private var topUpSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Add Money to Wallet", systemImage: "plus.circle.fill")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.primary)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Enter Amount (₹)")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)

                    HStack(spacing: 10) {
                        HStack(spacing: 8) {
                            Image(systemName: "indianrupeesign")
                                .foregroundStyle(.secondary)
                            TextField("0.00", text: $vm.topUpAmountText)
                                .keyboardType(.decimalPad)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(Color(uiColor: .tertiarySystemGroupedBackground))
                        )

                        Button {
                            Task { await vm.topUp() }
                        } label: {
                            Label(vm.isTopUpLoading ? "Adding..." : "Add Money", systemImage: "plus")
                                .font(.subheadline.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(SHTheme.Colors.primary)
                        .disabled(vm.isTopUpLoading || vm.topUpAmountText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Quick Amounts")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)

                    let cols = Array(repeating: GridItem(.flexible(), spacing: 8), count: 5)
                    LazyVGrid(columns: cols, spacing: 8) {
                        ForEach(vm.quickAmounts, id: \.self) { amt in
                            Button {
                                vm.setTopUpAmount(amt)
                            } label: {
                                Text("₹\(vm.formatMoneyPlain(amt).replacingOccurrences(of: \".00\", with: \"\"))")
                                    .font(.caption.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }

                // Web: first recharge bonus banner when no transactions.
                if vm.transactions.isEmpty {
                    HStack(spacing: 10) {
                        Image(systemName: "sparkles")
                            .foregroundStyle(SHTheme.Colors.warning)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("First Recharge Bonus!")
                                .font(.subheadline.weight(.bold))
                            Text("Get 10% extra on your first wallet top-up")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(SHTheme.Colors.warning.opacity(0.10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(SHTheme.Colors.warning.opacity(0.25), lineWidth: 1)
                            )
                    )
                }
            }
        }
    }

    // MARK: - Rewards + Promo

    private var rewardsAndPromoSection: some View {
        VStack(spacing: 12) {
            SHCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Rewards Progress", systemImage: "gift.fill")
                        .font(.headline.weight(.bold))

                    HStack {
                        Text("Points to next reward")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text("\(vm.balance.points)/200")
                            .font(.caption.weight(.semibold))
                    }

                    ProgressView(value: vm.rewardsProgressPercent, total: 100)
                        .tint(SHTheme.Colors.purple)

                    Text("Earn 200 points to unlock exclusive rewards")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            SHCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Promo Codes", systemImage: "ticket.fill")
                        .font(.headline.weight(.bold))

                    HStack(spacing: 10) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(vm.promoCode)
                                .font(.headline.weight(.bold))
                                .foregroundStyle(SHTheme.Colors.primary)
                            Text("Get 10% off on your first booking")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button {
                            UIPasteboard.general.string = vm.promoCode
                            vm.copyPromoCode()
                        } label: {
                            Image(systemName: "doc.on.doc")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(SHTheme.Colors.primary.opacity(0.10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(SHTheme.Colors.primary.opacity(0.20), lineWidth: 1)
                            )
                    )
                }
            }
        }
    }

    // MARK: - Transactions

    private var transactionsSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Recent Transactions", systemImage: "clock.arrow.circlepath")
                    .font(.headline.weight(.bold))

                if vm.transactions.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "clock")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Text("No transactions yet")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                } else {
                    VStack(spacing: 10) {
                        ForEach(vm.transactions) { t in
                            TransactionRow(transaction: t)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Info

    private var infoSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("How it works")
                    .font(.headline.weight(.bold))

                InfoRow(symbol: "plus.circle.fill", tint: SHTheme.Colors.primary, title: "Add Money", subtitle: "Add money to your wallet using the form above")
                InfoRow(symbol: "checkmark.circle.fill", tint: SHTheme.Colors.success, title: "Instant Payments", subtitle: "Use your wallet balance to pay for services instantly")
                InfoRow(symbol: "gift.fill", tint: SHTheme.Colors.purple, title: "Earn Rewards", subtitle: "Get cashback and points on every transaction")
                InfoRow(symbol: "shield.fill", tint: SHTheme.Colors.warning, title: "Secure & Safe", subtitle: "Your wallet balance is secure and can be used anytime")
            }
        }
    }
}

private struct TransactionRow: View {
    let transaction: WalletTransaction

    private var tint: Color {
        switch transaction.type {
        case .topUp: return SHTheme.Colors.success
        case .payment: return .red
        case .cashback: return SHTheme.Colors.purple
        }
    }

    private var symbol: String {
        switch transaction.type {
        case .topUp: return "arrow.down.circle.fill"
        case .payment: return "arrow.up.circle.fill"
        case .cashback: return "gift.fill"
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(tint.opacity(0.16))
                Image(systemName: symbol)
                    .foregroundStyle(tint)
                    .font(.system(size: 16, weight: .semibold))
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(.subheadline.weight(.semibold))
                Text(transaction.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            let amount = NSDecimalNumber(decimal: transaction.amountINR).doubleValue
            Text("\(amount >= 0 ? "+" : "")₹\(String(format: "%.2f", abs(amount)))")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(amount >= 0 ? SHTheme.Colors.success : .red)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(uiColor: .tertiarySystemGroupedBackground))
        )
    }
}

private struct InfoRow: View {
    let symbol: String
    let tint: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(tint.opacity(0.16))
                Image(systemName: symbol)
                    .foregroundStyle(tint)
                    .font(.system(size: 16, weight: .semibold))
            }
            .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
    }
}

struct WalletView_Previews: PreviewProvider {
    static var previews: some View {
        WalletView()
            .preferredColorScheme(.light)
        WalletView()
            .preferredColorScheme(.dark)
    }
}

