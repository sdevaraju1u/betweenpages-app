# BetweenPages — Deployment Guide

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Cloud Run   │    │   Firebase   │    │  Open Library │
│  (Next.js)   │───▶│  Firestore   │    │    (API)      │
│  us-central1 │    │  + Auth      │    │  (on-demand)  │
└──────────────┘    └──────────────┘    └──────────────┘
       │
       │ Gemini API (server-side only)
       ▼
┌──────────────┐
│  Google AI   │
│  Studio      │
└──────────────┘
```

## Prerequisites

- Google Cloud SDK (`gcloud`) installed
- Node.js 22+
- GCP project `betweenpages-a658a` with billing linked
- Firebase project with Auth (Google sign-in) + Firestore enabled

## Environment Variables

### Secrets (NEVER commit these)

| Variable | Where used | How to pass |
|----------|-----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client-side (build time) | `--set-build-env-vars` on deploy |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Server-side (runtime) | `--set-env-vars` on deploy |

### Non-secret config (safe in Dockerfile)

These are Firebase project identifiers — not secrets. They're visible in the client bundle anyway.

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `betweenpages-a658a.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `betweenpages-a658a` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `betweenpages-a658a.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `636411843201` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:636411843201:web:b9a4335ac0964f7dd17380` |

### Local development

All variables are in `.env.local` (gitignored). Copy from `.env.local.example`:

```bash
cp .env.local.example .env.local
# Fill in the API keys
```

## Deploy to Cloud Run

### One-command deploy

```bash
gcloud run deploy betweenpages \
  --source . \
  --project betweenpages-a658a \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>" \
  --set-build-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-key>" \
  --quiet
```

This command:
1. Uploads source code to Cloud Build
2. Builds the Docker image using the `Dockerfile`
3. Pushes the image to Artifact Registry
4. Deploys a new Cloud Run revision
5. Routes 100% traffic to the new revision

### What happens during build

```
Dockerfile stages:
  1. deps     → npm ci (install dependencies)
  2. builder  → next build (compile Next.js, NEXT_PUBLIC_ vars baked in)
  3. runner   → minimal Node.js image with standalone output (~150MB)
```

### After first deploy

Add the Cloud Run URL to **Firebase Auth authorized domains**:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add: `betweenpages-<project-number>.us-central1.run.app`
3. Also add your custom domain when ready (e.g., `betweenpages.ai`)

## Custom Domain Setup

### Option A: Cloudflare (recommended)

1. Buy domain on Cloudflare (e.g., `betweenpages.ai`)
2. In Cloud Run console → "Manage Custom Domains" → Add `betweenpages.ai`
3. Copy the DNS records Cloud Run provides
4. Add them in Cloudflare DNS settings
5. Wait for SSL provisioning (~10 min)

### Option B: Direct DNS

1. Buy domain from any registrar
2. In Cloud Run console → "Manage Custom Domains" → Add your domain
3. Update DNS A/AAAA records at your registrar
4. Wait for SSL provisioning

### After domain setup

Add the custom domain to Firebase Auth authorized domains (same as above).

## Redeployment

After making code changes:

```bash
# From the project root
gcloud run deploy betweenpages \
  --source . \
  --project betweenpages-a658a \
  --region us-central1 \
  --set-env-vars "GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>" \
  --set-build-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-key>" \
  --quiet
```

Cloud Run keeps previous revisions. You can roll back in the console if needed.

## Re-seeding Firestore

To refresh book data (charts, clubs, reviews):

```bash
GOOGLE_GENERATIVE_AI_API_KEY="<your-key>" npx tsx scripts/seed.ts
```

This:
- Uses Gemini to generate curated book lists
- Enriches with Open Library covers
- Writes to Firestore
- Generates reviews for the first 30 books

The seed script uses `serviceAccountKey.json` (gitignored) for Firestore admin access.

## Cost Estimates

### Cloud Run (free tier covers this)
- 2 million requests/month free
- 360,000 vCPU-seconds/month free
- 180,000 GiB-seconds/month free

### Firebase (free Spark plan covers this)
- Firestore: 50K reads/day, 20K writes/day, 1GB storage
- Auth: unlimited users

### Gemini API
- Pay-per-use via AI Studio billing
- ~$0.001 per chat message

### Total at current scale: $0/month

## Monitoring

- **Cloud Run logs**: `gcloud run services logs read betweenpages --project betweenpages-a658a --region us-central1`
- **Cloud Run console**: https://console.cloud.google.com/run?project=betweenpages-a658a
- **Firebase console**: https://console.firebase.google.com/project/betweenpages-a658a

## Troubleshooting

### "auth/invalid-api-key" on production
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` was passed via `--set-build-env-vars` during deploy
- The key must be present at BUILD time (not just runtime) because Next.js bakes `NEXT_PUBLIC_*` into the client bundle

### Google Sign-In fails on production
- Add the Cloud Run URL to Firebase Auth → Settings → Authorized domains

### Build fails with TypeScript errors
- The `route.ts` file uses `@ts-ignore` for AI SDK type gaps (jsonSchema + tool)
- Run `npm run build` locally first to catch errors before deploying

### Chat not returning BookCards
- Gemini sometimes responds with text instead of calling the tool
- The system prompt instructs it to use the tool, but it's not 100% reliable
- This is a model behavior issue, not a code bug
