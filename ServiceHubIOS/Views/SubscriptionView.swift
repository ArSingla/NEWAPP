import SwiftUI

// Web mapping:
// - `frontend/src/pages/SubscriptionPage.js` -> SubscriptionView
// - Free trial banner, wallet balance, message banner
// - Billing cycle toggle (monthly/yearly)
// - Plans grid with recommended/current badges, CTA
// - Comparison table toggle
// - Usage tracker for non-BASIC plans

struct SubscriptionView: View {
    @StateObject private var vm = SubscriptionViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    loadingSkeleton
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            header
                            freeTrialBanner
                            walletBalanceCard

                            if let banner = vm.banner {
                                bannerView(banner)
                            }

                            billingCycleToggle
                            currentPlanBadge
                            plansGrid
                            comparisonToggle
                            if vm.currentPlanId != "BASIC" {
                                usageTracker
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 24)
                    }
                }
            }
            .background(SHTheme.Colors.background)
            .navigationTitle("Subscription Plans")
            .navigationBarTitleDisplayMode(.inline)
            .task { vm.onAppear() }
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Subscription Plans")
                .font(.largeTitle.weight(.bold))
            Text("Choose the plan that best fits your needs")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var freeTrialBanner: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [SHTheme.Colors.success, .green],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            HStack(alignment: .center, spacing: 16) {
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.22))
                        .frame(width: 56, height: 56)
                    Image(systemName: "sparkles")
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("7-Day Free Trial")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                    Text("Try Premium or VIP plan free for 7 days. Cancel anytime!")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.9))
                }

                Spacer()

                Button {
                    // TODO: handle free trial flow
                } label: {
                    Text("Start Free Trial")
                        .font(.subheadline.weight(.semibold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(.white)
                        )
                        .foregroundStyle(SHTheme.Colors.success)
                }
                .buttonStyle(.plain)
            }
            .padding(14)
        }
    }

    private var walletBalanceCard: some View {
        SHCard {
            HStack(spacing: 12) {
                Image(systemName: "wallet.pass.fill")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(SHTheme.Colors.primary)
                Text("Wallet Balance")
                    .font(.subheadline.weight(.medium))
                Spacer()
                Text(vm.formatINR(vm.walletBalanceINR))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(SHTheme.Colors.primary)
            }
        }
    }

    private func bannerView(_ banner: BannerMessage) -> some View {
        let isSuccess = banner.kind == .success
        return HStack(spacing: 10) {
            Image(systemName: isSuccess ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                .foregroundStyle(isSuccess ? SHTheme.Colors.success : .red)
            Text(banner.text)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.primary)
            Spacer()
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

    private var billingCycleToggle: some View {
        HStack(spacing: 10) {
            Text("Monthly")
                .font(.caption.weight(.medium))
                .foregroundStyle(vm.billingCycle == .monthly ? .primary : .secondary)

            Button {
                vm.billingCycle = vm.billingCycle == .monthly ? .yearly : .monthly
            } label: {
                ZStack(alignment: vm.billingCycle == .yearly ? .trailing : .leading) {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(
                            vm.billingCycle == .yearly
                            ? LinearGradient(colors: [SHTheme.Colors.primary, SHTheme.Colors.purple], startPoint: .leading, endPoint: .trailing)
                            : Color.gray.opacity(0.35)
                        )
                        .frame(width: 64, height: 30)

                    Circle()
                        .fill(.white)
                        .frame(width: 24, height: 24)
                        .padding(.horizontal, 3)
                        .shadow(radius: 1)
                }
            }
            .buttonStyle(.plain)

            Text("Yearly")
                .font(.caption.weight(.medium))
                .foregroundStyle(vm.billingCycle == .yearly ? .primary : .secondary)

            if vm.billingCycle == .yearly {
                Text("Save up to ₹200/year")
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(
                        Capsule(style: .continuous)
                            .fill(SHTheme.Colors.success.opacity(0.16))
                    )
                    .foregroundStyle(SHTheme.Colors.success)
            }

            Spacer()
        }
    }

    private var currentPlanBadge: some View {
        Group {
            if let current = vm.currentPlan, current.id != "BASIC" {
                SHCard {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Current Plan")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                            Text(current.name)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(SHTheme.Colors.primary)
                        }
                        Spacer()
                        Button {
                            Task { await vm.cancelSubscription() }
                        } label: {
                            Text("Cancel Subscription")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.red)
                    }
                }
            }
        }
    }

    private var plansGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(vm.plans) { plan in
                SubscriptionPlanCard(
                    plan: plan,
                    billingCycle: vm.billingCycle,
                    isCurrent: vm.currentPlanId == plan.id,
                    isRecommended: plan.isRecommended,
                    priceFormatter: vm.formatINR(_:),
                    onSubscribe: {
                        Task { await vm.subscribe(to: plan) }
                    },
                    isProcessing: vm.isProcessing,
                    walletBalanceINR: vm.walletBalanceINR
                )
            }
        }
    }

    private var comparisonToggle: some View {
        VStack(spacing: 8) {
            Button {
                withAnimation { vm.showComparison.toggle() }
            } label: {
                HStack {
                    Text("Compare Plans")
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Image(systemName: "chevron.down")
                        .rotationEffect(.degrees(vm.showComparison ? 180 : 0))
                        .animation(.easeInOut(duration: 0.25), value: vm.showComparison)
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color(uiColor: .systemBackground))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                )
            }
            .buttonStyle(.plain)

            if vm.showComparison {
                comparisonTable
            }
        }
    }

    private var comparisonTable: some View {
        SHCard {
            ScrollView(.horizontal, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 6) {
                    let featuresToCompare = [
                        "Standard Support",
                        "Priority Support",
                        "24/7 Support",
                        "Service Discounts",
                        "SMS Notifications",
                        "Personal Concierge"
                    ]

                    HStack {
                        Text("Features")
                            .font(.caption.weight(.semibold))
                            .frame(width: 140, alignment: .leading)
                        ForEach(vm.plans) { plan in
                            Text(plan.name)
                                .font(.caption.weight(.semibold))
                                .frame(maxWidth: .infinity)
                        }
                    }

                    Divider()

                    ForEach(featuresToCompare, id: \.self) { feature in
                        HStack {
                            Text(feature)
                                .font(.caption)
                                .frame(width: 140, alignment: .leading)

                            ForEach(vm.plans) { plan in
                                let hasFeature = plan.features.contains(where: { $0.lowercased().contains(feature.lowercased().split(separator: " ").first ?? "") })
                                Group {
                                    if hasFeature {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundStyle(SHTheme.Colors.success)
                                    } else {
                                        Text("—")
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
    }

    private var usageTracker: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("Your Subscription Usage")
                    .font(.headline.weight(.bold))

                HStack(spacing: 12) {
                    usageStatCard(
                        icon: "checkmark.circle.fill",
                        tint: SHTheme.Colors.primary,
                        value: "\(vm.usageStats.servicesBooked)",
                        label: "Services Booked"
                    )
                    usageStatCard(
                        icon: "percent",
                        tint: SHTheme.Colors.success,
                        value: vm.formatINR(vm.usageStats.savingsEarnedINR),
                        label: "Savings Earned"
                    )
                    usageStatCard(
                        icon: "clock.fill",
                        tint: SHTheme.Colors.purple,
                        value: "\(vm.usageStats.priorityBookings)",
                        label: "Priority Bookings"
                    )
                }
            }
        }
    }

    private func usageStatCard(icon: String, tint: Color, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(tint)
            Text(value)
                .font(.title3.weight(.bold))
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(tint.opacity(0.1))
        )
    }

    // MARK: - Loading skeleton

    private var loadingSkeleton: some View {
        VStack(spacing: 16) {
            RoundedRectangle(cornerRadius: 10).fill(Color.gray.opacity(0.2)).frame(width: 200, height: 24)
            RoundedRectangle(cornerRadius: 18).fill(Color.gray.opacity(0.16)).frame(height: 100)
            RoundedRectangle(cornerRadius: 18).fill(Color.gray.opacity(0.16)).frame(height: 240)
        }
        .padding()
        .redacted(reason: .placeholder)
    }
}

// MARK: - Plan Card

private struct SubscriptionPlanCard: View {
    let plan: SubscriptionPlan
    let billingCycle: BillingCycle
    let isCurrent: Bool
    let isRecommended: Bool
    let priceFormatter: (Decimal) -> String
    let onSubscribe: () -> Void
    let isProcessing: Bool
    let walletBalanceINR: Decimal

    var body: some View {
        SHCard {
            ZStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        if isRecommended {
                            Text("⭐ BEST VALUE")
                                .font(.caption2.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule(style: .continuous)
                                        .fill(LinearGradient(colors: [SHTheme.Colors.purple, .pink], startPoint: .leading, endPoint: .trailing))
                                )
                                .foregroundStyle(.white)
                        }
                        Spacer()
                        if isCurrent {
                            Text("CURRENT")
                                .font(.caption2.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule(style: .continuous)
                                        .fill(SHTheme.Colors.primary)
                                )
                                .foregroundStyle(.white)
                        }
                    }

                    Text(plan.name)
                        .font(.title3.weight(.bold))

                    let price = billingCycle == .monthly ? plan.monthlyPrice : plan.yearlyPrice

                    VStack(alignment: .leading, spacing: 4) {
                        if price == 0 {
                            Text("Free")
                                .font(.title2.weight(.bold))
                        } else {
                            HStack(alignment: .firstTextBaseline, spacing: 4) {
                                Text(priceFormatter(price))
                                    .font(.title2.weight(.bold))
                                Text("/\(billingCycle == .monthly ? "mo" : "yr")")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if billingCycle == .yearly && plan.yearlySavingsINR > 0 {
                            Text("Save ₹\(NSDecimalNumber(decimal: plan.yearlySavingsINR).intValue)/year")
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule(style: .continuous)
                                        .fill(SHTheme.Colors.success.opacity(0.1))
                                )
                                .foregroundStyle(SHTheme.Colors.success)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(plan.benefits.prefix(6), id: \.self) { benefit in
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark")
                                    .font(.caption)
                                    .foregroundStyle(SHTheme.Colors.success)
                                Text(benefit)
                                    .font(.caption)
                            }
                        }
                    }

                    Button {
                        onSubscribe()
                    } label: {
                        Text(buttonTitle(for: price))
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(buttonTint(for: price))
                    .disabled(isCurrent || isProcessing || (price > 0 && walletBalanceINR < price))
                }
            }
        }
    }

    private func buttonTitle(for price: Decimal) -> String {
        if isCurrent { return "Current Plan" }
        if isProcessing { return "Processing..." }
        if price == 0 { return "Select Plan" }
        return "Subscribe for \(priceFormatter(price))"
    }

    private func buttonTint(for price: Decimal) -> Color {
        if isCurrent || (price > 0 && walletBalanceINR < price) {
            return .gray
        }
        switch plan.id {
        case "BASIC": return SHTheme.Colors.primary
        case "PREMIUM": return SHTheme.Colors.purple
        case "VIP": return SHTheme.Colors.warning
        default: return SHTheme.Colors.primary
        }
    }
}

struct SubscriptionView_Previews: PreviewProvider {
    static var previews: some View {
        SubscriptionView()
            .preferredColorScheme(.light)
        SubscriptionView()
            .preferredColorScheme(.dark)
    }
}

