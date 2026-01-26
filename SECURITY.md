# Security Guidelines for Basis Data LTT

## Overview

This document outlines the security architecture, known vulnerabilities, and best practices for the Basis Data LTT healthcare management system. **Please read this carefully before deploying to production.**

## Table of Contents

- [Authentication & Password Security](#authentication--password-security)
- [Current Security Issues](#current-security-issues)
- [Backend Requirements](#backend-requirements)
- [Frontend Security Measures](#frontend-security-measures)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Security Checklist](#security-checklist)

---

## Authentication & Password Security

### Password Flow Architecture

**This is a FRONTEND application only.** All password hashing and authentication logic MUST be implemented on the backend.

#### Current Flow:

```
User Input → Frontend → Backend API → Database
              (plain)    (must hash)
```

1. **User Registration** (`/therapist/register`):
   - User enters email, password, and personal details
   - Frontend sends password **in plain text JSON** to backend API
   - Backend MUST hash password before storing in database

2. **User Login** (`/login`):
   - User enters email and password
   - Frontend sends credentials **in plain text JSON** to backend API
   - Backend validates password hash and returns session token

3. **Session Management**:
   - Backend returns session token upon successful login
   - Frontend stores token in `localStorage` as `session-token`
   - All subsequent API requests include this token in headers

### Why Frontend Doesn't Hash Passwords

**Important**: Password hashing is intentionally NOT performed on the frontend for these reasons:

1. **Security by Design**: Client-side hashing would expose the hashing algorithm and make it easier for attackers to prepare attacks
2. **Salt Management**: Proper password hashing requires unique salts per user, which must be securely generated and stored server-side
3. **Defense in Depth**: If frontend hashing were used, the hash itself becomes the password, defeating the purpose
4. **Backend Validation**: Only the backend can enforce proper password policies and use secure hashing algorithms

---

## Current Security Issues

### 🔴 CRITICAL Vulnerabilities

#### 1. Plain Text Password Transmission
**Issue**: Passwords are sent in plain text JSON to the backend.

**Files Affected**:
- `src/app/login/page.tsx` (lines 29-38)
- `src/app/therapist/register/page.tsx` (lines 43-64)

**Current Code**:
```typescript
body: JSON.stringify({ email, password })  // ← Password in plain text
```

**Risk**: If HTTPS is not enforced, passwords can be intercepted by man-in-the-middle attacks.

**Mitigation**: 
- ✅ **REQUIRED**: Deploy backend with HTTPS/TLS enabled
- ✅ **REQUIRED**: Configure frontend to use `https://` API endpoint in production
- ✅ Implement HSTS (HTTP Strict Transport Security) on backend
- ✅ Use strong TLS/SSL certificates (TLS 1.2 or higher)

#### 2. No HTTPS Enforcement in Configuration
**Issue**: Default configuration uses HTTP protocol.

**Files Affected**:
- `.env.sample` (line 2)
- README.md configuration examples

**Current Default**:
```bash
NEXT_PUBLIC_API_HOST=http://localhost:19091  # ← HTTP not HTTPS
```

**Risk**: Development habits may carry over to production, exposing credentials.

**Mitigation**:
- ✅ Always use HTTPS in production
- ✅ Update `.env.production` to enforce HTTPS URLs
- ✅ Add validation to reject HTTP URLs in production builds

#### 3. Public API Token Exposure
**Issue**: `NEXT_PUBLIC_API_TOKEN` is exposed to the browser.

**Files Affected**:
- All API calls using `Authorization: Bearer ${NEXT_PUBLIC_API_TOKEN}`

**Risk**: Any user can inspect the browser console/network tab and extract this token.

**Current Usage**:
```typescript
headers: {
  'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
  'session-token': localStorage.getItem('session-token')
}
```

**Mitigation**:
- ✅ Backend should ONLY rely on `session-token` for authentication
- ✅ `NEXT_PUBLIC_API_TOKEN` should be removed or used only for non-sensitive operations
- ⚠️ **NEVER use NEXT_PUBLIC_* variables for secrets**

### 🟠 HIGH Severity Issues

#### 4. Session Token in localStorage
**Issue**: Session tokens stored in localStorage are vulnerable to XSS attacks.

**Risk**: If an attacker injects JavaScript (via XSS), they can steal session tokens.

**Mitigation**:
- ✅ Implement Content Security Policy (CSP) headers
- ✅ Sanitize all user inputs to prevent XSS
- ✅ Consider using httpOnly cookies for session management (requires backend changes)
- ✅ Implement short session timeouts and token rotation

#### 5. Client-Side Only Password Validation
**Issue**: Password strength requirements only checked in browser.

**Files Affected**:
- `src/app/therapist/register/page.tsx` (therapist registration form password validation logic)

**Risk**: Attackers can bypass frontend validation by sending direct API requests.

**Mitigation**:
- ✅ Backend MUST validate password strength server-side
- ✅ Frontend validation is for UX only, not security

### 🟡 MEDIUM Severity Issues

#### 6. Password Confirmation Only Client-Side
**Issue**: Password confirmation check happens only in the browser.

**Mitigation**:
- ✅ Keep client-side check for UX
- ✅ Backend should receive and validate both password fields

---

## Backend Requirements

### CRITICAL: Backend Security Implementation

The backend API MUST implement the following security measures:

#### 1. Password Hashing Requirements

**REQUIRED**: Use a strong, adaptive hashing algorithm:

- ✅ **Recommended**: Argon2id (winner of Password Hashing Competition)
- ✅ **Acceptable**: bcrypt with cost factor ≥ 12
- ❌ **NEVER USE**: MD5, SHA1, SHA256, SHA512 without salt/iterations

**Example (Node.js with bcrypt)**:
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Registration
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Login
const match = await bcrypt.compare(plainPassword, hashedPassword);
```

**Example (Go with bcrypt)**:
```go
import "golang.org/x/crypto/bcrypt"

// Registration
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 12)

// Login
err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(plainPassword))
```

#### 2. Password Policy Enforcement

Backend MUST enforce:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character (recommended)
- ✅ Maximum length limit (e.g., 72 bytes for bcrypt)

#### 3. Authentication Best Practices

- ✅ Implement rate limiting on login endpoints (e.g., 5 attempts per 15 minutes)
- ✅ Use timing-safe password comparison to prevent timing attacks
- ✅ Never reveal whether email or password was incorrect (just say "invalid credentials")
- ✅ Log failed login attempts for security monitoring
- ✅ Implement account lockout after repeated failures
- ✅ Use secure session tokens (cryptographically random, minimum 128 bits)
- ✅ Set session expiration (e.g., 24 hours)
- ✅ Implement token rotation on sensitive actions

#### 4. HTTPS/TLS Configuration

- ✅ Use TLS 1.2 or TLS 1.3 only
- ✅ Disable SSL/TLS compression
- ✅ Use strong cipher suites
- ✅ Implement HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- ✅ Redirect all HTTP traffic to HTTPS

---

## Frontend Security Measures

### Implemented Security Features

1. **Password Input Masking**: Password fields use `type="password"` to hide input
2. **Client-Side Validation**: Basic password strength validation for UX
3. **Session Token Management**: Tokens stored and sent with each authenticated request
4. **401 Handling**: Automatic redirect to login on unauthorized access

### Recommended Improvements

#### 1. Enhanced Password Validation with User Feedback

Add real-time password strength indicator (see implementation below).

#### 2. Content Security Policy

Add CSP headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

#### 3. Input Sanitization

All user inputs should be sanitized to prevent XSS:
- Use React's built-in escaping (default for JSX)
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Validate and sanitize on backend as well

---

## Environment Variables

### Security Guidelines for Environment Variables

#### NEXT_PUBLIC_* Variables

⚠️ **WARNING**: Variables prefixed with `NEXT_PUBLIC_` are **embedded in the browser bundle** and are **publicly accessible**.

**NEVER store in NEXT_PUBLIC_* variables**:
- ❌ API secrets or keys
- ❌ Database credentials
- ❌ Private tokens
- ❌ Encryption keys
- ❌ Any sensitive information

**Safe to store in NEXT_PUBLIC_* variables**:
- ✅ Public API endpoints (e.g., `NEXT_PUBLIC_API_HOST`)
- ✅ Public feature flags
- ✅ Analytics IDs (for public services)
- ✅ Environment names (development, staging, production)

#### Current Variable Usage

**`.env.sample`**:
```bash
# Backend API host URL
NEXT_PUBLIC_API_HOST=https://api.example.com  # ← Must be HTTPS in production

# ⚠️ Security Issue: This should NOT be a NEXT_PUBLIC_* variable
# Backend should validate session-token only, not this public token
NEXT_PUBLIC_API_TOKEN=your-token-here  # ← Remove or move to backend
```

**Recommendation**: 
1. Backend should remove dependency on `NEXT_PUBLIC_API_TOKEN` for authentication
2. Use `session-token` header exclusively for user authentication
3. If API-level authentication is needed, handle it server-side only

---

## Production Deployment

### Pre-Deployment Security Checklist

Before deploying to production, ensure:

#### Backend Checklist
- [ ] HTTPS/TLS enabled with valid certificate
- [ ] Password hashing with Argon2id or bcrypt (cost ≥ 12)
- [ ] Unique salts per user password
- [ ] Rate limiting on authentication endpoints
- [ ] Session token expiration implemented
- [ ] Account lockout after failed attempts
- [ ] Security logging enabled
- [ ] HSTS header configured
- [ ] CORS properly configured
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Input validation on all endpoints

#### Frontend Checklist
- [ ] `NEXT_PUBLIC_API_HOST` uses HTTPS URL
- [ ] CSP headers configured
- [ ] No sensitive data in localStorage
- [ ] XSS prevention measures in place
- [ ] Error messages don't leak sensitive information
- [ ] All dependencies up to date
- [ ] Security audit completed

#### Infrastructure Checklist
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] Regular security patches applied
- [ ] Backup and disaster recovery plan
- [ ] Monitoring and alerting configured
- [ ] Security incident response plan

---

## Security Checklist

### For Developers

**Before Committing Code**:
- [ ] No hardcoded passwords or secrets
- [ ] All user inputs are validated
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention in place
- [ ] Authentication checks present
- [ ] Error handling doesn't leak info

**Before Deploying**:
- [ ] Environment variables properly set
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security documentation updated

### For DevOps/Infrastructure

**Production Environment**:
- [ ] TLS/SSL certificates valid and up to date
- [ ] Firewall rules reviewed
- [ ] Database encrypted at rest
- [ ] Backups tested and verified
- [ ] Monitoring alerts configured
- [ ] Log aggregation enabled

---

## Reporting Security Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [Your Security Email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)

---

**Last Updated**: 2026-01-25  
**Version**: 1.0.0
