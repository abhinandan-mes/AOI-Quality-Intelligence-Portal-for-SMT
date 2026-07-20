# Deployment Guide - AOI Quality Intelligence Portal

This guide outlines the steps to deploy the portal in a production SMT factory environment.

## 1. Prerequisites
- **Server:** Windows Server or Linux (Ubuntu recommended for Node.js/Postgres).
- **Node.js:** v20 LTS or higher installed.
- **Database:** PostgreSQL v14 or higher installed and running.
- **Network:** The server must have read/write access to the network shared folder where the AOI/SPI machines export their `.rst` and `.xml` files.

## 2. Database Setup
1. Log into your PostgreSQL instance: `psql -U postgres`
2. Create the production database: `CREATE DATABASE smt_aoi_portal;`
3. Update the `.env` file in the `backend/` directory with the correct production credentials.
   ```env
   PORT=5050
   JWT_SECRET=your_secure_production_secret
   DATABASE_URL="postgresql://postgres:root@localhost:5432/smt_aoi_portal?schema=public"
   ```
4. Run Prisma schema synchronization:
   ```bash
   cd backend
   npx prisma db push
   ```

## 3. Backend Deployment (PM2)
We recommend using **PM2** to run the backend as a background daemon that restarts automatically on crash or server reboot.

1. Install PM2 globally: `npm install -g pm2`
2. Compile the backend TypeScript code:
   ```bash
   cd backend
   npx tsc
   ```
3. Start the backend with PM2:
   ```bash
   pm2 start build/server.js --name "aoi-backend"
   pm2 save
   pm2 startup
   ```

## 4. File Watcher Configuration
Ensure the `WATCH_DIR` in `backend/src/services/fileWatcher.ts` is pointed to the absolute path of the mapped network drive or shared folder where the machines export data.

## 5. Frontend Deployment (Nginx / IIS)
The frontend should be built into static files and served using a web server like Nginx or IIS for optimal performance.

1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```
2. The `dist/` folder will be created. Copy the contents of this folder to your web server's root directory (e.g., `/var/www/html` for Nginx, or `C:\inetpub\wwwroot` for IIS).
3. **Important:** Because it's a Single Page Application (SPA), configure your web server to redirect all 404 requests back to `index.html`.

### Nginx Example Configuration
```nginx
server {
    listen 3030;
    server_name your_server_ip;

    root /var/www/html/aoi-portal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 6. Accessing the Portal
Once both the backend (Port 5050) and frontend (Port 3030) are running, Technicians, Engineers, and Managers can access the portal via their web browsers at:
`http://<SERVER_IP>:3030`
