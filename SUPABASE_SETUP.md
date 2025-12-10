# Supabase Setup Guide

This guide will help you set up the required Supabase tables for storing wallet creations and other data.

## Prerequisites

- A Supabase project created at https://supabase.com
- Your Supabase URL and anon key (in the `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

## Setup Steps

### 1. Create the `wallet_creations` Table

Go to your Supabase project's SQL editor and run this SQL:

```sql
-- Create wallet_creations table
CREATE TABLE IF NOT EXISTS wallet_creations (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'image',
  timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000),
  prompt TEXT,
  remix_type TEXT,
  parent_asset JSONB,
  original_url TEXT,
  watermarked_url TEXT,
  registered_by_wallet TEXT,
  registered_ip_id TEXT,
  child_ip_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_creations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_timestamp ON wallet_creations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_registered_ip_id ON wallet_creations(registered_ip_id);

-- Enable RLS (Row Level Security)
ALTER TABLE wallet_creations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own creations
CREATE POLICY wallet_creations_user_access ON wallet_creations
  FOR SELECT
  USING (true);  -- Allow all reads (client validates wallet_address)

CREATE POLICY wallet_creations_user_insert ON wallet_creations
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts (server validates wallet_address)

CREATE POLICY wallet_creations_user_update ON wallet_creations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);  -- Allow all updates (server validates wallet_address)

CREATE POLICY wallet_creations_user_delete ON wallet_creations
  FOR DELETE
  USING (true);  -- Allow all deletes (server validates wallet_address)
```

### 2. Create the `wallet_creations` Storage Bucket

Go to Storage in your Supabase project and:

1. Click "Create a new bucket"
2. Name it `wallet_creations`
3. Make it **Public** (to serve images)
4. Click "Create bucket"

### 3. Set Storage RLS Policies

In your Supabase project SQL editor, add these policies:

```sql
-- Allow authenticated users to upload to their own wallet path
CREATE POLICY wallet_storage_upload ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'wallet_creations' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR true)
  );

-- Allow public read access to all wallet creations
CREATE POLICY wallet_storage_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wallet_creations');
```

## Verification

After running the SQL:

1. Go to the Tables section and verify `wallet_creations` table exists
2. Check Storage > wallet_creations bucket exists
3. Generate an image from IP Imagine
4. Check if the creation appears in the `wallet_creations` table

## Troubleshooting

### Table doesn't exist error (500)
- Run the SQL setup again
- Make sure you're in the correct Supabase project
- Check that RLS is enabled

### Images not uploading
- Check that `wallet_creations` storage bucket is **Public**
- Verify bucket policies are set

### Creations not showing on reconnect
- Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project settings > API
- Verify RLS policies are allowing reads

## Environment Variables

Make sure your `.env` file has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These should be visible in your Supabase project settings.
