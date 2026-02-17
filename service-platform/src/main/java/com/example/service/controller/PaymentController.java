package com.example.service.controller;

import com.example.service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired private PaymentService paymentService;

    @PostMapping("/create-intent")
    public String createPaymentIntent(@RequestParam Long amount, @RequestParam String currency) throws Exception {
        // Amount should be in the smallest currency unit (e.g., cents)
        return paymentService.createPaymentIntent(amount, currency);
    }
}
