# Authentication API Testing Guide

Base URL: `http://localhost:3001`

## Table of Contents
1. [Register](#1-register)
2. [Login](#2-login)
3. [Get Profile](#3-get-profile)
4. [Refresh Token](#4-refresh-token)
5. [Logout](#5-logout)
6. [Forgot Password](#6-forgot-password)
7. [Reset Password](#7-reset-password)
8. [Testing Flow](#testing-flow)

---

## 1. Register

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Minimum 8 characters, maximum 100 characters
- `firstName`: Minimum 1 character, maximum 50 characters
- `lastName`: Minimum 1 character, maximum 50 characters

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Success Response (201):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409):**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Login with existing credentials

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401) - User Not Found:**
```json
{
  "statusCode": 401,
  "message": "Email Not Found, Register first!",
  "error": "Unauthorized"
}
```

**Error Response (401) - Wrong Password:**
```json
{
  "statusCode": 401,
  "message": "Email and Password do not match!",
  "error": "Unauthorized"
}
```

---

## 3. Get Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get authenticated user's profile (requires JWT token)

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**cURL Command:**
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "id": "clx1234567890",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "createdAt": "2026-01-14T10:30:00.000Z",
  "updatedAt": "2026-01-14T10:30:00.000Z"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 4. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Get a new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

---

## 5. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout and invalidate tokens (requires JWT token)

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 6. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request a password reset email

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Success Response (200):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** The response is the same whether the email exists or not (security feature to prevent email enumeration)

---

## 7. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using the token from email

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Validation Rules:**
- `newPassword`: Minimum 8 characters

**cURL Command:**
```bash
curl -X POST http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "newPassword": "newSecurePassword123"
  }'
```

**Success Response (200):**
```json
{
  "message": "Password successfully reset"
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token",
  "error": "Bad Request"
}
```

---

## Testing Flow

### Complete Authentication Flow Test

1. **Register a new user:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Save the `accessToken` and `refreshToken` from the response.

2. **Access protected route (Get Profile):**
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **Refresh the token (after 15 minutes or when access token expires):**
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

4. **Logout:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

5. **Login again:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

### Password Reset Flow Test

1. **Request password reset:**
```bash
curl -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

2. **Check console/logs for reset token** (since email might not be configured)

3. **Reset password with token:**
```bash
curl -X POST http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "newPassword": "newPassword123"
  }'
```

4. **Login with new password:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newPassword123"
  }'
```

---

## Postman/Thunder Client Collection

### Environment Variables
Create these variables in your API client:
- `baseUrl`: `http://localhost:3001`
- `accessToken`: (will be set automatically from responses)
- `refreshToken`: (will be set automatically from responses)

### Test Scripts (for Postman)

**For Register/Login endpoints, add this test script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    pm.environment.set("refreshToken", response.refreshToken);
}
```

**For Refresh endpoint, add this test script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    pm.environment.set("refreshToken", response.refreshToken);
}
```

---

## Common Error Codes

- `200`: Success
- `201`: Created (successful registration)
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid credentials or token)
- `404`: Not Found
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

---

## Token Expiration Times

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Password Reset Token**: 1 hour

---

## Notes

1. Make sure the backend server is running on port 3001
2. Access tokens expire after 15 minutes - use refresh token to get a new one
3. All protected routes require the `Authorization: Bearer <token>` header
4. Email functionality requires proper SMTP configuration in `.env` file
5. For testing password reset without email, check the backend console logs for the reset token
