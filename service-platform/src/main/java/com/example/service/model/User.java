package com.example.service.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email; // unique identifier for user

    private String password; // store only hashed/encoded passwords
    private String name;
    private String role; // CUSTOMER, SERVICE_PROVIDER
    private String providerType; // if SERVICE_PROVIDER -> CHEF, BARTENDER, etc.

    // User preference for UI language (e.g., en, es, fr, hi, bn, ja, ko)
    private String preferredLanguage;
    
    // Additional profile fields
    private String gender; // MALE, FEMALE, OTHER
    private String country; // Country code like IN, US, RU, CN
    private String phoneNumber; // Full phone number with country code

    // Email verification fields
    private String verificationCode;
    private boolean emailVerified = false;
    private Instant verificationCodeExpiry;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public User() {}

    public User(String email, String password, String name, String role, String providerType) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.providerType = providerType;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    // Email verification getters and setters
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public Instant getVerificationCodeExpiry() { return verificationCodeExpiry; }
    public void setVerificationCodeExpiry(Instant verificationCodeExpiry) { this.verificationCodeExpiry = verificationCodeExpiry; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
