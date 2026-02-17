import SwiftUI

// Web mapping:
// - `frontend/src/pages/CustomerDashboard.js` -> CustomerDashboardView
// - `ServiceOptions` grid -> Services section (LazyVGrid)
// - `ServiceBookingModal` -> sheet (ProviderPickerSheet)
// - Active bookings timeline cards -> BookingCard rows

struct CustomerDashboardView: View {
    @StateObject private var vm = CustomerDashboardViewModel()

    // 2-column grid similar to web cards on medium+ screens
    private let gridColumns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    heroSection
                    statsSection
                    servicesSection
                    activeBookingsSection
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .background(SHTheme.Colors.background)
            .navigationTitle("ServiceHub")
            .navigationBarTitleDisplayMode(.inline)
            .task { vm.onAppear() }
            .sheet(item: $vm.selectedService) { service in
                ProviderPickerSheet(
                    service: service,
                    providers: vm.providerPickerProviders,
                    isLoading: vm.isLoadingProviders,
                    errorText: vm.providerPickerError,
                    onSelectProvider: { provider in
                        Task { await vm.book(service: service, provider: provider) }
                    }
                )
                .presentationDetents([.medium, .large])
            }
            .overlay(alignment: .top) {
                if let toast = vm.lastBookingToast {
                    bookingToast(toast)
                        .padding(.top, 8)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .animation(.spring(response: 0.35, dampingFraction: 0.9), value: toast)
                }
            }
        }
    }

    // MARK: - Sections

    private var heroSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Welcome back, \(vm.userFirstName)")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(SHTheme.Colors.text)

                    Text("What do you need help with today?")
                        .font(.subheadline)
                        .foregroundStyle(SHTheme.Colors.mutedText)
                }

                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search services or providers…", text: $vm.searchQuery)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color(uiColor: .tertiarySystemGroupedBackground))
                )
                .accessibilityLabel("Search")
            }
        }
    }

    private var statsSection: some View {
        LazyVGrid(columns: gridColumns, spacing: 12) {
            StatCard(
                title: "Active Bookings",
                value: vm.isLoadingBookings ? "…" : "\(vm.activeBookings.count)",
                symbol: "calendar",
                tint: SHTheme.Colors.primary
            )
            StatCard(
                title: "Available Services",
                value: "\(vm.availableServicesCount)",
                symbol: "flame.fill",
                tint: SHTheme.Colors.success
            )
            StatCard(
                title: "Trusted Providers",
                value: "\(vm.nearbyProvidersCount)+",
                symbol: "person.2.fill",
                tint: SHTheme.Colors.purple
            )
        }
    }

    private var servicesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Our Services")
                    .font(.title3.weight(.bold))
                Text("Choose from our wide range of professional services")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            LazyVGrid(columns: gridColumns, spacing: 12) {
                ForEach(filteredServices) { service in
                    ServiceCard(service: service) {
                        vm.openService(service)
                    }
                }
            }
        }
    }

    private var activeBookingsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Active Bookings")
                    .font(.title3.weight(.bold))
                Text("Manage your upcoming and ongoing services")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            if vm.isLoadingBookings {
                VStack(spacing: 12) {
                    SHCard { BookingSkeletonRow() }
                    SHCard { BookingSkeletonRow() }
                }
            } else if vm.activeBookings.isEmpty {
                SHCard {
                    VStack(spacing: 10) {
                        Image(systemName: "checkmark.seal")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(SHTheme.Colors.primary)
                        Text("No active bookings yet")
                            .font(.headline.weight(.bold))
                        Text("Start by booking a service above. We'll help you find the perfect service provider.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)

                        Button {
                            // iOS equivalent of scroll-to-services: just focus the services section by opening first service
                            if let first = vm.services.first {
                                vm.openService(first)
                            }
                        } label: {
                            Text("Book Your First Service")
                                .font(.subheadline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(SHTheme.Colors.primary)
                    }
                }
            } else {
                VStack(spacing: 12) {
                    ForEach(vm.activeBookings) { booking in
                        BookingCard(booking: booking)
                    }
                }
            }
        }
    }

    // MARK: - Derived

    private var filteredServices: [ServiceType] {
        let q = vm.searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard q.isEmpty == false else { return vm.services }
        return vm.services.filter {
            $0.name.localizedCaseInsensitiveContains(q) ||
            $0.id.localizedCaseInsensitiveContains(q)
        }
    }

    // MARK: - Toast

    private func bookingToast(_ text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(SHTheme.Colors.success)
            Text(text)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(SHTheme.Colors.text)
                .lineLimit(2)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(uiColor: .systemBackground))
                .shadow(color: .black.opacity(0.08), radius: 10, y: 6)
        )
        .padding(.horizontal, 16)
    }
}

// MARK: - Subviews

private struct StatCard: View {
    let title: String
    let value: String
    let symbol: String
    let tint: Color

    var body: some View {
        SHCard {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(tint.opacity(0.16))
                    Image(systemName: symbol)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(tint)
                }
                .frame(width: 44, height: 44)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text(value)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(tint)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

private struct ServiceCard: View {
    let service: ServiceType
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            SHCard {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(service.emojiIcon)
                            .font(.system(size: 30))
                        Spacer()
                        if let badge = service.badge {
                            Text(badge)
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(badgeTint(badge).opacity(0.18)))
                                .foregroundStyle(badgeTint(badge))
                        }
                    }

                    Text(service.name)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.primary)

                    VStack(spacing: 6) {
                        row(label: "Avg. Price", value: service.avgPriceText)
                        HStack {
                            Text("Rating").foregroundStyle(.secondary)
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill").foregroundStyle(SHTheme.Colors.warning)
                                Text(String(format: "%.1f", service.rating)).fontWeight(.semibold)
                            }
                        }
                        .font(.caption)
                        rowPill(label: "Status", value: service.availabilityText)
                    }
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(service.name) service")
    }

    private func row(label: String, value: String) -> some View {
        HStack {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            Text(value).fontWeight(.semibold).foregroundStyle(.primary)
        }
        .font(.caption)
    }

    private func rowPill(label: String, value: String) -> some View {
        HStack {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.caption2.weight(.semibold))
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(Capsule().fill(SHTheme.Colors.success.opacity(0.16)))
                .foregroundStyle(SHTheme.Colors.success)
        }
        .font(.caption)
    }

    private func badgeTint(_ badge: String) -> Color {
        switch badge {
        case "Most Booked": return .red
        case "Top Rated": return SHTheme.Colors.warning
        case "New": return SHTheme.Colors.success
        default: return SHTheme.Colors.primary
        }
    }
}

private struct BookingCard: View {
    let booking: Booking

    var body: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top, spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(LinearGradient(
                                colors: [SHTheme.Colors.primary, SHTheme.Colors.purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ).opacity(0.18))
                        Text(MockCatalog.emoji(for: booking.serviceTypeId))
                            .font(.system(size: 26))
                    }
                    .frame(width: 54, height: 54)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(booking.serviceTypeId.capitalized)
                            .font(.headline.weight(.bold))
                        Text(booking.providerName)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    Spacer(minLength: 0)

                    StatusBadgeView(status: booking.status)
                }

                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Image(systemName: "calendar")
                            .foregroundStyle(.secondary)
                        Text(dateTimeText)
                            .foregroundStyle(.secondary)
                    }
                    .font(.caption)

                    if let hrs = booking.durationHours {
                        HStack(spacing: 8) {
                            Image(systemName: "clock")
                                .foregroundStyle(.secondary)
                            Text("\(hrs) hours")
                                .foregroundStyle(.secondary)
                        }
                        .font(.caption)
                    }

                    if let price = booking.priceINR {
                        Text("₹\(price)")
                            .font(.subheadline.weight(.bold))
                    }
                }

                HStack(spacing: 10) {
                    Button {
                        // TODO: Chat feature parity with web
                    } label: {
                        Label("Chat", systemImage: "message")
                    }
                    .buttonStyle(.bordered)

                    Button {
                        // TODO: Reschedule feature parity with web
                    } label: {
                        Label("Reschedule", systemImage: "pencil")
                    }
                    .buttonStyle(.bordered)
                    .tint(SHTheme.Colors.purple)

                    if booking.status == .completed {
                        Button {
                            // TODO: Rate feature parity with web
                        } label: {
                            Label("Rate", systemImage: "star")
                        }
                        .buttonStyle(.bordered)
                        .tint(SHTheme.Colors.warning)
                    } else if booking.status != .cancelled {
                        Button(role: .destructive) {
                            // TODO: Cancel feature parity with web
                        } label: {
                            Label("Cancel", systemImage: "xmark")
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .font(.caption.weight(.semibold))
            }
        }
    }

    private var dateTimeText: String {
        let d = booking.serviceDate ?? booking.createdAt
        return d.formatted(date: .abbreviated, time: .shortened)
    }
}

private struct BookingSkeletonRow: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            RoundedRectangle(cornerRadius: 6).fill(Color.gray.opacity(0.2)).frame(width: 140, height: 14)
            RoundedRectangle(cornerRadius: 10).fill(Color.gray.opacity(0.18)).frame(height: 70)
        }
        .redacted(reason: .placeholder)
    }
}

// MARK: - Provider Picker (web modal -> iOS sheet)

private struct ProviderPickerSheet: View {
    let service: ServiceType
    let providers: [ServiceProvider]
    let isLoading: Bool
    let errorText: String?
    let onSelectProvider: (ServiceProvider) -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if let errorText {
                    contentError(errorText)
                } else if isLoading && providers.isEmpty {
                    ProgressView("Loading providers…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(SHTheme.Colors.background)
                } else if providers.isEmpty {
                    contentEmpty
                } else {
                    List {
                        Section {
                            ForEach(providers) { p in
                                ProviderRow(provider: p) {
                                    onSelectProvider(p)
                                }
                                .disabled(p.isAvailable == false || isLoading)
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Choose a \(service.name) Provider")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                        .disabled(isLoading)
                }
            }
        }
    }

    private var contentEmpty: some View {
        VStack(spacing: 10) {
            Image(systemName: "person.slash")
                .font(.system(size: 32, weight: .semibold))
                .foregroundStyle(.secondary)
            Text("No providers available for this service.")
                .font(.headline)
            Text("Please try another service.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(SHTheme.Colors.background)
    }

    private func contentError(_ text: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 30, weight: .semibold))
                .foregroundStyle(.orange)
            Text(text)
                .font(.headline)
            Text("Please try again.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(SHTheme.Colors.background)
    }
}

private struct ProviderRow: View {
    let provider: ServiceProvider
    let onSelect: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(SHTheme.Colors.primary.opacity(0.16))
                Text(String(provider.name.prefix(1)).uppercased())
                    .font(.headline.weight(.bold))
                    .foregroundStyle(SHTheme.Colors.primary)
            }
            .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(provider.name)
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    availabilityPill
                }

                HStack(spacing: 10) {
                    if let r = provider.rating {
                        Text("⭐ \(String(format: "%.1f", r))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let exp = provider.experienceText {
                        Text(exp)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let p = provider.pricePerHourINR {
                        Text("₹\(p)/hr")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(SHTheme.Colors.success)
                    }
                }
            }

            Spacer(minLength: 0)

            Button(provider.isAvailable ? "Select" : "Busy", action: onSelect)
                .buttonStyle(.borderedProminent)
                .tint(provider.isAvailable ? SHTheme.Colors.primary : .gray)
                .disabled(provider.isAvailable == false)
        }
        .padding(.vertical, 6)
    }

    private var availabilityPill: some View {
        Text(provider.isAvailable ? "Available" : "Busy")
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(Capsule().fill((provider.isAvailable ? SHTheme.Colors.success : .red).opacity(0.16)))
            .foregroundStyle(provider.isAvailable ? SHTheme.Colors.success : .red)
    }
}

// MARK: - Preview

struct CustomerDashboardView_Previews: PreviewProvider {
    static var previews: some View {
        CustomerDashboardView()
            .preferredColorScheme(.light)

        CustomerDashboardView()
            .preferredColorScheme(.dark)
    }
}

