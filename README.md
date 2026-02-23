# Employee Attendance Platform

This monorepo contains:

- `apps/web`: Next.js backend API only
- `apps/windows_client`: Flutter Windows frontend (employee + admin workflows)
- `packages/contracts`: Shared DTO/type contracts
- `services/lbph-face`: Optional LBPH face recognition HTTP service (see below)
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

## Face verification (LBPH)

Login and clock-in/clock-out use **face verification** via **Flutter → Next.js → LBPH service**:

1. **Run the LBPH service** (see [services/lbph-face/README.md](services/lbph-face/README.md)): create `face_data.pkl` and `lbph_model.yml` with [face-attendance-system](https://huggingface.co/abi-0165/face-attendance-system) `register_face.py`, then `uvicorn app:app --port 8000` in `services/lbph-face`.
2. **Set `LBPH_FACE_SERVICE_URL`** in `apps/web/.env.local` (e.g. `http://localhost:8000`).
3. When registering a face in `register_face.py`, use the **same ID as the user’s employee code** (profile in the app) so verification can match.
