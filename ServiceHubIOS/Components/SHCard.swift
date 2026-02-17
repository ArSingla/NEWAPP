import SwiftUI

struct SHCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(SHTheme.Metrics.cardPadding)
            .background(
                RoundedRectangle(cornerRadius: SHTheme.Metrics.cornerRadius, style: .continuous)
                    .fill(SHTheme.Colors.card)
            )
    }
}

