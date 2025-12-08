#!/bin/bash

# Configuration
SERVER_IP="1.234.44.174"
REMOTE_USER="root"
REMOTE_DIR="/var/www/dowon-v2"

# Warning Prompt
echo "========================================================"
echo "WARNING: DESTRUCTIVE ACTION"
echo "========================================================"
echo "This script will FORCE UPLOAD your local 'dowon.db' to:"
echo "  $REMOTE_USER@$SERVER_IP:$REMOTE_DIR"
echo ""
echo "!!! THE REMOTE DATABASE WILL BE OVERWRITTEN !!!"
echo "Any new posts or data created exclusively on the production server will be LOST."
echo "========================================================"
read -p "Are you absolutely sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Uploading dowon.db..."
# Use ../dowon.db because this script is inside cafe24/
scp ../dowon.db $REMOTE_USER@$SERVER_IP:$REMOTE_DIR/dowon.db

if [ $? -eq 0 ]; then
    echo "Upload successful."
    echo "Reloading application to pick up changes..."
    
    # Reload PM2 to refresh connection pool/cache
    ssh $REMOTE_USER@$SERVER_IP "export NVM_DIR=\"\$HOME/.nvm\"; [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"; source ~/.bashrc 2>/dev/null; cd $REMOTE_DIR && pm2 reload ecosystem.config.js --env production"
    
    echo "Done."
else
    echo "Upload failed."
    exit 1
fi
