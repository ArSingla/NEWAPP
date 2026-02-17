import Foundation

struct ServiceProvider: Identifiable, Hashable, Codable {
    let id: String              // web uses id/_id/email/name fallback
    let name: String
    let rating: Double?
    let totalRatings: Int?
    let experienceText: String?
    let pricePerHourINR: Int?
    let isAvailable: Bool
}

