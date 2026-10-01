# API Reference (Phase 1)

Base URL: `http://localhost:5000/api` · unversioned · JSON.

## Conventions

Success:
```json
{ "success": true, "message": "Request successful", "data": {} }
```
Error:
```json
{ "success": false, "message": "Validation failed", "code": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Enter a valid email address" }] }
```

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` / `BAD_REQUEST` / `INVALID_ID` / `BAD_JSON` | Bad input |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired credentials |
| 403 | `FORBIDDEN` | Authenticated but not permitted (or account inactive) |
| 404 | `NOT_FOUND` | Unknown route/resource |
| 409 | `DUPLICATE` / `CONFLICT` | Unique constraint |
| 413 | `PAYLOAD_TOO_LARGE` | Body > 1 MB |
| 429 | `RATE_LIMITED` | Too many requests |
| 501 | `NOT_IMPLEMENTED` | Reserved for a later phase |
| 503 | `DATABASE_UNAVAILABLE` | MongoDB unreachable |
| 500 | `INTERNAL_ERROR` | Unexpected (stack only in development) |

Authenticated routes need `Authorization: Bearer <accessToken>`.
Paginated lists: `?page=1&limit=20` → `{ items, total, page, limit }`.

## Implemented in Phase 1

| Method & path | Auth / permission | Notes |
|---|---|---|
| `GET /health` | none | `503` if DB is down |
| `POST /auth/login` | none (strict rate limit) | body `{ email, password }` → `{ accessToken, user }` + refresh cookie |
| `POST /auth/refresh` | refresh cookie | rotates refresh token; returns new `{ accessToken, user }` |
| `POST /auth/logout` | refresh cookie | revokes refresh token, clears cookie |
| `GET /auth/me` | any signed-in user | `{ user: { id, email, role, firstName, lastName, permissions } }` |
| `GET /settings/public` | none | branding + current session/term only |
| `GET /settings` | `settings.read` | full settings |
| `PUT /settings` | `settings.update` | partial, strict; nested objects merge; audited |
| `GET /users` | `users.read` | `?role=&search=&page=&limit=` |
| `POST /users` | `users.create` | `{ email, password(≥8), role, firstName, lastName, phone? }`; audited |
| `GET /users/:id` | `users.read` | |
| `GET /dashboard/admin` | `dashboard.admin` | counts, current session/term |
| `GET /dashboard/teacher` | `dashboard.teacher` | assigned classes/subjects, exam count, recent activity |
| `GET /dashboard/student` | `dashboard.student` | class, available exams, published results |
| `GET /audit` | `audit.read` | `?action=&entity=&page=&limit=` |
| `POST /integration/cbt/authenticate` | CBT client headers | returns client name, allowed operations |

## Reserved for later phases (auth + permission enforced now, then `501`)

`/students` `/teachers` `/classes` `/subjects` `/assignments` `/exams` `/questions` `/assessments` `/ca`
`/results` `/reports` `/sessions` — each requires its `*.read` permission, then returns `501`.

`/integration/cbt/exams`, `/exams/:examId`, `/exams/:examId/start`, `/exams/:examId/submit`,
`/results/:studentId` — require CBT client auth **and** the matching `allowedOperations` entry, then `501` (Phase 6).

## CBT client authentication

```
X-CBT-Client-Id: cbt-exam-box
X-CBT-Client-Secret: <secret>
```
Separate from user JWTs: an admin token sent here gets `401`. Rate limit comes from the integration record.

## Permission matrix (defaults, `backend/src/config/permissions.ts`)

| Permission group | ADMIN | TEACHER | STUDENT |
|---|:-:|:-:|:-:|
| users / students / teachers / classes / subjects / assignments / sessions (manage) | ✔ | read-only subset | – |
| exams, questions | ✔ | read/create/update | read exams |
| ca, assessments | ✔ | read/enter | – |
| results, reports | ✔ | read results | read |
| settings.read | ✔ | ✔ | ✔ |
| settings.update, audit.read | ✔ | – | – |
| dashboard.* | admin | teacher | student |

## Manual verification checklist

1. `npm run seed:reset`, `npm run dev:backend`.
2. Login as each role; `GET /auth/me` returns the right permissions.
3. Teacher/student token on `GET /dashboard/admin` → `403`; no token → `401`.
4. `POST /auth/login` with `{"email":{"$ne":null},"password":{"$ne":null}}` → `400`.
5. Reuse an old refresh cookie after rotation → `401`.
6. Suspend a user in the DB: their existing access token → `403` immediately.
7. CBT: admin JWT on `/integration/cbt/authenticate` → `401`; client secret → `200`.
