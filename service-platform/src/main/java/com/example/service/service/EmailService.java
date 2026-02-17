package com.example.service.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class EmailService {

    // In a real application, you would integrate with an email service like SendGrid, AWS SES, or JavaMailSender
    // For now, we'll simulate email sending by logging the verification code
    
    public void sendVerificationEmail(String email, String verificationCode) {
        // Simulate email sending - in production, replace this with actual email service
        System.out.println("=== EMAIL VERIFICATION ===");
        System.out.println("To: " + email);
        System.out.println("Subject: Verify Your Email Address");
        System.out.println("Body: Your verification code is: " + verificationCode);
        System.out.println("This code will expire in 10 minutes.");
        System.out.println("==========================");
        
        // TODO: Replace with actual email service integration
        // Example with JavaMailSender:
        // SimpleMailMessage message = new SimpleMailMessage();
        // message.setTo(email);
        // message.setSubject("Verify Your Email Address");
        // message.setText("Your verification code is: " + verificationCode + "\nThis code will expire in 10 minutes.");
        // emailSender.send(message);
    }

    public String generateVerificationCode() {
        // Generate a 6-digit verification code
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 to 999999
        return String.valueOf(code);
    }
}




