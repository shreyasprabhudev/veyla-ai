#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# ALB DNS from your configuration
ALB_DNS="veylas-veyla-yyctby78qlys-933365446.us-east-2.elb.amazonaws.com"
APP_DOMAIN="app.veylaai.com"

echo "🔍 Testing routing after Supabase redirect removal..."

# Test with different User-Agents
echo -e "\n${GREEN}Testing with different User-Agents:${NC}"

# Chrome
echo "Testing with Chrome User-Agent..."
curl -s -I -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "https://$APP_DOMAIN/dashboard"

# Safari
echo -e "\nTesting with Safari User-Agent..."
curl -s -I -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15" \
  "https://$APP_DOMAIN/dashboard"

# Test health endpoint
echo -e "\n${GREEN}Testing health endpoint:${NC}"
curl -s -I "https://$APP_DOMAIN/dashboard/api/health"

# Test with cache-busting
echo -e "\n${GREEN}Testing with cache-busting:${NC}"
curl -s -I "https://$APP_DOMAIN/dashboard?t=$(date +%s)"
