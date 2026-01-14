#!/bin/bash

# Authentication API Test Script
# Make sure the backend server is running on port 3001

BASE_URL="http://localhost:3001"
EMAIL="test$(date +%s)@example.com"  # Unique email for each test run
PASSWORD="testPassword123"
NEW_PASSWORD="newPassword456"

echo "=========================================="
echo "Authentication API Testing"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register
echo -e "${YELLOW}Test 1: Register${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extract tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
else
    echo -e "${RED}✗ Registration failed${NC}"
    exit 1
fi
echo ""

# Test 2: Get Profile
echo -e "${YELLOW}Test 2: Get Profile (Protected Route)${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PROFILE_RESPONSE" | jq '.'

if echo "$PROFILE_RESPONSE" | jq -e '.email' > /dev/null; then
    echo -e "${GREEN}✓ Profile retrieved successfully${NC}"
else
    echo -e "${RED}✗ Failed to get profile${NC}"
fi
echo ""

# Test 3: Logout
echo -e "${YELLOW}Test 3: Logout${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LOGOUT_RESPONSE" | jq '.'

if echo "$LOGOUT_RESPONSE" | jq -e '.message' | grep -q "logged out"; then
    echo -e "${GREEN}✓ Logout successful${NC}"
else
    echo -e "${RED}✗ Logout failed${NC}"
fi
echo ""

# Test 4: Login
echo -e "${YELLOW}Test 4: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

# Extract new tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi
echo ""

# Test 5: Refresh Token
echo -e "${YELLOW}Test 5: Refresh Token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$REFRESH_RESPONSE" | jq '.'

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Token refresh successful${NC}"
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
else
    echo -e "${RED}✗ Token refresh failed${NC}"
fi
echo ""

# Test 6: Forgot Password
echo -e "${YELLOW}Test 6: Forgot Password${NC}"
FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\"
  }")

echo "$FORGOT_RESPONSE" | jq '.'

if echo "$FORGOT_RESPONSE" | jq -e '.message' | grep -q "password reset"; then
    echo -e "${GREEN}✓ Forgot password request successful${NC}"
    echo -e "${YELLOW}Note: Check backend console logs for reset token${NC}"
else
    echo -e "${RED}✗ Forgot password request failed${NC}"
fi
echo ""

# Test 7: Invalid Login
echo -e "${YELLOW}Test 7: Invalid Login (Wrong Password)${NC}"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"wrongpassword\"
  }")

echo "$INVALID_LOGIN" | jq '.'

if echo "$INVALID_LOGIN" | jq -e '.statusCode' | grep -q "401"; then
    echo -e "${GREEN}✓ Invalid login correctly rejected${NC}"
else
    echo -e "${RED}✗ Invalid login test failed${NC}"
fi
echo ""

# Test 8: Duplicate Registration
echo -e "${YELLOW}Test 8: Duplicate Registration${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "$DUPLICATE_RESPONSE" | jq '.'

if echo "$DUPLICATE_RESPONSE" | jq -e '.statusCode' | grep -q "409"; then
    echo -e "${GREEN}✓ Duplicate registration correctly rejected${NC}"
else
    echo -e "${RED}✗ Duplicate registration test failed${NC}"
fi
echo ""

# Test 9: Access Protected Route Without Token
echo -e "${YELLOW}Test 9: Access Protected Route Without Token${NC}"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile")

echo "$UNAUTHORIZED_RESPONSE" | jq '.'

if echo "$UNAUTHORIZED_RESPONSE" | jq -e '.statusCode' | grep -q "401"; then
    echo -e "${GREEN}✓ Unauthorized access correctly rejected${NC}"
else
    echo -e "${RED}✗ Unauthorized access test failed${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "=========================================="
echo ""
echo "Test user credentials:"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""
echo "Current Access Token: $ACCESS_TOKEN"
echo "Current Refresh Token: $REFRESH_TOKEN"
