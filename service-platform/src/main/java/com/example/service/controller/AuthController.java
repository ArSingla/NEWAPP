package com.example.service.controller;

import com.example.service.model.User;
import com.example.service.repository.UserRepository;
import com.example.service.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${feature.email.verification.enabled:true}")
    private boolean emailVerificationEnabled;

    // Registration endpoint - now sends verification code instead of immediately creating account
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        Optional<User> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Email already in use!");
        }

        if (emailVerificationEnabled) {
            // Generate verification code
            String verificationCode = emailService.generateVerificationCode();

            // Set verification details
            user.setVerificationCode(verificationCode);
            user.setEmailVerified(false);
            user.setVerificationCodeExpiry(Instant.now().plusSeconds(600)); // 10 minutes expiry
        } else {
            // Skip verification when disabled
            user.setEmailVerified(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiry(null);
        }
        
        // Encode password before saving
        user.setPassword(encoder.encode(user.getPassword()));

        User savedUser = userRepo.save(user);

        if (emailVerificationEnabled) {
            // Send verification email
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }

        Map<String, Object> response = new HashMap<>();
        if (emailVerificationEnabled) {
            response.put("message", "Registration initiated! Please check your email for verification code.");
            response.put("requiresVerification", true);
        } else {
            response.put("message", "Registration successful. Email verification is disabled.");
            response.put("requiresVerification", false);
        }
        response.put("userId", savedUser.getId());
        response.put("email", savedUser.getEmail());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Email verification endpoint
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String verificationCode = request.get("verificationCode");

        if (email == null || verificationCode == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email and verification code are required");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User user = userOpt.get();

        // Check if code is expired
        if (user.getVerificationCodeExpiry().isBefore(Instant.now())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Verification code has expired. Please request a new one.");
        }

        // Check if code matches
        if (!verificationCode.equals(user.getVerificationCode())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid verification code");
        }

        // Mark email as verified
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email verified successfully! You can now login.");
        response.put("userId", user.getId());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }

    // Resend verification code endpoint
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email is required");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User user = userOpt.get();

        if (user.isEmailVerified()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email is already verified");
        }

        // Generate new verification code
        String newVerificationCode = emailService.generateVerificationCode();
        user.setVerificationCode(newVerificationCode);
        user.setVerificationCodeExpiry(Instant.now().plusSeconds(600)); // 10 minutes expiry
        userRepo.save(user);

        // Send new verification email
        emailService.sendVerificationEmail(email, newVerificationCode);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "New verification code sent to your email");

        return ResponseEntity.ok(response);
    }

    // Enhanced login endpoint - now checks for email verification
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User attempt) {
        Optional<User> userOpt = userRepo.findByEmail(attempt.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (encoder.matches(attempt.getPassword(), user.getPassword())) {
                
                // Check if email is verified when feature is enabled
                if (emailVerificationEnabled && !user.isEmailVerified()) {
                    return ResponseEntity
                            .status(HttpStatus.UNAUTHORIZED)
                            .body("Please verify your email before logging in");
                }

                // Generate a simple token (in production, use JWT)
                String token = UUID.randomUUID().toString();
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful!");
                response.put("token", token);
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("role", user.getRole());
                response.put("providerType", user.getProviderType());
                
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid credentials");
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Logout successful!");
        return ResponseEntity.ok(response);
    }

    // Social Authentication Endpoints
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request) {
        String googleToken = request.get("token");
        String email = request.get("email");
        String name = request.get("name");
        
        // In production, validate the Google token with Google's API
        // For now, we'll simulate the process
        
        try {
            // Check if user already exists
            Optional<User> existingUser = userRepo.findByEmail(email);
            User user;
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update last login time if needed
            } else {
                // Create new user from Google data
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole("CUSTOMER"); // Default role
                user.setPassword(encoder.encode(UUID.randomUUID().toString())); // Random password for OAuth users
                user.setEmailVerified(true); // OAuth users are pre-verified
                userRepo.save(user);
            }
            
            // Generate session token
            String token = UUID.randomUUID().toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Google authentication successful!");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("providerType", user.getProviderType());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/facebook")
    public ResponseEntity<?> facebookAuth(@RequestBody Map<String, String> request) {
        String facebookToken = request.get("token");
        String email = request.get("email");
        String name = request.get("name");
        
        try {
            Optional<User> existingUser = userRepo.findByEmail(email);
            User user;
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole("CUSTOMER");
                user.setPassword(encoder.encode(UUID.randomUUID().toString()));
                user.setEmailVerified(true); // OAuth users are pre-verified
                userRepo.save(user);
            }
            
            String token = UUID.randomUUID().toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Facebook authentication successful!");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("providerType", user.getProviderType());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/instagram")
    public ResponseEntity<?> instagramAuth(@RequestBody Map<String, String> request) {
        String instagramToken = request.get("token");
        String email = request.get("email");
        String name = request.get("name");
        
        try {
            Optional<User> existingUser = userRepo.findByEmail(email);
            User user;
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole("CUSTOMER");
                user.setPassword(encoder.encode(UUID.randomUUID().toString()));
                user.setEmailVerified(true); // OAuth users are pre-verified
                userRepo.save(user);
            }
            
            String token = UUID.randomUUID().toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Instagram authentication successful!");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("providerType", user.getProviderType());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }
}
