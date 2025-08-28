#!/bin/bash

# Token Management API Test Script
# Make sure to set ADMIN_KEY environment variable before running

if [ -z "$ADMIN_KEY" ]; then
    echo "❌ Error: ADMIN_KEY environment variable not set"
    echo "Usage: ADMIN_KEY=your-secret npm run dev && ADMIN_KEY=your-secret ./test-tokens.sh"
    exit 1
fi

BASE_URL="http://localhost:3000/api"
STREAM_ID="rollup"

echo "🔗 Testing Token Management API"
echo "================================"

# Test 1: List existing tokens
echo "1. 📋 List existing tokens:"
curl -s "$BASE_URL/tokens?streamId=$STREAM_ID" | jq '.'
echo -e "\n"

# Test 2: Add Base USDC token
echo "2. ➕ Add Base USDC token:"
curl -s -X POST "$BASE_URL/tokens" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "streamId": "'$STREAM_ID'",
    "chain": "base", 
    "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }' | jq '.'
echo -e "\n"

# Test 3: List tokens again to see the addition
echo "3. 📋 List tokens after addition:"
TOKENS_RESPONSE=$(curl -s "$BASE_URL/tokens?streamId=$STREAM_ID")
echo "$TOKENS_RESPONSE" | jq '.'
echo -e "\n"

# Test 4: Update a token (disable it)
echo "4. ✏️ Update token (disable first token):"
TOKEN_ID=$(echo "$TOKENS_RESPONSE" | jq -r '.tokens[0].id')
if [ "$TOKEN_ID" != "null" ] && [ "$TOKEN_ID" != "" ]; then
    curl -s -X PUT "$BASE_URL/tokens/$TOKEN_ID" \
      -H "Content-Type: application/json" \
      -H "x-admin-key: $ADMIN_KEY" \
      -d '{
        "streamId": "'$STREAM_ID'",
        "enabled": false
      }' | jq '.'
else
    echo "No token found to update"
fi
echo -e "\n"

# Test 5: List tokens to see the update
echo "5. 📋 List tokens after update:"
curl -s "$BASE_URL/tokens?streamId=$STREAM_ID" | jq '.'
echo -e "\n"

# Test 6: Try to add an invalid token (should fail)
echo "6. ❌ Try to add invalid token (should fail):"
curl -s -X POST "$BASE_URL/tokens" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "streamId": "'$STREAM_ID'",
    "chain": "base",
    "address": "0x1234567890123456789012345678901234567890"
  }' | jq '.'
echo -e "\n"

# Test 7: Try without admin key (should fail)
echo "7. 🔒 Try to add token without admin key (should fail):"
curl -s -X POST "$BASE_URL/tokens" \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "'$STREAM_ID'",
    "chain": "base",
    "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }' | jq '.'
echo -e "\n"

echo "✅ Token Management API testing complete!"