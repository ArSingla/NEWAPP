import Foundation

// Web mapping:
// - GET /api/profile -> full User JSON (see backend/routes/profile.js and models/User.js)
// - PUT /api/profile -> updates subset (name, preferredLanguage, gender, country, phoneNumber, providerType)
//
// Here we define DTOs + a mock API that behaves similarly to the web contract.

protocol ProfileAPIProtocol {
    func getProfile() async throws -> ProfileDTO
    func updateProfile(request: UpdateProfileRequestDTO) async throws -> ProfileDTO
}

struct ProfileDTO: Codable {
    let id: String?
    let name: String?
    let email: String?
    let role: String?
    let preferredLanguage: String?
    let gender: String?
    let country: String?
    let phoneNumber: String?
    let createdAt: String?
}

struct UpdateProfileRequestDTO: Codable {
    let name: String?
    let preferredLanguage: String?
    let gender: String?
    let country: String?
    let phoneNumber: String?
}

final class MockProfileAPI: ProfileAPIProtocol {
    private var stored: ProfileDTO

    init() {
        let now = ISO8601DateFormatter().string(from: .now.addingTimeInterval(-60*60*24*120)) // ~4 months ago
        self.stored = ProfileDTO(
            id: "u1",
            name: "Arjun Singla",
            email: "arjun@example.com",
            role: "CUSTOMER",
            preferredLanguage: "en",
            gender: "MALE",
            country: "IN",
            phoneNumber: "9876543210",
            createdAt: now
        )
    }

    func getProfile() async throws -> ProfileDTO {
        try await Task.sleep(nanoseconds: 200_000_000)
        return stored
    }

    func updateProfile(request: UpdateProfileRequestDTO) async throws -> ProfileDTO {
        try await Task.sleep(nanoseconds: 250_000_000)

        stored = ProfileDTO(
            id: stored.id,
            name: request.name ?? stored.name,
            email: stored.email,
            role: stored.role,
            preferredLanguage: request.preferredLanguage ?? stored.preferredLanguage,
            gender: request.gender ?? stored.gender,
            country: request.country ?? stored.country,
            phoneNumber: request.phoneNumber ?? stored.phoneNumber,
            createdAt: stored.createdAt
        )
        return stored
    }
}

