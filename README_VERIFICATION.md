## Email Verification Toggle

### Disable (for development/testing)

1. Edit `service-platform/src/main/resources/application.properties`.
2. Set:

```
feature.email.verification.enabled=false
```

3. Restart the backend.

Effects:
- Registration auto-verifies users.
- No verification emails are sent.
- Login does not block on `emailVerified`.

### Enable (for production)

1. Edit `service-platform/src/main/resources/application.properties`.
2. Set:

```
feature.email.verification.enabled=true
```

3. Ensure email sending is configured in `EmailService` and restart the backend.

Effects:
- Registration sends a verification code (10-minute expiry).
- Users must call `/api/auth/verify-email` successfully before login.
- `/api/auth/resend-verification` issues a new code.

### Environment variable override

You can control the flag via env var without editing files:

```
FEATURE_EMAIL_VERIFICATION_ENABLED=false   # disable
FEATURE_EMAIL_VERIFICATION_ENABLED=true    # enable
```

This maps to Spring property `feature.email.verification.enabled`.

### Related endpoints

- POST `/api/auth/register`
- POST `/api/auth/verify-email`
- POST `/api/auth/resend-verification`
- POST `/api/auth/login`

When disabled, verify/resend endpoints are not required.










