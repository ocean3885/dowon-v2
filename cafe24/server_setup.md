# Server Setup Guide for dowon.ai.kr

Since your server (`1.234.44.174`) already hosts other services, follow these steps to add `dowon.ai.kr` safely.

## 1. Check Port Availability
We plan to use port **3000**. Check if it's free:
```bash
sudo lsof -i :3000
```
- **If empty**: Safe to proceed.
- **If occupied**: You must change the port in `package.json` (start script), `ecosystem.config.js`, and `cafe24/dowon.ai.kr.conf` (e.g., to 3001).

## 2. Nginx Configuration
Use `sudo` for these commands.

1.  **Copy the config file**:
    ```bash
    # Assuming you are in the project root on the server
    sudo cp cafe24/dowon.ai.kr.conf /etc/nginx/sites-available/
    ```

2.  **Enable the site (Symlink)**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/dowon.ai.kr.conf /etc/nginx/sites-enabled/
    ```

3.  **Test Nginx Config**:
    ```bash
    sudo nginx -t
    ```
    *If this fails, do NOT proceed. Check the error message.*

4.  **Reload Nginx**:
    ```bash
    sudo systemctl reload nginx
    ```

## 3. SSL Setup (HTTPS)
Use Certbot to automatically set up HTTPS.

```bash
sudo certbot --nginx -d dowon.ai.kr
```
- Select "2" to Redirect HTTP to HTTPS if asked.

## 4. Troubleshooting
- **502 Bad Gateway**: This means Nginx is running but your Next.js app is NOT running on port 3000. Check:
  ```bash
  pm2 status
  pm2 logs dowon-v2
  ```
