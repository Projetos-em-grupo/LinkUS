# LinkUS

LinkUS is a web application focused on connecting readers through shared literary interests. Users can create posts, interact with each other, join groups, and exchange messages.

## Tech Stack

- JavaScript
- Node.js
- React
- PostgreSQL / Supabase

## Running Locally

### Prerequisites

- Node.js and npm
- A Supabase project with Postgres enabled

### Environment

Create a `.env` file at the project root with:

```bash
PORT=5000
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DB_SSL=require
DB_INIT_SCHEMA=true
JWT_SECRET=your_jwt_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
```

Notes:

- `DATABASE_URL` should be the Supabase Postgres connection string.
- `DB_INIT_SCHEMA=true` keeps the current behavior of applying `backend/scripts/schema.sql` on startup.
- If the schema was already created in Supabase, you can set `DB_INIT_SCHEMA=false`.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### App URL

Open `http://localhost:5173`.
