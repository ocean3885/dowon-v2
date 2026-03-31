#!/bin/bash

# Configuration
# Replace these with your actual server details
SERVER_IP="1.234.44.174"
REMOTE_USER="root" # CAUTION: Change this to your actual server username
REMOTE_DIR="/var/www/dowon-v2" # CAUTION: Change this to your actual project path on the server

echo "Deploying to $SERVER_IP..."

ssh $REMOTE_USER@$SERVER_IP << EOF
  # Load environment to ensure npm/node/pm2 are found
  export NVM_DIR="\$HOME/.nvm"
  [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
  source ~/.bashrc 2>/dev/null
  source ~/.profile 2>/dev/null
  
  cd $REMOTE_DIR
  
  echo "Pulling latest changes..."
  git stash
  git pull origin main
  
  echo "Installing dependencies..."
  npm install
  
  echo "Building application..."
  npm run build
  
  echo "Setting file permissions..."
  # Directories: rwxr-xr-x, Files: rw-r--r--
  find $REMOTE_DIR -type d -exec chmod 755 {} \;
  find $REMOTE_DIR -type f -exec chmod 644 {} \;
  # Shell scripts: rwxr-x--- (owner+group execute only)
  find $REMOTE_DIR -name "*.sh" -exec chmod 750 {} \;
  # Env files: rw------- (owner read/write only)
  [ -f "$REMOTE_DIR/.env" ]       && chmod 600 $REMOTE_DIR/.env
  [ -f "$REMOTE_DIR/.env.local" ] && chmod 600 $REMOTE_DIR/.env.local
  # SQLite DB files: rw-r----- (owner+group read)
  find $REMOTE_DIR -name "*.db" -exec chmod 640 {} \;
  find $REMOTE_DIR -name "*.sqlite" -exec chmod 640 {} \;

  echo "Reloading PM2 process..."
  # Failsafe: start if not running, reload if running
  pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
  
  echo "Deployment complete!"
EOF
