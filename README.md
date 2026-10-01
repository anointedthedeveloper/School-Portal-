# School Academic Portal

A reusable, white-label **School Examination & Academic Portal** foundation:

> School administration → Teachers → Classes → Subjects → Exams → CBT → CA scores → Results → Termly reports

This repository is **Phase 1: the architecture and foundation**. Authentication, roles, permissions, school
settings (white-label), layouts, dashboards, the data model, the seed system, the security middleware and the
CBT integration scaffold are real and tested. Academic modules (students, exams, results…) are intentionally
*not* faked: their routes exist, are already auth-protected, and answer `501 Not Implemented` / show a
"coming in a later phase" state until their phase is built.

## 1. Architecture

```
Browser
   │
   ▼
frontend/  React + TypeScript + Vite + Tailwind
   │  HTTPS REST API (JSON)
   ▼
backend/   Express + TypeScript
   │  Routes → Controllers → Services → Models
   ▼
MongoDB (Mongoose)

CBT Exam Box ── secure REST (client id + secret) ──► backend /api/integration/cbt ──► MongoDB
```

`frontend/` and `backend/` are two independent npm workspaces. The frontend never talks to MongoDB, holds no
server secrets, and contains no business rules; the backend never serves UI.

**Backend layering:** routes declare middleware + validation → controllers are thin (parse request, call a
service, shape the response) → services hold all business logic → Mongoose models own persistence.

## 2. Folder structure

```
school-academic-portal/
├── package.json              # npm workspaces + root scripts
├── backend/
│   ├── .env.example
│   ├── API.md                # API reference
│   └── src/
│       ├── config/           # environment (validated), database, permissions, default school identity
│       ├── controllers/      # thin HTTP adapters
│       ├── middleware/       # auth, role/permission, validation, sanitize, rate limit, CBT auth, errors
│       ├── models/           # all 21 Mongoose models
│       ├── routes/           # one router per API namespace (+ placeholder router for later phases)
│       ├── services/         # business logic (auth, tokens, audit, school config, dashboard, users, CBT)
│       ├── validators/       # zod request schemas
│       ├── seeds/            # development seed
│       ├── types/ utils/
│       ├── app.ts            # express app factory
│       └── server.ts         # bootstrap + graceful shutdown
└── frontend/
    ├── .env.example          # browser-safe values only
    └── src/
        ├── components/{common,forms,tables,charts,layout}
        ├── config/ contexts/ hooks/ services/ types/ utils/
        ├── layouts/{AdminLayout,TeacherLayout,StudentLayout}
        ├── pages/{auth,admin,teacher,student}
        └── routes/           # ProtectedRoute, RoleProtectedRoute, route table
```

## 3. Prerequisites

* Node.js 20+ (developed on 22) and npm 10+
* MongoDB 6+ — local install, Docker, or MongoDB Atlas

## 4. Quick start

```bash
# 1. install everything (both workspaces)
npm install

# 2. MongoDB (pick one)
docker run -d --name school-mongo -p 27017:27017 mongo:7        # local via Docker
# ...or use an Atlas connection string in MONGODB_URI

# 3. configure the backend
cp backend/.env.example backend/.env
#    generate two different secrets and paste them into JWT_SECRET / JWT_REFRESH_SECRET:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 4. configure the frontend
cp frontend/.env.example frontend/.env

# 5. load development data
npm run seed

# 6. run both apps
npm run dev          # backend :5000, frontend :5173
```

Open http://localhost:5173 (use `localhost`, not `127.0.0.1`: the API's CORS allow-list is `CLIENT_URL`).

### Development credentials (seed only, NOT for production)

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | `admin@example.com`        | `change-me` |
| Teacher | `teacher1@example.com` … `teacher3@example.com` | `change-me` |
| Student | `student1@example.com` … `student8@example.com` | `change-me` |

Set `SEED_PASSWORD` in `backend/.env` to use a different development password. The seed refuses to run when
`NODE_ENV=production`. It also creates a `cbt-exam-box` integration client and prints its generated secret
**once** (or uses `CBT_API_KEY` if you set it).

## 5. Commands

| Command                | What it does                                              |
|------------------------|-----------------------------------------------------------|
| `npm run dev`          | Start backend and frontend together                       |
| `npm run dev:backend`  | Backend only (tsx watch)                                  |
| `npm run dev:frontend` | Frontend only (Vite)                                      |
| `npm run build`        | Production build of backend (`dist/`) and frontend        |
| `npm run typecheck`    | `tsc --noEmit` in both workspaces                         |
| `npm run seed`         | Create missing development data (idempotent)              |
| `npm run seed:reset`   | Wipe all collections, then seed                           |
| `npm run start -w backend` | Run the compiled backend (after `npm run build`)      |

## 6. Environment variables

**`backend/.env`** (never commit; validated at boot, the server exits with a clear message if invalid)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `test` / `production` |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs access tokens (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (≥ 32 chars, different from above) |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (default `15m` / `7d`) |
| `CLIENT_URL` | Comma-separated browser origins allowed by CORS |
| `COOKIE_SAME_SITE` | `lax` (default), `strict`, or `none` (needs HTTPS; for cross-site hosting) |
| `CBT_API_KEY` | Optional: secret used by the seed for the CBT client |
| `SEED_PASSWORD` | Optional: dev seed password |
| `LOG_LEVEL` | pino log level |

**`frontend/.env`** — only `VITE_API_URL`. Anything `VITE_*` is embedded in the public bundle, so no secret
may ever be placed there.

## 7. White-label school configuration

Nothing school-specific is in the code. A single `SchoolSettings` document in MongoDB (created on first boot
from `backend/src/config/schoolConfig.ts`, default identity `[School Name]`) holds: name, short name, logo,
favicon, contacts, primary/secondary colour, current session/term, grading system, report, exam and CBT
settings.

* `GET /api/settings/public` (no auth) feeds the login screen and theming.
* The frontend loads it once (`SchoolSettingsContext`), then sets the document title, favicon and brand colour
  CSS variables. Components use `useSchoolSettings()` — never literals.
* Admins edit it at **Admin → School Settings** (`PUT /api/settings`, `settings.update` permission).

To deploy for a new school: deploy the same build with a fresh database and edit the settings.

## 8. Authentication architecture

* `POST /api/auth/login` returns a short-lived **access JWT** (response body, kept in memory by the SPA — never
  in `localStorage`) and sets a long-lived **refresh token** as an `httpOnly`, `SameSite` cookie scoped to
  `/api/auth`.
* Refresh tokens are stored **hashed** and **rotated** on every use. Presenting an already-used token revokes
  all of that user's refresh tokens (theft detection). Logout revokes the token server-side.
* Access tokens carry only the user id. On **every request** the backend reloads the user from MongoDB and
  checks status and role, so a suspended user or a changed role takes effect immediately. A role claimed by
  the client is never trusted.
* Passwords are hashed with bcrypt (cost 12). Unknown-email logins take the same time as wrong-password ones.
* Login/refresh are rate-limited more strictly than the rest of the API.
* Frontend: `AuthContext` (session restore via refresh cookie, single-flight refresh), `ProtectedRoute`,
  `RoleProtectedRoute`. These are UX only — every API call is independently authorized.

## 9. Role & permission system

Roles: `ADMIN`, `TEACHER`, `STUDENT`. Permissions follow `resource.action` (`students.read`, `exams.publish`,
`results.publish`, `settings.update`, …) and are defined in `backend/src/config/permissions.ts`, which maps each
role to a default set. `User.extraPermissions` allows per-user grants later without route changes.
Routes declare what they need: `requirePermission('settings.update')`. Teachers and students have separate
layouts and navigation (not the admin menu with items hidden), and the API denies them anyway (verified: a
teacher token gets `403` on admin endpoints).

## 10. CBT Exam Box integration architecture

Namespace: `/api/integration/cbt` — `authenticate`, `exams`, `exams/:examId`, `exams/:examId/start`,
`exams/:examId/submit`, `results/:studentId`.

* CBT clients authenticate with `X-CBT-Client-Id` + `X-CBT-Client-Secret` headers, checked against the
  `CBTIntegration` collection (secret stored as a bcrypt hash). **User/admin JWTs are rejected here.**
* Each integration has a status, an `allowedOperations` list, a per-client rate limit, and `lastUsedAt`.
* Phase 1 implements authentication, operation gating, rate limiting and auditing; `POST /authenticate`
  works. The data endpoints return `501` until Phase 6.

## 11. Data model

All schemas exist now so later phases need no restructuring: `User`, `Student`, `Teacher`, `Class`, `Subject`,
`TeacherAssignment`, `AcademicSession`, `Term`, `Exam`, `Question`, `QuestionBank`, `ExamAttempt`,
`ExamResult`, `Assessment`, `CAScore`, `TermResult`, `GradeRule`, `SchoolSettings`, `AuditLog`,
`CBTIntegration`, plus `RefreshToken`. Relationships use `ObjectId` refs (Student→Class, TeacherAssignment→
Teacher/Class/Subject, Exam→Class/Subject/Teacher/Questions, …) with compound/unique indexes on the common
query paths. `Question.correctAnswer` is `select: false` so it cannot leak by accident.

## 12. Security foundation

Helmet · CORS allow-list · rate limiting (global, auth, per-CBT-client) · zod validation on every input ·
rejection of `$`/`.`/`__proto__` keys plus Mongoose `sanitizeFilter` (NoSQL injection) · 1 MB body limit ·
centralised error handling that never returns stacks or DB internals in production · audit logging
(`LOGIN`, `LOGIN_FAILED`, `USER_CREATED`, `SETTINGS_UPDATED`, `CBT_AUTHENTICATED`, …) · env validation at boot.

Operational note: server-built Mongo operators (`$in`, `$exists`) must be wrapped in `mongoose.trusted(...)`
because `sanitizeFilter` is enabled globally.

## 13. API

See [`backend/API.md`](backend/API.md). Unversioned prefix `/api` (chosen deliberately; add `/api/v2` later if
a breaking change is ever needed). Every response is `{ success, message, data }` or
`{ success: false, message, code, errors? }`.

## 14. Deployment notes

* Build: `npm run build`. Run the API with `node backend/dist/server.js` (`NODE_ENV=production`).
  Serve `frontend/dist` as static files (nginx, Netlify, Vercel, S3…) with SPA fallback to `index.html`.
* Set `VITE_API_URL` **at frontend build time** to the public API URL.
* Production backend: strong unique `JWT_*` secrets, `CLIENT_URL` = the exact frontend origin(s),
  HTTPS everywhere (the refresh cookie becomes `Secure`), and run behind a reverse proxy (`trust proxy` is
  enabled in production for correct client IPs).
* Frontend and API on different registrable domains? Set `COOKIE_SAME_SITE=none` (HTTPS required).
  Same site (e.g. `app.school.com` + `api.school.com`) works with the default `lax`.
* Do **not** run the seed in production. Create the first admin through a one-off script or directly in the
  database with a bcrypt hash, then change settings through the UI.
* Use a managed MongoDB (Atlas) with backups and IP allow-listing.

## 15. Roadmap

| Phase | Scope |
|---|---|
| **1 (this)** | Foundation: structure, auth, roles, settings, layouts, dashboards, models, seed, security, docs |
| 2 | Students, teachers, classes, subjects, teacher assignments, sessions/terms |
| 3 | Exams, question bank, questions, teacher exam creation, publishing |
| 4 | CA / assessment system |
| 5 | Result calculation, grading, term results, report cards, PDF |
| 6 | CBT Exam Box integration |
| 7 | Admin dashboard depth, reports, audit UI, settings |
| 8 | Hardening, automated tests, performance, deployment |

Deliberately out of scope: hostel, payroll, transport, inventory, cafeteria, library, HR, fees, parent CRM,
complex admissions.

## 16. Known Phase 1 limitations

* No automated test suite yet (Phase 8). Phase 1 was verified manually against a real MongoDB and a real
  browser; see the checklist the project owner can re-run in `backend/API.md`.
* No password-reset / change-password flow yet (users are created by an admin).
* Logo/favicon are URL references; file upload comes with a later phase.
