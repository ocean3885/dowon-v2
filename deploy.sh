#!/bin/bash

# Configuration
# Replace these with your actual server details
SERVER_IP="1.234.44.174"
REMOTE_USER="root" # CAUTION: Change this to your actual server username
REMOTE_DIR="/var/www/dowon-v2" # CAUTION: Change this to your actual project path on the server

echo "Deploying to $SERVER_IP..."

ssh $REMOTE_USER@$SERVER_IP << EOF
  cd $REMOTE_DIR
  
  echo "Pulling latest changes..."
  git pull origin main
  
  echo "Installing dependencies..."
  npm install
  
  echo "Building application..."
  npm run build
  
  echo "Reloading PM2 process..."
  # Failsafe: start if not running, reload if running
  pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
  
  echo "Deployment complete!"
EOF
