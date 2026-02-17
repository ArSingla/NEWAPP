package com.example.service.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String customerId;     // reference to User._id
    private String providerId;     // reference to User._id (if applicable)
    private BigDecimal amount;     // in major units (e.g., INR)
    private String currency;       // e.g., "INR", "USD"
    private String status;         // SUCCESS, FAILED, PENDING, etc.
    private String paymentIntentId; // Stripe intent id or other identifier

    @CreatedDate
    private Instant createdAt;

    public Payment() {}

    public Payment(String customerId, String providerId, BigDecimal amount, String currency,
                   String status, String paymentIntentId) {
        this.customerId = customerId;
        this.providerId = providerId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.paymentIntentId = paymentIntentId;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
