# Employee Attendance Platform

This monorepo contains:

- `apps/web`: Next.js backend API only
- `apps/windows_client`: Flutter Windows frontend (employee + admin workflows)
- `packages/contracts`: Shared DTO/type contracts
- `infra/docker-compose.yml`: Local MongoDB stack

## Core Features

- Email login with JWT access/refresh token flow
- Casbin RBAC for admin/API authorization
- MongoDB persistence for users, roles, attendance, and audit logs
- Seeded admin account:
  - Email: `admin@euroasianngroup.com`
  - Password: `Admin123!`
- Employee attendance clock-in/clock-out with:
  - face verification
  - IP-based location enrichment
  - device metadata tracking
- Admin capabilities in Flutter:
  - create roles with permissions
  - create users for Windows app login
  - view attendance events
  - enroll face templates

## Quick Start

1. Start MongoDB:
   - `docker compose -f infra/docker-compose.yml up -d`
2. Install web dependencies:
   - `npm install --workspace apps/web`
3. Start web app:
   - `npm run dev:web`
4. Seed admin user (if needed):
   - `npm --workspace apps/web run seed`
5. Run Flutter client:
   - `cd apps/windows_client`
   - `flutter pub get`
   - `flutter run -d windows --dart-define=API_BASE_URL=http://localhost:3000/api`
