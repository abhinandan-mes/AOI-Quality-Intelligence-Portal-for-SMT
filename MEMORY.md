# AOI Quality Intelligence Portal for SMT - Memory File

## Project Overview
A production-ready web application for an SMT factory to automatically collect inspection data from Parmi AOI and SPI machines, store it, and provide real-time dashboards, analytics, and reports.

## Tech Stack
*   **Frontend:** React, Vite, Vanilla CSS (Replaced MUI), Recharts, Socket.IO Client
*   **Backend:** Node.js, Express, Socket.IO, tsx (Port 5050), Windows Service (pm2/node-windows)
*   **Database:** PostgreSQL, Prisma ORM
*   **Authentication:** JWT with Role-Based Access Control (RBAC)

## User Roles (Updated)
1.  **INSPECTOR** (Replaced Engineer/Technician)
2.  **MANAGER**
3.  **ADMIN**
4.  **SUPER_ADMIN**

## Key UI / UX Standards (Corporate Guidelines)
1.  **Premium Typography:** Headings use gradient text (`.premium-heading-gradient`) from dark blue (`#0b1a30`) to bright blue (`#415fff`). Font weights are kept around 600-700 (not 800) to ensure a clean, modern look.
2.  **Unified Layout:** The application features a solid `#415fff` top header (with white Vivo logo, live clock, user pill) and a left-aligned vertical sidebar (`230px` width) for navigation. 
3.  **Responsiveness:** The layout is fully responsive. On tablets/laptops, the sidebar scales down to 200px. On mobile (`< 768px`), the sidebar converts into a horizontal scrollable menu beneath the top header, and grids automatically collapse to 2-column or 1-column layouts.
4.  **Status Colors:** 
    - `PASS` / `GOOD` -> Green (`#10b981`)
    - `FAIL` / `NG` -> Red (`#ef4444`)
    - `WARNING` -> Orange (`#f59e0b`)
    - Default / Informational -> Blue (`#3b82f6`) or Gray (`#64748b`)
5.  **Tables:** Use the `.vivo-table` class. Table headers (`th`) must be light gray (`#f8fafc`) with a bottom border (`2px solid #e2e8f0`) and dark gray text (`#64748b`). Avoid heavy colored pill shapes for table headers.
6.  **Pop-ups and Notifications:** Do NOT use default browser `alert()` or `confirm()`. Implement custom unified HTML/CSS floating Toasts (top-right, `z-index: 9999`) or Modals that adhere to the corporate color palette.

## Key Modules
1.  **Dashboard:** Real-time production metrics (Yield, Pass/NG, Machine Status, etc.)
2.  **File Integration:** Automated watcher (`chokidar`) for network folder to import CSV/XML/TXT/RST from AOI/SPI machines. Features an **asynchronous queue mechanism** to prevent Node.js event loop starvation when processing thousands of files concurrently. Features duplicate prevention, merging by time, archiving, and error handling.
3.  **Line Management:** Configuration of physical lines and mapping to AOI/SPI network drop paths.
4.  **User Management:** Centralized hub for managing users, Access Control Matrix (Role Permissions), and system Activity Logs.
5.  **Barcode History:** Detailed tracking of specific barcodes across machines and time, with comprehensive export options (CSV, Excel, Word, PDF).

## Development Roadmap (Status)
1.  [x] Complete system architecture - Designed and approved.
2.  [x] Database schema - Designed and pushed via Prisma to `smt_aoi_portal`.
3.  [x] Backend APIs - Base Auth logic, Socket.IO setup, Prisma Client instantiated.
4.  [x] Frontend pages - Vite scaffolded, Login page integrated. Entire frontend migrated to Vanilla CSS.
5.  [x] File watcher service - Tested successfully. Parses `.rst` and `.xml` and moves to Archive. Added concurrency queuing to prevent event loop blocking.
6.  [x] Dashboard implementation - Live production metrics, properly mapped yield colors, responsive layout.
7.  [x] Barcode History implementation - Search with nested machine/defect JSON handling in Vanilla CSS.
8.  [x] Line & User Management UI/UX - Match corporate standards, added modal forms, accurate activity logging (logout tracking, performer tracking), Super Admin constraints, and IPv4 sanitization.
9.  [ ] Comprehensive Testing
10. [ ] Deployment guide

## Open Notes
*   Login credentials hardcoded to admin/admin temporarily until DB seeding.
*   Backend service runs via `aoiqualityintelligenceportalbackend.exe` (installed via `install_service.js`).
*   Prisma version set to 5.13.0 for stability.
