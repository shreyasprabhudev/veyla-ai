#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Veyla AI deployment..."

# Set AWS Region
export AWS_DEFAULT_REGION=us-east-2

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Build and deploy landing page
echo "📦 Building landing page..."
cd packages/landing
npm run build

# Build dashboard
echo "📦 Building dashboard..."
cd ../dashboard
npm run build

# Deploy infrastructure
echo "🏗️ Deploying infrastructure..."
cd ../../infrastructure

# Install CDK if not present
if ! command -v cdk &> /dev/null; then
    echo "📦 Installing AWS CDK..."
    npm install -g aws-cdk
fi

# Bootstrap CDK if not already done
echo "🔧 Bootstrapping CDK..."
cdk bootstrap

# Deploy stack
echo "🚀 Deploying stack..."
cdk deploy --require-approval never

echo "✅ Deployment complete!"
echo "🌐 Please check the AWS Console for your application URLs"
echo "⚠️  Note: DNS propagation may take up to 48 hours"
