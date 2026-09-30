# NovaPhoto AI — 24-hour cleanup
Deploy the `cleanup-photos` Edge Function and schedule it in Supabase Cron every 5 minutes.
The app sets `expires_at = created_at + 24 hours`. The dashboard never lists expired assets.
The cleanup function removes expired files from the private `private-photos` bucket and then deletes their metadata rows.
