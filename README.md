# Lesson Calendar - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Vercel account (for deployment)

## Supabase Setup

### 1. Create a new Supabase project
- Go to https://supabase.com/dashboard
- Click "New Project"
- Note your project URL and API keys

### 2. Create storage bucket
- In Supabase dashboard, go to Storage
- Click "Create bucket"
- Name: `lessons`
- Set to **Public** (or Private if using signed URLs - see notes in code)
- Click "Create bucket"

### 3. Apply database migration
- In Supabase dashboard, go to SQL Editor
- Copy the entire contents of `supabase/migrations/001_init.sql`
- Paste and run the SQL
- Verify tables `lessons` and `lesson_assets` exist in Table Editor

### 4. Get your API keys
- In Supabase dashboard, go to Settings > API
- Copy the following:
  - Project URL (e.g., https://abcdefgh.supabase.co)
  - `anon` public key
  - `service_role` key (KEEP SECRET - server only)

## Local Development Setup

### 1. Clone and install dependencies
```bash
npm install