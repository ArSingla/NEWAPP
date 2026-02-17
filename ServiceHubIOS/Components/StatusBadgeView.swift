import SwiftUI

struct StatusBadgeView: View {
    let status: BookingStatus

    private var colors: (bg: Color, text: Color, border: Color) {
        // Mirror web statusColors mapping conceptually
        switch status {
        case .pending:
            return (Color.yellow.opacity(0.18), Color.yellow.opacity(0.95), Color.yellow.opacity(0.35))
        case .confirmed:
            return (SHTheme.Colors.primary.opacity(0.16), SHTheme.Colors.primary, SHTheme.Colors.primary.opacity(0.35))
        case .inProgress:
            return (SHTheme.Colors.purple.opacity(0.16), SHTheme.Colors.purple, SHTheme.Colors.purple.opacity(0.35))
        case .completed:
            return (SHTheme.Colors.success.opacity(0.16), SHTheme.Colors.success, SHTheme.Colors.success.opacity(0.35))
        case .cancelled:
            return (Color.red.opacity(0.16), Color.red, Color.red.opacity(0.35))
        }
    }

    var body: some View {
        Text(status.displayLabel)
            .font(.caption.weight(.semibold))
            .foregroundStyle(colors.text)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                Capsule(style: .continuous)
                    .fill(colors.bg)
                    .overlay(
                        Capsule(style: .continuous)
                            .stroke(colors.border, lineWidth: 1)
                    )
            )
            .accessibilityLabel("Status \(status.displayLabel)")
    }
}

