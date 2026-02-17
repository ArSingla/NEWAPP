import Foundation

enum MockProfileData {
    static let languages: [LanguageOption] = [
        .init(id: "en", name: "English",   flag: "🇺🇸"),
        .init(id: "es", name: "Español",   flag: "🇪🇸"),
        .init(id: "fr", name: "Français",  flag: "🇫🇷"),
        .init(id: "hi", name: "हिंदी",     flag: "🇮🇳"),
        .init(id: "bn", name: "বাংলা",     flag: "🇧🇩"),
        .init(id: "ja", name: "日本語",     flag: "🇯🇵"),
        .init(id: "ko", name: "한국어",     flag: "🇰🇷"),
    ]

    static let countries: [CountryOption] = [
        .init(id: "IN", name: "India",          phoneCode: "+91"),
        .init(id: "US", name: "United States",  phoneCode: "+1"),
        .init(id: "RU", name: "Russia",         phoneCode: "+7"),
        .init(id: "CN", name: "China",          phoneCode: "+86"),
        .init(id: "GB", name: "United Kingdom", phoneCode: "+44"),
        .init(id: "DE", name: "Germany",        phoneCode: "+49"),
        .init(id: "FR", name: "France",         phoneCode: "+33"),
        .init(id: "JP", name: "Japan",          phoneCode: "+81"),
        .init(id: "KR", name: "South Korea",    phoneCode: "+82"),
    ]

    static let favoriteProviders: [FavoriteProviderProfile] = [
        .init(id: "p1", name: "Chef Raj", rating: 4.9, service: "Chef"),
        .init(id: "p2", name: "Driver Kumar", rating: 4.8, service: "Driver")
    ]

    static let savedAddresses: [SavedAddressProfile] = [
        .init(id: "a1", label: "Home", address: "123 Main St, City, State", isDefault: true),
        .init(id: "a2", label: "Office", address: "456 Business Ave, City, State", isDefault: false)
    ]
}

