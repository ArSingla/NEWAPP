import SwiftUI

enum SHTheme {
    enum Colors {
        static let background = Color(uiColor: .systemGroupedBackground)
        static let card = Color(uiColor: .secondarySystemGroupedBackground)
        static let text = Color.primary
        static let mutedText = Color.secondary

        // Web palette mapping (approx)
        static let primary = Color(red: 37/255, green: 99/255, blue: 235/255)   // #2563EB
        static let success = Color(red: 34/255, green: 197/255, blue: 94/255)  // #22C55E
        static let warning = Color(red: 245/255, green: 158/255, blue: 11/255) // #F59E0B
        static let purple = Color(red: 139/255, green: 92/255, blue: 246/255)  // #8B5CF6
    }

    enum Metrics {
        static let cornerRadius: CGFloat = 16
        static let cardPadding: CGFloat = 16
    }
}

