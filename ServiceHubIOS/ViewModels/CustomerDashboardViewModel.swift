import Foundation

@MainActor
final class CustomerDashboardViewModel: ObservableObject {
    @Published var userFirstName: String = "User"
    @Published var searchQuery: String = ""

    @Published var services: [ServiceType] = []
    @Published var activeBookings: [Booking] = []
    @Published var isLoadingBookings: Bool = false
    @Published var lastBookingToast: String? = nil

    // These are currently static in the web UI (CustomerDashboard.js)
    @Published var availableServicesCount: Int = 5
    @Published var nearbyProvidersCount: Int = 60

    @Published var selectedService: ServiceType? = nil
    @Published var providerPickerProviders: [ServiceProvider] = []
    @Published var isLoadingProviders: Bool = false
    @Published var providerPickerError: String? = nil

    private let api: ServiceHubAPIProtocol

    init(api: ServiceHubAPIProtocol = MockServiceHubAPI()) {
        self.api = api
        self.services = MockCatalog.services
    }

    func onAppear() {
        Task {
            await loadProfile()
            await loadActiveBookings()
        }
    }

    func loadProfile() async {
        do {
            let profile = try await api.getProfile()
            let rawName = profile.name?.trimmingCharacters(in: .whitespacesAndNewlines)
            let first = rawName?.split(separator: " ").first.map(String.init)
            userFirstName = (first?.isEmpty == false ? first! : "User")
        } catch {
            // Keep fallback
            userFirstName = "User"
        }
    }

    func loadActiveBookings() async {
        isLoadingBookings = true
        defer { isLoadingBookings = false }

        do {
            let dtos = try await api.getActiveBookings()
            activeBookings = dtos.compactMap(BookingMapper.map)
        } catch {
            activeBookings = []
        }
    }

    func openService(_ service: ServiceType) {
        selectedService = service
        providerPickerError = nil
        providerPickerProviders = []

        Task { await loadProviders(for: service) }
    }

    func loadProviders(for service: ServiceType) async {
        isLoadingProviders = true
        defer { isLoadingProviders = false }

        do {
            let dtos = try await api.getServiceProviders(serviceTypeId: service.id)
            providerPickerProviders = dtos.compactMap(ServiceProviderMapper.map)
        } catch {
            providerPickerError = "Failed to load providers."
            providerPickerProviders = []
        }
    }

    func book(service: ServiceType, provider: ServiceProvider) async {
        isLoadingProviders = true
        defer { isLoadingProviders = false }

        let iso = ISO8601DateFormatter().string(from: .now)
        let req = BookServiceRequestDTO(
            serviceType: service.id,
            providerId: provider.id,
            providerName: provider.name,
            date: iso,
            amount: provider.pricePerHourINR ?? 0,
            currency: "INR"
        )

        do {
            let res = try await api.bookService(request: req)
            if let booking = res.booking.flatMap(BookingMapper.map) {
                // mimic web: show toast + refresh bookings
                lastBookingToast = "Successfully booked \(service.name)! Provider: \(booking.providerName)"
                selectedService = nil
                await loadActiveBookings()

                // auto-clear toast after a few seconds
                Task { @MainActor in
                    try? await Task.sleep(nanoseconds: 3_000_000_000)
                    if self.lastBookingToast == "Successfully booked \(service.name)! Provider: \(booking.providerName)" {
                        self.lastBookingToast = nil
                    }
                }
            }
        } catch {
            providerPickerError = "Failed to book service. Please try again."
        }
    }
}

// MARK: - Mapping helpers (DTO -> App models)

enum BookingMapper {
    static func map(_ dto: BookingDTO) -> Booking? {
        let id = dto._id ?? dto.id ?? UUID().uuidString
        let serviceType = dto.serviceType ?? "service"
        let providerName = dto.providerName ?? "Provider"

        let createdAt = parseISO(dto.createdAt) ?? .now
        let serviceDate = parseISO(dto.serviceDate)

        let statusRaw = dto.status ?? "PENDING"
        let status = BookingStatus(rawValue: statusRaw) ?? .pending

        return Booking(
            id: id,
            serviceTypeId: serviceType,
            providerName: providerName,
            createdAt: createdAt,
            serviceDate: serviceDate,
            durationHours: dto.durationHours,
            priceINR: dto.price,
            status: status
        )
    }

    private static func parseISO(_ s: String?) -> Date? {
        guard let s else { return nil }
        return ISO8601DateFormatter().date(from: s)
    }
}

enum ServiceProviderMapper {
    static func map(_ dto: ServiceProviderDTO) -> ServiceProvider? {
        let id = dto.id ?? dto._id ?? dto.email ?? dto.name ?? dto.fullName ?? UUID().uuidString
        let name = dto.name ?? dto.fullName ?? dto.email ?? "Provider"
        return ServiceProvider(
            id: id,
            name: name,
            rating: dto.rating,
            totalRatings: dto.totalRatings,
            experienceText: dto.experience,
            pricePerHourINR: dto.pricePerHour,
            isAvailable: dto.isAvailable ?? true
        )
    }
}

