import SwiftUI

// Web mapping:
// - `frontend/src/pages/ProfilePage.js` -> ProfileView
// - Profile header card, profile completion bar, account chips
// - Personal info form with edit/save/cancel
// - Saved addresses + favorite providers (mock)
// - Preferences (theme, language), Security & Help, Logout

struct ProfileView: View {
    @StateObject private var vm = ProfileViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    profileHeader
                    completionSection

                    HStack(alignment: .top, spacing: 16) {
                        VStack(spacing: 16) {
                            accountStatusChips
                            personalInfoSection
                            savedAddressesSection
                            favoriteProvidersSection
                        }
                        .frame(maxWidth: .infinity)

                        VStack(spacing: 16) {
                            preferencesSection
                            securitySection
                            supportSection
                            logoutSection
                        }
                        .frame(maxWidth: 320)
                        .fixedSize(horizontal: false, vertical: true)
                        .opacity(horizontalSizeClassIsCompact ? 0 : 1)
                    }
                    .animation(.easeInOut(duration: 0.25), value: horizontalSizeClassIsCompact)

                    if horizontalSizeClassIsCompact {
                        // On narrow screens, show sidebar content stacked below
                        VStack(spacing: 16) {
                            preferencesSection
                            securitySection
                            supportSection
                            logoutSection
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .background(SHTheme.Colors.background)
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .task { vm.onAppear() }
        }
    }

    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    private var horizontalSizeClassIsCompact: Bool { horizontalSizeClass == .compact }

    // MARK: - Sections

    private var profileHeader: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [SHTheme.Colors.primary, SHTheme.Colors.purple, .pink],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .center, spacing: 16) {
                    ZStack(alignment: .bottomTrailing) {
                        Circle()
                            .fill(.white.opacity(0.2))
                            .frame(width: 80, height: 80)
                            .overlay(
                                Text(String(vm.profile.firstName.prefix(1)).uppercased())
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundStyle(.white)
                            )

                        Circle()
                            .fill(SHTheme.Colors.success)
                            .frame(width: 24, height: 24)
                            .overlay(
                                Image(systemName: "checkmark")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(.white)
                            )
                            .offset(x: 4, y: 4)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text(vm.profile.fullName.isEmpty ? "User" : vm.profile.fullName)
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.white)

                        HStack(spacing: 10) {
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .foregroundStyle(Color.yellow)
                                Text("4.8")
                                    .font(.subheadline.weight(.semibold))
                                Text("(12 reviews)")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.8))
                            }

                            HStack(spacing: 4) {
                                Image(systemName: "calendar")
                                    .foregroundStyle(.white.opacity(0.8))
                                Text("Member since \(vm.memberSinceText())")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.8))
                            }
                        }
                    }

                    Spacer()

                    if !vm.isEditing {
                        Button {
                            vm.startEditing()
                        } label: {
                            Label("Edit Profile", systemImage: "pencil")
                                .font(.subheadline.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.white.opacity(0.2))
                    }
                }
            }
            .padding(18)
        }
    }

    private var completionSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Profile Completion")
                        .font(.headline.weight(.bold))
                    Spacer()
                    Text("\(vm.profileCompletionPercent)%")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(SHTheme.Colors.primary)
                }

                ProgressView(value: Double(vm.profileCompletionPercent), total: 100)
                    .tint(SHTheme.Colors.primary)

                Text(vm.profileCompletionPercent < 100
                     ? "Complete your profile to unlock all features! \(100 - vm.profileCompletionPercent)% remaining."
                     : "🎉 Your profile is complete!")
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
    }

    private var accountStatusChips: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 8) {
                Text("Account Status")
                    .font(.headline.weight(.bold))

                HStack(spacing: 8) {
                    ChipView(symbol: "person.fill", text: "Customer", tint: SHTheme.Colors.primary)
                    ChipView(symbol: "checkmark.seal.fill", text: "Active User", tint: SHTheme.Colors.success)
                    ChipView(symbol: "crown.fill", text: "Premium Member", tint: SHTheme.Colors.purple)
                }
            }
        }
    }

    private var personalInfoSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text("Personal Information")
                        .font(.title3.weight(.bold))
                    Spacer()
                    if vm.isEditing {
                        HStack(spacing: 8) {
                            Button("Save Changes") {
                                Task { await vm.saveChanges() }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(SHTheme.Colors.primary)

                            Button("Cancel") {
                                vm.cancelEditing()
                            }
                            .buttonStyle(.bordered)
                        }
                        .font(.caption.weight(.semibold))
                    }
                }

                VStack(spacing: 12) {
                    twoColumn {
                        profileField(
                            title: "First Name",
                            value: vm.profile.firstName,
                            isEditing: vm.isEditing,
                            textBinding: $vm.editFirstName
                        )
                        profileField(
                            title: "Last Name",
                            value: vm.profile.lastName,
                            isEditing: vm.isEditing,
                            textBinding: $vm.editLastName
                        )
                    }

                    twoColumn {
                        emailField
                        phoneField
                    }

                    twoColumn {
                        genderField
                        countryField
                    }
                }
            }
        }
    }

    private var emailField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Email")
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
            HStack(spacing: 6) {
                Image(systemName: "envelope")
                    .foregroundStyle(.secondary)
                Text(vm.profile.email)
                    .font(.subheadline)
            }
        }
    }

    private var phoneField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Phone Number")
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)

            if vm.isEditing {
                HStack(spacing: 8) {
                    Picker("Code", selection: $vm.editCountryCode) {
                        Text("Code").tag("")
                        ForEach(vm.countries) { c in
                            Text(c.phoneCode).tag(c.id)
                        }
                    }
                    .labelsHidden()
                    .frame(width: 80)

                    TextField("Phone number", text: $vm.editPhone)
                        .keyboardType(.phonePad)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)
                }
            } else {
                HStack(spacing: 6) {
                    Image(systemName: "phone.fill")
                        .foregroundStyle(.secondary)
                    let code = vm.countryFromCode(vm.profile.countryCode)?.phoneCode ?? ""
                    Text(code.isEmpty ? vm.profile.phone : "\(code) \(vm.profile.phone)")
                        .font(.subheadline)
                }
            }
        }
    }

    private var genderField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Gender")
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
            if vm.isEditing {
                Picker("Gender", selection: $vm.editGender) {
                    Text("Select Gender").tag("")
                    Text("Male").tag("MALE")
                    Text("Female").tag("FEMALE")
                    Text("Other").tag("OTHER")
                }
                .pickerStyle(.menu)
            } else {
                Text(vm.profile.gender ?? "Not specified")
                    .font(.subheadline)
            }
        }
    }

    private var countryField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Country")
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
            if vm.isEditing {
                Picker("Country", selection: $vm.editCountryCode) {
                    Text("Select Country").tag("")
                    ForEach(vm.countries) { c in
                        Text(c.name).tag(c.id)
                    }
                }
                .pickerStyle(.menu)
            } else {
                let name = vm.countryFromCode(vm.profile.countryCode)?.name ?? "Not specified"
                HStack(spacing: 6) {
                    Image(systemName: "globe")
                        .foregroundStyle(.secondary)
                    Text(name)
                        .font(.subheadline)
                }
            }
        }
    }

    private func profileField(title: String, value: String, isEditing: Bool, textBinding: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
            if isEditing {
                TextField(title, text: textBinding)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)
            } else {
                Text(value)
                    .font(.subheadline.weight(.semibold))
            }
        }
    }

    private var savedAddressesSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Saved Addresses", systemImage: "mappin.and.ellipse")
                        .font(.headline.weight(.bold))
                    Spacer()
                    Button("Add New") {
                        // TODO: Address management
                    }
                    .font(.caption.weight(.semibold))
                }

                if vm.savedAddresses.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "mappin")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Text("No saved addresses yet")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 12)
                } else {
                    VStack(spacing: 8) {
                        ForEach(vm.savedAddresses) { addr in
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 6) {
                                    Text(addr.label)
                                        .font(.subheadline.weight(.semibold))
                                    if addr.isDefault {
                                        Text("Default")
                                            .font(.caption2.weight(.semibold))
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(
                                                Capsule()
                                                    .fill(SHTheme.Colors.primary.opacity(0.12))
                                            )
                                            .foregroundStyle(SHTheme.Colors.primary)
                                    }
                                }
                                Text(addr.address)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(10)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(Color(uiColor: .tertiarySystemGroupedBackground))
                            )
                        }
                    }
                }
            }
        }
    }

    private var favoriteProvidersSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Favorite Providers", systemImage: "heart.fill")
                    .font(.headline.weight(.bold))

                if vm.favoriteProviders.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "heart")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Text("No favorite providers yet")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 12)
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        ForEach(vm.favoriteProviders) { p in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(p.name)
                                    .font(.subheadline.weight(.semibold))
                                HStack(spacing: 4) {
                                    Image(systemName: "star.fill")
                                        .foregroundStyle(Color.yellow)
                                        .font(.caption)
                                    Text(String(format: "%.1f", p.rating))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("•")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(p.service)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(10)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(Color(uiColor: .tertiarySystemGroupedBackground))
                            )
                        }
                    }
                }
            }
        }
    }

    private var preferencesSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 14) {
                Text("Preferences")
                    .font(.headline.weight(.bold))

                // Theme Toggle
                VStack(alignment: .leading, spacing: 6) {
                    Text("Theme")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)
                    Button {
                        vm.toggleTheme()
                    } label: {
                        HStack {
                            Text(vm.isDarkMode ? "Dark Mode" : "Light Mode")
                                .font(.subheadline.weight(.medium))
                            Spacer()
                            Image(systemName: vm.isDarkMode ? "moon.stars.fill" : "sun.max.fill")
                                .foregroundStyle(vm.isDarkMode ? SHTheme.Colors.purple : SHTheme.Colors.primary)
                        }
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(Color(uiColor: .tertiarySystemGroupedBackground))
                        )
                    }
                    .buttonStyle(.plain)
                }

                // Language Selector
                VStack(alignment: .leading, spacing: 6) {
                    Text("Language")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)

                    Picker("Language", selection: $vm.selectedLanguageCode) {
                        ForEach(vm.availableLanguages) { lang in
                            Text("\(lang.flag) \(lang.name)").tag(lang.id)
                        }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: vm.selectedLanguageCode) { newValue in
                        Task { await vm.setLanguage(code: newValue) }
                    }
                }
            }
        }
    }

    private var securitySection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 10) {
                Label("Security & Privacy", systemImage: "shield.fill")
                    .font(.headline.weight(.bold))

                VStack(spacing: 8) {
                    securityRow(symbol: "lock.fill", text: "Change Password")
                    securityRow(symbol: "shield.lefthalf.fill", text: "Privacy Settings")
                }
            }
        }
    }

    private func securityRow(symbol: String, text: String) -> some View {
        Button {
            // TODO: Implement flows
        } label: {
            HStack(spacing: 10) {
                Image(systemName: symbol)
                    .foregroundStyle(.secondary)
                Text(text)
                    .font(.subheadline.weight(.medium))
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(uiColor: .tertiarySystemGroupedBackground))
            )
        }
        .buttonStyle(.plain)
    }

    private var supportSection: some View {
        SHCard {
            VStack(alignment: .leading, spacing: 10) {
                Label("Support & Help", systemImage: "questionmark.circle.fill")
                    .font(.headline.weight(.bold))

                VStack(spacing: 8) {
                    supportRow(symbol: "questionmark.circle", text: "Help Center")
                    supportRow(symbol: "envelope.fill", text: "Contact Support")
                }
            }
        }
    }

    private func supportRow(symbol: String, text: String) -> some View {
        Button {
            // TODO: Implement support flows
        } label: {
            HStack(spacing: 10) {
                Image(systemName: symbol)
                    .foregroundStyle(.secondary)
                Text(text)
                    .font(.subheadline.weight(.medium))
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(uiColor: .tertiarySystemGroupedBackground))
            )
        }
        .buttonStyle(.plain)
    }

    private var logoutSection: some View {
        SHCard {
            Button {
                // TODO: hook into auth/session manager and clear tokens
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .foregroundStyle(.red)
                    Text("Logout")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.red)
                    Spacer()
                }
                .padding(10)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Helpers

    private func twoColumn<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        HStack(alignment: .top, spacing: 16) {
            content()
        }
    }
}

private struct ChipView: View {
    let symbol: String
    let text: String
    let tint: Color

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: symbol)
                .font(.system(size: 12, weight: .semibold))
            Text(text)
                .font(.caption.weight(.semibold))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule(style: .continuous)
                .fill(tint.opacity(0.16))
        )
        .foregroundStyle(tint)
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
            .preferredColorScheme(.light)
        ProfileView()
            .preferredColorScheme(.dark)
    }
}

