import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: UserProfile = UserProfile(
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "CUSTOMER",
        gender: nil,
        countryCode: nil,
        memberSince: .now
    )

    @Published var isEditing: Bool = false
    @Published var editFirstName: String = ""
    @Published var editLastName: String = ""
    @Published var editPhone: String = ""
    @Published var editGender: String = ""
    @Published var editCountryCode: String = ""

    @Published var profileCompletionPercent: Int = 0

    @Published var favoriteProviders: [FavoriteProviderProfile] = MockProfileData.favoriteProviders
    @Published var savedAddresses: [SavedAddressProfile] = MockProfileData.savedAddresses

    @Published var selectedLanguageCode: String = "en"
    let availableLanguages: [LanguageOption] = MockProfileData.languages
    let countries: [CountryOption] = MockProfileData.countries

    @Published var isDarkMode: Bool = false   // local UI toggle; real system theme handled by app

    private let api: ProfileAPIProtocol

    init(api: ProfileAPIProtocol = MockProfileAPI()) {
        self.api = api
    }

    func onAppear() {
        Task { await loadProfile() }
    }

    func loadProfile() async {
        do {
            let dto = try await api.getProfile()
            apply(profileDTO: dto)
        } catch {
            // Keep defaults, maybe show toast in future.
        }
    }

    private func apply(profileDTO dto: ProfileDTO) {
        let nameParts = (dto.name ?? "").split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
        let first = nameParts.first.map(String.init) ?? ""
        let last = nameParts.count > 1 ? String(nameParts[1]) : ""

        let created = ISO8601DateFormatter().date(from: dto.createdAt ?? "") ?? .now

        profile = UserProfile(
            firstName: first,
            lastName: last,
            email: dto.email ?? "",
            phone: dto.phoneNumber ?? "",
            role: dto.role ?? "CUSTOMER",
            gender: dto.gender,
            countryCode: dto.country,
            memberSince: created
        )

        selectedLanguageCode = dto.preferredLanguage ?? "en"

        editFirstName = first
        editLastName = last
        editPhone = dto.phoneNumber ?? ""
        editGender = dto.gender ?? ""
        editCountryCode = dto.country ?? ""

        recalcCompletion()
    }

    func startEditing() {
        isEditing = true
    }

    func cancelEditing() {
        editFirstName = profile.firstName
        editLastName = profile.lastName
        editPhone = profile.phone
        editGender = profile.gender ?? ""
        editCountryCode = profile.countryCode ?? ""
        isEditing = false
    }

    func saveChanges() async {
        let payload = UpdateProfileRequestDTO(
            name: [editFirstName, editLastName].joined(separator: " ").trimmingCharacters(in: .whitespaces),
            preferredLanguage: selectedLanguageCode,
            gender: editGender.isEmpty ? nil : editGender,
            country: editCountryCode.isEmpty ? nil : editCountryCode,
            phoneNumber: editPhone.isEmpty ? nil : editPhone
        )

        do {
            let updated = try await api.updateProfile(request: payload)
            apply(profileDTO: updated)
            isEditing = false
        } catch {
            // For now, just end editing; in future show error banner.
            isEditing = false
        }
    }

    func setLanguage(code: String) async {
        selectedLanguageCode = code
        // mirror web: updateProfile({ preferredLanguage })
        let payload = UpdateProfileRequestDTO(
            name: nil,
            preferredLanguage: code,
            gender: nil,
            country: nil,
            phoneNumber: nil
        )
        _ = try? await api.updateProfile(request: payload)
    }

    func toggleTheme() {
        // Local preference only; actual app theme wiring happens at app-level.
        isDarkMode.toggle()
    }

    // MARK: - Derived values

    func memberSinceText(now: Date = .now) -> String {
        let months = Calendar.current.dateComponents([.month], from: profile.memberSince, to: now).month ?? 0
        if months < 1 { return "This month" }
        if months < 12 { return "\(months) month\(months > 1 ? "s" : "") ago" }
        let years = months / 12
        return "\(years) year\(years > 1 ? "s" : "") ago"
    }

    func countryFromCode(_ code: String?) -> CountryOption? {
        guard let code else { return nil }
        return countries.first(where: { $0.id == code })
    }

    func recalcCompletion() {
        let fields: [String] = [
            profile.firstName,
            profile.lastName,
            profile.email,
            profile.phone,
            profile.gender ?? "",
            profile.countryCode ?? ""
        ]
        let filled = fields.filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }.count
        profileCompletionPercent = Int(round((Double(filled) / Double(fields.count)) * 100.0))
    }
}

