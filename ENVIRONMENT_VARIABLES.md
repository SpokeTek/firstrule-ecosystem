# Environment Variables Guide

This document explains the environment variable configuration for the FirstRule Ecosystem application.

## ⚠️ Security Note

**CRITICAL**: The `.env` file is automatically managed by Lovable Cloud and should NEVER be manually edited. It only contains public VITE_ prefixed variables that are safe to expose in the browser.

All sensitive credentials (API keys, secrets, tokens) MUST be stored in Lovable Cloud secrets, NOT in the `.env` file or codebase.

## Automatic Configuration (Lovable Cloud)

These variables are automatically configured by Lovable Cloud:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

**You do NOT need to set these manually.** They are automatically injected by the platform.

## Required Secrets (Lovable Cloud Secrets Management)

The following secrets are required and should be configured using Lovable Cloud's secrets management:

### OpenPlay API Credentials

```bash
OPENPLAY_API_KEY_ID=your_api_key_id
OPENPLAY_API_SECRET=your_api_secret
OPENPLAY_BASE_URL=https://newwest.opstaging.com/connect/v2
OPENPLAY_WEBHOOK_SECRET=your_webhook_secret
```

**How to add secrets:**
1. Click on the secrets management button in Lovable
2. Add each secret with its name and value
3. Secrets are automatically encrypted and available to edge functions via `Deno.env.get('SECRET_NAME')`

### Other API Keys

If you need additional API keys (OpenAI, ElevenLabs, etc.), add them through Lovable Cloud's secrets management:

```bash
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
# etc.
```

## How Secrets Work

1. **Client-side (browser)**: Only `VITE_` prefixed variables from `.env` are available via `import.meta.env.VITE_*`
2. **Server-side (edge functions)**: All secrets are available via `Deno.env.get('SECRET_NAME')`

## Security Best Practices

✅ **DO:**
- Store all sensitive credentials in Lovable Cloud secrets
- Use VITE_ prefix only for truly public values (like Supabase publishable key)
- Rotate credentials immediately if they are exposed
- Use webhook signature verification for all incoming webhooks

❌ **DON'T:**
- Never put API keys or secrets in the `.env` file
- Never commit credentials to git
- Never expose service role keys in client-side code
- Never skip webhook signature verification

## Troubleshooting

### "supabaseUrl is required" Error

This means Lovable Cloud hasn't properly injected the environment variables. Solutions:
1. Ensure Lovable Cloud is properly connected
2. Trigger a fresh deployment
3. Check that you haven't manually edited the `.env` file

### Edge Function Can't Access Secrets

Make sure:
1. The secret is added via Lovable Cloud secrets management
2. You're using `Deno.env.get('SECRET_NAME')` (exact name match)
3. The edge function has been redeployed after adding the secret

## Migration Note

If you previously had credentials in the `.env` file:
1. **Remove them from `.env` immediately**
2. **Add them to Lovable Cloud secrets**
3. **Rotate the credentials at the service provider**
4. Update edge functions to use `Deno.env.get()` instead of `import.meta.env`

