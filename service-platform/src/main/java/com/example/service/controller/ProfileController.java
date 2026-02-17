package com.example.service.controller;

import com.example.service.model.User;
import com.example.service.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired 
    private UserRepository userRepo;

    // Get currently logged-in user's profile
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepo.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // return user details (consider hiding password in DTO in production)
        return ResponseEntity.ok(userOpt.get());
    }

    // Update profile details for logged-in user
    @PutMapping
    public ResponseEntity<?> updateProfile(Authentication authentication, @Valid @RequestBody User updated) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepo.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();

        // Update allowed fields only (ignore nulls for partial updates)
        if (updated.getName() != null) {
            user.setName(updated.getName());
        }
        if (updated.getProviderType() != null) {
            user.setProviderType(updated.getProviderType());
        }
        if (updated.getPreferredLanguage() != null) {
            user.setPreferredLanguage(updated.getPreferredLanguage());
        }
        if (updated.getGender() != null) {
            user.setGender(updated.getGender());
        }
        if (updated.getCountry() != null) {
            user.setCountry(updated.getCountry());
        }
        if (updated.getPhoneNumber() != null) {
            user.setPhoneNumber(updated.getPhoneNumber());
        }

        // Do NOT update password or email here for simplicity and security
        userRepo.save(user);

        return ResponseEntity.ok(user);
    }
}
