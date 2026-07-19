# AOI Quality Intelligence Portal for SMT - Memory File

## Project Overview
A production-ready web application for an SMT factory to automatically collect inspection data from Parmi AOI and SPI machines, store it, and provide real-time dashboards, analytics, and reports.

## Tech Stack
*   **Frontend:** React, Vite, Material UI (MUI), Recharts, Socket.IO Client (Port 3030)
*   **Backend:** Node.js, Express, Socket.IO, tsx (Port 5050)
*   **Database:** PostgreSQL, Prisma ORM
*   **Authentication:** JWT with Role-Based Access Control (RBAC)

## User Roles
1.  Technician
2.  Engineer
3.  Manager
4.  Admin
5.  Super Admin

## Key Modules
1.  **Dashboard:** Real-time production metrics (Yield, Pass/NG, Machine Status, etc.)
2.  **File Integration:** Automated watcher for network folder to import CSV/XML/TXT/RST from AOI/SPI machines. Features duplicate prevention, merging by time, archiving, and error handling.
3.  **Barcode History:** Detailed tracking of specific barcodes across machines and time.
4.  **Defect History:** Detailed logging of component defects, images, and repair status.
5.  **Defect Search:** Granular search capabilities.
6.  **Reports:** Yield, pareto, top defects, and exports (Excel/PDF).
7.  **Analytics:** Trends, heat maps, and performance metrics.
8.  **Notifications:** Alerts for yield drops, NG limits, machine disconnects, etc.

## Development Roadmap (Status)
1.  [x] Complete system architecture - Designed and approved.
2.  [x] Database schema - Designed and pushed via Prisma to `smt_aoi_portal`.
3.  [x] Folder structure - Frontend and Backend segregated.
4.  [x] Backend APIs - Base Auth logic, Socket.IO setup, Prisma Client instantiated.
5.  [x] Frontend pages - Vite scaffolded, Login page integrated using reference UI style.
6.  [x] File watcher service - Tested successfully. Parses `.rst` and `.xml` and moves to Archive.
7.  [ ] Dashboard implementation
8.  [ ] Testing
9.  [ ] Deployment guide

## Open Notes
*   Login credentials hardcoded to admin/admin temporarily until DB seeding.
*   Prisma version set to 5.13.0 for stability.
*   Git initialized and pushed to remote repository.
