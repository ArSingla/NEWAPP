package com.example.service.controller;

import com.example.service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired private UserRepository userRepo;

    @GetMapping("/users")
    public List<?> getAllUsers() {
        return userRepo.findAll();
    }
    // Add more endpoints for dashboard as needed
}
