#!/bin/bash

# cPanel Deployment Script
# Usage: ./deploy-to-cpanel.sh

echo "🚀 Starting cPanel Deployment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: frontend or backend folder not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Step 1: Build Frontend
echo -e "${YELLOW}📦 Step 1: Building Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build successful!${NC}"
echo ""

# Step 2: Prepare Backend
cd ../backend
echo -e "${YELLOW}📦 Step 2: Preparing Backend...${NC}"

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from env.example...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env.production
        echo -e "${YELLOW}⚠️  Please update .env.production with your cPanel credentials!${NC}"
    fi
fi

echo -e "${GREEN}✅ Backend prepared!${NC}"
echo ""

# Step 3: Create deployment package
cd ..
echo -e "${YELLOW}📦 Step 3: Creating deployment package...${NC}"

DEPLOY_DIR="deploy-package-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy frontend build
echo "Copying frontend build..."
cp -r frontend/build "$DEPLOY_DIR/frontend-build"

# Copy backend (excluding node_modules and .env)
echo "Copying backend files..."
mkdir -p "$DEPLOY_DIR/backend"
rsync -av --exclude='node_modules' \
          --exclude='.env' \
          --exclude='.git' \
          --exclude='*.log' \
          --exclude='uploads/*' \
          backend/ "$DEPLOY_DIR/backend/"

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt" << EOF
cPanel Deployment Instructions
==============================

1. FRONTEND:
   - Upload all files from 'frontend-build' folder to:
     public_html/ (or your domain folder)
   - Make sure .htaccess file is included

2. BACKEND:
   - Upload all files from 'backend' folder to:
     ~/backend/ (or your backend folder)
   - DO NOT upload node_modules
   - DO NOT overwrite existing .env file
   - DO NOT overwrite existing uploads folder

3. ON CPANEL:
   - SSH/Terminal: cd ~/backend && npm install --production
   - Update .env file with your cPanel database credentials
   - Restart Node.js application in cPanel Node.js Selector

4. CHECK:
   - Visit: https://yourdomain.com/api/health
   - Should return: {"success":true,"message":"Keyhost Homes API is running"}

⚠️  IMPORTANT: Backup your database before deploying!
EOF

echo -e "${GREEN}✅ Deployment package created: $DEPLOY_DIR${NC}"
echo ""
echo -e "${GREEN}📋 Next Steps:${NC}"
echo "1. Upload '$DEPLOY_DIR' folder to your cPanel"
echo "2. Follow instructions in DEPLOY_INSTRUCTIONS.txt"
echo "3. Don't forget to backup your database first!"
echo ""
echo -e "${YELLOW}⚠️  Remember:${NC}"
echo "- Keep existing database (don't overwrite)"
echo "- Keep existing uploads folder (property images)"
echo "- Update .env file with cPanel credentials"
echo ""

