import Foundation

struct UserProfile: Hashable, Codable {
    var firstName: String
    var lastName: String
    var email: String
    var phone: String
    var role: String
    var gender: String?
    var countryCode: String?
    var memberSince: Date

    var fullName: String {
        [firstName, lastName].joined(separator: " ").trimmingCharacters(in: .whitespaces)
    }
}

struct FavoriteProviderProfile: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let rating: Double
    let service: String
}

struct SavedAddressProfile: Identifiable, Hashable, Codable {
    let id: String
    let label: String
    let address: String
    let isDefault: Bool
}

struct LanguageOption: Identifiable, Hashable {
    let id: String   // code
    let name: String
    let flag: String
}

struct CountryOption: Identifiable, Hashable {
    let id: String   // ISO code, e.g. IN
    let name: String
    let phoneCode: String
}

