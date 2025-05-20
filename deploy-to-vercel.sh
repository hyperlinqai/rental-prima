#!/bin/bash

# Deployment script for Rental Prima Super Admin Dashboard to Vercel

echo "===== Rental Prima Vercel Deployment Script ====="
echo "This script will help deploy your application to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Function to deploy a project
deploy_project() {
    local project_dir=$1
    local project_name=$2
    
    echo ""
    echo "===== Deploying $project_name ====="
    
    cd "$project_dir" || exit
    
    # Check if the project has been deployed before
    if [ -f ".vercel/project.json" ]; then
        echo "$project_name has been deployed before. Redeploying..."
        vercel --prod
    else
        echo "First time deploying $project_name..."
        vercel --prod
    fi
    
    echo "$project_name deployment completed."
    echo ""
}

# Main deployment process
echo "Starting deployment process..."

# 1. Deploy Backend
echo "Preparing to deploy backend..."
deploy_project "/Users/shoaibkhan/Desktop/Backup-Drvie/01 - PROJECTS/Custom/Rental Prima/rental-prima-backend/backend" "Backend"

# Get the backend URL
echo "Please enter the deployed backend URL (e.g., https://rental-prima-backend.vercel.app):"
read backend_url

# 2. Update frontend environment with backend URL
echo "Updating frontend environment configuration..."
cat > "/Users/shoaibkhan/Desktop/Backup-Drvie/01 - PROJECTS/Custom/Rental Prima/rental-prima-backend/frontend/public/env-config.js" << EOF
window._env_ = {
  REACT_APP_API_URL: "$backend_url",
  REACT_APP_SUPABASE_URL: "https://iqctarumnxsxyqkzxfkz.supabase.co",
  REACT_APP_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc",
  REACT_APP_BUILD_TIME: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
};
EOF

# 3. Deploy Frontend
echo "Preparing to deploy frontend..."
deploy_project "/Users/shoaibkhan/Desktop/Backup-Drvie/01 - PROJECTS/Custom/Rental Prima/rental-prima-backend/frontend" "Frontend"

echo ""
echo "===== Deployment Complete ====="
echo "Backend: $backend_url"
echo "Please note the frontend URL from the deployment output above."
echo ""
echo "You can access your dashboard using:"
echo "Email: admin@gmail.com"
echo "Password: password123"
echo ""
echo "Thank you for using the Rental Prima Vercel Deployment Script!"
