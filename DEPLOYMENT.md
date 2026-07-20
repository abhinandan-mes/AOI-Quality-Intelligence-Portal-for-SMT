# Deployment Guide - AOI Quality Intelligence Portal

This guide outlines the steps to deploy the portal in a production SMT factory environment, specifically optimized for Windows and IIS.

## 1. Prerequisites
- **Server:** Windows Server.
- **Node.js:** v20 LTS or higher installed.
- **Database:** PostgreSQL v14 or higher installed and running.
- **Network:** The server must have read/write access to the network shared folder where the AOI/SPI machines export their `.rst` and `.xml` files.
- **IIS:** Internet Information Services enabled on the Windows Server.

## 2. Database Setup
1. Log into your PostgreSQL instance via pgAdmin or psql:
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

## 3. Backend Deployment (Windows Service)
To ensure the backend runs continuously and starts automatically when the Windows Server reboots, we will install it as a Windows Service using `node-windows`.

1. Compile the backend TypeScript code:
   ```bash
   cd backend
   npx tsc
   ```
2. Install the Windows Service:
   Open an Administrator Command Prompt or PowerShell, navigate to the backend folder, and run:
   ```bash
   node install_service.js
   ```
3. A Windows prompt may appear asking for administrative privileges to install the daemon. Click **Yes**.
4. The service will be installed as **"AOI Quality Intelligence Portal Backend"** and started immediately. You can view, start, or stop it anytime using the standard `services.msc` Windows tool.
*(Note: If you ever need to uninstall the service, run `node uninstall_service.js`).*

## 4. File Watcher Configuration
Ensure the `WATCH_DIR` in `backend/src/services/fileWatcher.ts` is pointed to the absolute path of the mapped network drive or shared folder where the machines export data. If you change this path, remember to run `npx tsc` and restart the Windows Service.

## 5. Frontend Deployment (IIS)
The frontend should be built into static files and served using IIS.

1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```
2. The `dist/` folder will be created. Copy the contents of this folder to your IIS web root directory (e.g., `C:\inetpub\wwwroot`).
3. **URL Rewrite Module:** Because it's a React Single Page Application (SPA), you must install the **URL Rewrite Module** for IIS.
4. Create a `web.config` file in the root of your IIS site (`C:\inetpub\wwwroot`) to route all traffic to `index.html`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## 6. Accessing the Portal
Once both the backend Windows Service and the IIS frontend are running, users can access the portal via their web browsers at:
`http://<SERVER_IP>:3030` (or whatever port IIS is configured to use).
