import Foundation

// NOTE: This is a minimal API layer scaffold.
// For this first screen we stay in "mock mode" but keep signatures aligned with the web API contracts.

protocol ServiceHubAPIProtocol {
    func getProfile() async throws -> UserProfileDTO
    func getActiveBookings() async throws -> [BookingDTO]
    func getServiceProviders(serviceTypeId: String) async throws -> [ServiceProviderDTO]
    func bookService(request: BookServiceRequestDTO) async throws -> BookServiceResponseDTO
}

// MARK: - DTOs (mirror web API shape conceptually; wire exact fields later)

struct UserProfileDTO: Codable {
    let name: String?
}

struct BookingDTO: Codable {
    let id: String?
    let _id: String?
    let serviceType: String?
    let providerName: String?
    let createdAt: String?
    let serviceDate: String?
    let durationHours: Int?
    let price: Int?
    let status: String?
}

struct ServiceProviderDTO: Codable {
    let id: String?
    let _id: String?
    let email: String?
    let name: String?
    let fullName: String?
    let rating: Double?
    let totalRatings: Int?
    let experience: String?
    let pricePerHour: Int?
    let isAvailable: Bool?
}

struct BookServiceRequestDTO: Codable {
    let serviceType: String
    let providerId: String
    let providerName: String
    let date: String
    let amount: Int
    let currency: String
}

struct BookServiceResponseDTO: Codable {
    let booking: BookingDTO?
}

// MARK: - Mock API (dev mode)

final class MockServiceHubAPI: ServiceHubAPIProtocol {
    func getProfile() async throws -> UserProfileDTO {
        try await Task.sleep(nanoseconds: 250_000_000)
        return UserProfileDTO(name: "Arjun Singla")
    }

    func getActiveBookings() async throws -> [BookingDTO] {
        try await Task.sleep(nanoseconds: 250_000_000)
        let now = ISO8601DateFormatter().string(from: .now)
        return [
            BookingDTO(
                id: "b1",
                _id: nil,
                serviceType: "chef",
                providerName: "Ravi Kumar",
                createdAt: now,
                serviceDate: now,
                durationHours: 2,
                price: 300,
                status: "CONFIRMED"
            ),
            BookingDTO(
                id: "b2",
                _id: nil,
                serviceType: "maid",
                providerName: "Sana Ali",
                createdAt: now,
                serviceDate: nil,
                durationHours: 3,
                price: 240,
                status: "PENDING"
            )
        ]
    }

    func getServiceProviders(serviceTypeId: String) async throws -> [ServiceProviderDTO] {
        try await Task.sleep(nanoseconds: 200_000_000)
        return (1...12).map { i in
            ServiceProviderDTO(
                id: "\(serviceTypeId)-p\(i)",
                _id: nil,
                email: nil,
                name: ["Amit", "Ravi", "Sana", "Neha", "Karan", "Priya"].randomElement()! + " " + ["Sharma", "Kumar", "Singh", "Patel"].randomElement()!,
                fullName: nil,
                rating: Double.random(in: 4.2...4.9),
                totalRatings: Int.random(in: 20...220),
                experience: "\(Int.random(in: 1...9)) yrs exp",
                pricePerHour: Int.random(in: 80...220),
                isAvailable: Bool.random()
            )
        }
    }

    func bookService(request: BookServiceRequestDTO) async throws -> BookServiceResponseDTO {
        try await Task.sleep(nanoseconds: 350_000_000)
        let now = ISO8601DateFormatter().string(from: .now)
        return BookServiceResponseDTO(
            booking: BookingDTO(
                id: UUID().uuidString,
                _id: nil,
                serviceType: request.serviceType,
                providerName: request.providerName,
                createdAt: now,
                serviceDate: request.date,
                durationHours: 2,
                price: request.amount,
                status: "CONFIRMED"
            )
        )
    }
}

