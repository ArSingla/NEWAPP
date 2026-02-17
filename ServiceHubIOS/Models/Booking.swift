import Foundation

enum BookingStatus: String, Codable, CaseIterable {
    case pending = "PENDING"
    case confirmed = "CONFIRMED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var displayLabel: String {
        switch self {
        case .pending: return "Upcoming"
        case .confirmed: return "Confirmed"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

struct Booking: Identifiable, Hashable, Codable {
    let id: String              // web uses _id or id
    let serviceTypeId: String   // "chef", "maid", ...
    let providerName: String
    let createdAt: Date
    let serviceDate: Date?
    let durationHours: Int?
    let priceINR: Int?
    let status: BookingStatus
}

