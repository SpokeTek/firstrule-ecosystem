# Required Environment Variables

This document lists all environment variables needed for the FirstRule Ecosystem application.

## Supabase Configuration (Required)

These are **required** for the app to function:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click on "Project Settings" (gear icon)
3. Go to "API" section
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

## OpenPlay API Configuration (Optional for local testing)

These are handled by the Supabase Edge Function in production, but can be set for reference:

```bash
VITE_OPENPLAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Supabase Edge Function Secrets (Production)

These must be set in Supabase (not in Lovable):

```bash
# Set these using Supabase CLI:
supabase secrets set OPENPLAY_API_KEY_ID=your_api_key_id
supabase secrets set OPENPLAY_API_SECRET=your_api_secret
supabase secrets set OPENPLAY_BASE_URL=https://newwest.opstaging.com/connect/v2
```

## Setting Environment Variables in Lovable

1. Go to your Lovable project
2. Click on **Settings** or **Environment Variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Save and redeploy

## Local Development

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual values.

## Troubleshooting

### "supabaseUrl is required" Error

This means `VITE_SUPABASE_URL` is not set in your environment. Make sure:
- The variable is set in Lovable's environment variables
- The variable name is exactly `VITE_SUPABASE_URL` (case-sensitive)
- You've redeployed after adding the variable

### OpenPlay API Not Working

If the OpenPlay integration isn't working:
1. Check that the Supabase Edge Function is deployed: `supabase functions deploy openplay-proxy`
2. Verify the secrets are set: `supabase secrets list`
3. Check Edge Function logs: `supabase functions logs openplay-proxy --tail`

## Security Notes

- **Never commit** `.env` files to git
- The `.env.example` file should only contain placeholder values
- Supabase anon key is safe to expose (it's public)
- OpenPlay credentials should only be in Supabase Edge Function secrets (server-side)

