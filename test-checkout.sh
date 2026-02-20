#!/bin/bash

set -e

API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3002"

echo "🧪 Testing Checkout Flow"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login
echo "📝 Step 1: Logging in as test user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@bookstore.com",
    "password": "user123"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 2: Get books
echo "📚 Step 2: Fetching available books..."
BOOKS_RESPONSE=$(curl -s -X GET "$API_URL/books?limit=5")
BOOK_ID=$(echo $BOOKS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BOOK_ID" ]; then
  echo -e "${RED}❌ No books found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Books found${NC}"
echo "First book ID: $BOOK_ID"
echo ""

# Step 3: Clear cart first
echo "🧹 Step 3: Clearing cart..."
curl -s -X DELETE "$API_URL/cart" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null
echo -e "${GREEN}✅ Cart cleared${NC}"
echo ""

# Step 4: Add items to cart
echo "🛒 Step 4: Adding items to cart..."
ADD_CART_RESPONSE=$(curl -s -X POST "$API_URL/cart/items" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookId\": \"$BOOK_ID\",
    \"quantity\": 2
  }")

if echo "$ADD_CART_RESPONSE" | grep -q "error\|Error\|failed"; then
  echo -e "${RED}❌ Failed to add item to cart${NC}"
  echo "Response: $ADD_CART_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Items added to cart${NC}"
echo ""

# Step 5: View cart
echo "👀 Step 5: Viewing cart..."
CART_RESPONSE=$(curl -s -X GET "$API_URL/cart" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

ITEM_COUNT=$(echo $CART_RESPONSE | grep -o '"itemCount":[0-9]*' | cut -d':' -f2)
TOTAL=$(echo $CART_RESPONSE | grep -o '"total":[0-9.]*' | cut -d':' -f2)

if [ -z "$ITEM_COUNT" ] || [ "$ITEM_COUNT" = "0" ]; then
  echo -e "${RED}❌ Cart is empty${NC}"
  echo "Response: $CART_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Cart contains $ITEM_COUNT items${NC}"
echo "Total: \$$TOTAL"
echo ""

# Step 6: Create checkout session
echo "💳 Step 6: Creating Stripe checkout session..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/orders/create-checkout-session" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

SESSION_ID=$(echo $CHECKOUT_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
CHECKOUT_URL=$(echo $CHECKOUT_RESPONSE | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}❌ Failed to create checkout session${NC}"
  echo "Response: $CHECKOUT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Checkout session created successfully!${NC}"
echo ""
echo "Session ID: $SESSION_ID"
echo "Checkout URL: $CHECKOUT_URL"
echo ""
echo -e "${YELLOW}🎉 All tests passed!${NC}"
echo ""
echo "📌 Next steps:"
echo "1. Visit the checkout URL to complete payment"
echo "2. Use test card: 4242 4242 4242 4242"
echo "3. After payment, you'll be redirected to: $FRONTEND_URL/checkout/success"
echo ""
echo "🔗 Stripe Checkout URL:"
echo "$CHECKOUT_URL"
