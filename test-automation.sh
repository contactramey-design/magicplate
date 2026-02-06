#!/bin/bash
# Quick test script for the automation endpoint

echo "🧪 Testing automation endpoint..."
echo ""

# Try to get the Vercel URL from vercel.json or use default
DOMAIN="magicplate.info"

echo "📍 Testing: https://${DOMAIN}/api/run-automation"
echo ""

curl -X GET "https://${DOMAIN}/api/run-automation" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X GET "https://${DOMAIN}/api/run-automation" -s

echo ""
echo "✅ Check the output above for results!"
