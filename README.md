# ReachInbox - Email Job Scheduler

A production-grade full-stack email scheduler service with BullMQ, Redis, PostgreSQL, and a React dashboard.

## Features

### Backend
- ✅ **Email Scheduling** - Schedule emails via API using BullMQ delayed jobs (no cron)
- ✅ **Persistence** - Survives server restarts, jobs stored in Redis with AOF persistence
- ✅ **Worker Concurrency** - Configurable concurrent job processing
- ✅ **Rate Limiting** - Per-sender hourly limits with Redis-backed counters
- ✅ **Ethereal SMTP** - Send emails via fake SMTP for testing
- ✅ **Google OAuth** - Real Google authentication
- ✅ **Elasticsearch** - Searchable emails
- ✅ **Bull Board** - Live queue dashboard at `/admin/queues`

### Frontend
- ✅ **Google Login** - Real OAuth flow
- ✅ **Dashboard** - View Scheduled and Sent emails
- ✅ **Compose** - Schedule new emails with rich text editor
- ✅ **CSV Upload** - Parse recipient lists from CSV/TXT
- ✅ **Send Later** - Schedule for future time
- ✅ **Attachments** - Upload and attach files
- ✅ **Sidebar Navigation** - Clean UI matching Figma design

## Architecture

```
Browser -> Express API (Port 4000) -> PostgreSQL
                |                        Redis/BullMQ
                |                            |
              Worker <----------------------+
                |
              Ethereal SMTP
```

- **API Server** (`src/server.ts`) - Handles HTTP requests, authentication
- **Worker** (`src/worker.ts`) - Separate process that processes email jobs
- **Queue** - BullMQ with Redis backend for delayed jobs
- **Database** - PostgreSQL with Prisma ORM
- **Search** - Elasticsearch for email search

## Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose
- Google Cloud OAuth credentials
- (Optional) Slack app for notifications

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Email-Job-Scheduler
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values. See [Environment Variables](#environment-variables) section.

### 3. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, and Elasticsearch.

### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 5. Start the Application

```bash
npm run dev
```

This starts:
- Backend API on http://localhost:4000
- Backend Worker (separate process)
- Frontend on http://localhost:5173

## Environment Variables

### Backend (.env in root or backend/)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | API server port | `4000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `BACKEND_URL` | Backend URL | `http://localhost:4000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ELASTICSEARCH_URL` | Elasticsearch URL | `http://localhost:9200` |
| `SESSION_SECRET` | Session secret (min 32 chars) | - |
| `ENCRYPTION_KEY` | 32-byte base64 key for AES-256-GCM | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL | `http://localhost:4000/api/auth/google/callback` |
| `ADMIN_USER` | Admin username for Bull Board | `admin` |
| `ADMIN_PASSWORD` | Admin password for Bull Board | - |
| `WORKER_CONCURRENCY` | Number of concurrent jobs per worker | `5` |
| `MIN_DELAY_BETWEEN_EMAILS_MS` | Minimum delay between sends per sender | `2000` |
| `MAX_EMAILS_PER_HOUR_PER_SENDER` | Max emails per hour per sender | `200` |
| `DEFAULT_HOURLY_LIMIT` | Default hourly limit for batches | `200` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (demo knob) | `3600000` |

Generate encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen (add test users if in Testing mode)
6. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
7. Copy Client ID and Secret to `.env`

## How It Works

### Scheduling
1. User submits schedule request via API with recipients, content, timing
2. API creates batch and email records in PostgreSQL (transactional)
3. For each email, a delayed BullMQ job is added with `jobId = email.id`
4. Jobs are stored in Redis with AOF persistence

### Persistence on Restart
- **Redis AOF** - All queue operations are logged to disk
- **PostgreSQL** - Email state is source of truth
- **Boot reconcile** - On startup, checks for emails in `scheduled`/`processing` without active jobs and re-enqueues them
- Jobs delayed in the future remain delayed; jobs whose time passed execute when worker starts

### Rate Limiting
- Uses Redis-backed counters keyed by `senderId + hour_window`
- Enforces per-sender hourly limits and minimum spacing
- When limit reached, jobs are delayed to next window
- Counters shared across all workers/instances
- Never drops or fails jobs due to rate limits

### Idempotency
- API: `Idempotency-Key` header prevents duplicate batch creation
- Database: Unique constraint on `(batch_id, to_email)`
- Queue: `jobId = email UUID` prevents duplicate jobs
- Worker: Conditional UPDATE only claims `scheduled` emails

### Concurrency
- Worker runs with configurable `concurrency` (default 5)
- Multiple jobs processed in parallel safely
- State changes use atomic operations (conditional SQL updates)
- No in-memory counters

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/senders` | Yes | List senders |
| POST | `/api/senders` | Yes | Create new sender |
| GET | `/api/emails/counts` | Yes | Get counts for tabs |
| GET | `/api/emails` | Yes | List emails (with tab, q filters) |
| GET | `/api/emails/:id` | Yes | Get email details |
| POST | `/api/emails/schedule` | Yes | Schedule emails |
| GET | `/admin/queues` | Basic Auth | Bull Board dashboard |

## Default Credentials

- **Admin (Bull Board)**: admin / change-me (set in .env)
- **Ethereal**: Auto-provisioned on first login

## Testing

```bash
cd backend
npm test
npm run typecheck
npm run lint
```

## Production Build

```bash
npm run build
cd backend && npm run start  # API
cd backend && npm run start:worker  # Worker
cd frontend && npm run preview  # Frontend
```

## Assumptions & Trade-offs

1. **Email/Password form** - Rendered for visual fidelity only, shows toast directing to Google login
2. **Sidebar layout** - Follows Figma (user card in sidebar) rather than top header as mentioned in assignment
3. **At-least-once delivery** - With SMTP, crash between send success and DB update could cause retry; mitigated with Message-ID and status checks
4. **Slot leak on cancel** - If job reserved slot but never sent (cancel/failure), slot isn't refunded (documented trade-off)
5. **RATE_LIMIT_WINDOW_MS** - Exists as demo knob for testing (can use 60000ms)
6. **Elasticsearch security disabled** - For development only
7. **Ethereal accounts** - Created via nodemailer.createTestAccount, may be rate-limited

## Scripts

- `npm run dev` - Run all services in development
- `npm run build` - Build both frontend and backend
- `npm run test` - Run all tests
- `npm run docker:up` - Start infrastructure
- `npm run docker:down` - Stop infrastructure

## License

This project is for educational/assignment purposes.
