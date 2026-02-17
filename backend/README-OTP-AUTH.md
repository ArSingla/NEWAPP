# OTP Authentication System (AWS SES + SNS)

This document describes how to set up and use the OTP-based authentication system: **registration verification** and **forgot password** using **AWS SES** (email) and **AWS SNS** (SMS).

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [AWS Setup](#aws-setup)
- [Local Setup (Redis)](#local-setup-redis)
- [API Endpoints](#api-endpoints)
- [Flows](#flows)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

| Feature | Description |
|--------|-------------|
| **Registration OTP** | New users get a 6-digit OTP via email and/or SMS; account is `isVerified: false` until OTP is verified. |
| **Forgot Password** | User requests OTP to registered email or phone; after verification they receive a short-lived `resetToken` to set a new password. |
| **Storage** | OTP data (hashed OTP, expiry, attempts) is stored in **Redis**, not in MongoDB. User document only has `isVerified` / `emailVerified`. |
| **Delivery** | **AWS SES** for email OTP, **AWS SNS** for SMS OTP (AWS SDK v3). |

Existing **login** (email + password + JWT) is unchanged; OTP only extends registration and password reset.

---

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** (for user data)
- **Redis** (for OTP and reset-session storage)
- **AWS account** with SES and SNS enabled

---

## Environment Variables

Copy the example and set values (see [AWS Setup](#aws-setup) and [Local Setup](#local-setup-redis)).

### Backend `.env` (in `backend/`)

```env
# Server
PORT=8080
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/service_platform

# JWT (existing login)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Feature flag: set to "false" to disable email/OTP verification (e.g. dev)
FEATURE_EMAIL_VERIFICATION_ENABLED=true

# Redis (required for OTP and reset sessions)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
# Or use a single URL instead:
# REDIS_URL=redis://localhost:6379/0

# AWS (required for sending OTP)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Optional: bcrypt rounds for OTP hashing (default 10)
# OTP_BCRYPT_ROUNDS=10
```

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Used for login JWT signing. |
| `FEATURE_EMAIL_VERIFICATION_ENABLED` | No | `true` = registration requires OTP verification; `false` = no OTP, instant verified. |
| `REDIS_*` or `REDIS_URL` | Yes for OTP | Redis connection for OTP storage and reset sessions. |
| `AWS_ACCESS_KEY_ID` | Yes for OTP | AWS credentials. |
| `AWS_SECRET_ACCESS_KEY` | Yes for OTP | AWS credentials. |
| `AWS_REGION` | Yes for OTP | e.g. `us-east-1`. |
| `AWS_SES_FROM_EMAIL` | Yes for email OTP | Verified sender address in SES. |

---

## AWS Setup

### 1. AWS credentials

Create an IAM user with:

- **SES**: `ses:SendEmail` (and optionally `ses:SendRawEmail`) on the resources you use.
- **SNS**: `sns:Publish` for SMS.

Attach policies (e.g. `AmazonSESFullAccess` and `AmazonSNSFullAccess` for testing; restrict in production).  
Put the access key and secret into `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; set `AWS_REGION`.

### 2. AWS SES (email OTP)

1. In **SES** → **Verified identities**, verify the **sender email** you will use (e.g. `noreply@yourdomain.com`).
2. If the account is in **Sandbox**, also verify each **recipient** email you send to during testing.
3. Set that address in `.env` as `AWS_SES_FROM_EMAIL`.

### 3. AWS SNS (SMS OTP)

1. In **SNS** → **Text messaging (SMS)**:
   - Set default region and (optional) SMS type (Transactional recommended).
   - In **Sandbox**, you may need to verify destination phone numbers.
2. Phone numbers must be in **E.164** (e.g. `+919876543210`). The API validates this format.

---

## Local Setup (Redis)

OTP and reset sessions are stored in Redis. Start Redis locally or use a hosted Redis (e.g. ElastiCache, Redis Cloud).

**Local (macOS with Homebrew):**

```bash
brew install redis
brew services start redis
```

**Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

Ensure `REDIS_HOST`/`REDIS_PORT` or `REDIS_URL` in `.env` match your Redis instance.

---

## API Endpoints

Base path for auth: **`/api/auth`**.

### Registration and verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register; if verification enabled, sends OTP (email and/or SMS). |
| POST | `/api/auth/verify-otp` | Verify registration OTP; sets user verified. |
| POST | `/api/auth/resend-otp` | Resend registration OTP (30s cooldown). |

### Forgot password

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password` | Request OTP to email or phone. |
| POST | `/api/auth/verify-forgot-otp` | Verify OTP; returns short-lived `resetToken`. |
| POST | `/api/auth/reset-password` | Set new password using `resetToken`. |

### Other (unchanged)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + password; returns JWT. |
| POST | `/api/auth/logout` | Logout (client discards token). |

---

## Flows

### 1. Registration with OTP

1. **POST `/api/auth/register`**  
   Body: `{ "email", "password", "name", "phoneNumber" (optional, E.164) }`  
   - User is created with `isVerified: false`.  
   - If `FEATURE_EMAIL_VERIFICATION_ENABLED=true`, a 6-digit OTP is generated, hashed with bcrypt, stored in Redis (5 min TTL, max 5 attempts), and sent via SES (and SNS if `phoneNumber` is provided).

2. **POST `/api/auth/verify-otp`**  
   Body: `{ "email", "otp" }`  
   - Validates OTP (expiry, attempts, bcrypt compare).  
   - On success: user `isVerified` and `emailVerified` set to `true`, OTP removed from Redis.

3. **POST `/api/auth/login`**  
   - If verification is enabled, login is rejected until the user is verified.

**Resend:** **POST `/api/auth/resend-otp`** with `{ "email", "method" (optional: "email" \| "phone") }` — 30 second cooldown.

### 2. Forgot password

1. **POST `/api/auth/forgot-password`**  
   Body: `{ "email", "method": "email" | "phone" }`  
   - Looks up user by email; checks that the chosen `method` (email or phone) is available.  
   - Creates OTP in Redis, sends via SES or SNS.  
   - Response message: *"OTP has been sent to your registered email"* or *"OTP has been sent to your registered phone number"*.

2. **POST `/api/auth/verify-forgot-otp`**  
   Body: `{ "email", "otp" }`  
   - Verifies OTP; on success creates a reset session in Redis and returns **`resetToken`** (short-lived, e.g. 10 minutes).

3. **POST `/api/auth/reset-password`**  
   Body: `{ "email", "resetToken", "newPassword" }`  
   - Verifies `resetToken`, then hashes and saves new password; reset session is consumed and removed.

---

## Request/Response Examples

### Register (verification enabled)

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePass123",
  "name": "Jane Doe",
  "phoneNumber": "+919876543210"
}
```

Response (201):

```json
{
  "message": "Registration successful. OTP sent for account verification.",
  "requiresVerification": true,
  "userId": "...",
  "email": "user@example.com"
}
```

### Verify registration OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json

{ "email": "user@example.com", "otp": "123456" }
```

### Forgot password – request OTP

```http
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com", "method": "email" }
```

Response (200):

```json
{ "message": "OTP has been sent to your registered email" }
```

### Verify forgot OTP and get reset token

```http
POST /api/auth/verify-forgot-otp
Content-Type: application/json

{ "email": "user@example.com", "otp": "654321" }
```

Response (200):

```json
{
  "message": "OTP verified. You can now reset your password.",
  "resetToken": "a1b2c3..."
}
```

### Reset password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "a1b2c3...",
  "newPassword": "newSecurePass456"
}
```

---

## Security

- **Plain OTP is never stored** — only bcrypt hash in Redis.
- **OTP expiry:** 5 minutes.
- **Max attempts:** 5 per OTP; after that the OTP is invalidated.
- **Resend cooldown:** 30 seconds between OTP requests per purpose/user.
- **Rate limiting:** OTP endpoints (e.g. 10 requests per 15 min per IP); auth endpoints (e.g. 20 per 15 min).
- **Reset token:** Short-lived (e.g. 10 min), single-use, stored hashed in Redis.
- **Phone:** Validated as E.164 before sending SMS.
- **Email:** Validated and normalized (express-validator).

---

## File Reference

| File | Purpose |
|------|---------|
| `routes/auth.js` | All auth routes: register, verify-otp, resend-otp, forgot-password, verify-forgot-otp, reset-password, login, logout. |
| `utils/otp.js` | OTP create/verify, reset session create/verify; uses Redis and bcrypt. |
| `services/awsNotificationService.js` | AWS SES (email OTP) and SNS (SMS OTP) using AWS SDK v3. |
| `config/redis.js` | Redis client (ioredis). |
| `models/User.js` | User schema (`isVerified`, `emailVerified`, `phoneNumber`, etc.). |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| "AWS credentials/region are not configured" | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` in `.env`. |
| "AWS_SES_FROM_EMAIL is not configured" | Set `AWS_SES_FROM_EMAIL` to a verified SES identity. |
| Email OTP not received | SES sandbox: verify recipient; check spam; SES sending limits. |
| SMS OTP not received | SNS sandbox: verify phone; E.164 format; SNS SMS quotas and region. |
| "OTP is invalid or has expired" | OTP older than 5 min or already used; request a new OTP (resend/forgot again). |
| "Maximum OTP attempts exceeded" | User failed 5 attempts; request a new OTP. |
| "Please wait X seconds before requesting another OTP" | Respect 30s resend cooldown. |
| Redis connection errors | Redis running; `REDIS_HOST`/`REDIS_PORT` or `REDIS_URL` correct; no firewall blocking. |
| "Invalid or expired reset session" | Reset token used already or expired; verify forgot OTP again to get a new token. |

---

## Quick start checklist

1. Install and start **MongoDB** and **Redis**.
2. Copy env example to `backend/.env` and set **MongoDB**, **Redis**, **JWT**, and **AWS** variables.
3. In AWS: verify **SES** sender (and recipients if in Sandbox); configure **SNS** for SMS if using phone OTP.
4. Run backend: `cd backend && npm install && npm start`.
5. Use the endpoints above from the frontend or Postman; ensure `phoneNumber` is E.164 (e.g. `+919876543210`) when testing SMS.

Existing **login** continues to work; only registration and forgot-password flows use OTP and AWS.
