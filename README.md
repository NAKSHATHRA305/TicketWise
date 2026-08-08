# TicketWise

AI-assisted IT helpdesk ticket triage. Submit a ticket in plain English; it's
automatically categorized and prioritized so the queue sorts itself.

**Stack:** Next.js 14 (App Router, TypeScript) · Tailwind · Prisma ·
PostgreSQL on Neon · AWS Comprehend (optional AI enhancement) · deployed
entirely on Vercel.

**Why Neon and not AWS RDS for the database:** RDS bills per hour the
instance exists, so it's the one piece of AWS with a real expiration date
(12-month free tier, then a recurring monthly charge whether you use it or
not). Neon's free tier isn't a time-limited promo — it doesn't expire. AWS
is still genuinely in this stack via Comprehend (and optionally S3), which
bill per request instead of per hour, so idle cost is $0 indefinitely. Since
Prisma just talks to whatever's in `DATABASE_URL`, none of the application
code changes based on this choice.

## How classification works

Every ticket goes through `src/lib/classifier.ts`:

- **Default (zero setup):** a rule-based classifier scans the title/description
  for keywords to assign a category (bug, access request, billing, hardware,
  general) and scans for urgency language to assign a priority.
- **With AWS Comprehend enabled:** the same rule-based pass runs first, then
  Comprehend's sentiment analysis is used to bump priority up when the
  requester's language reads as strongly negative/frustrated — a real AWS AI
  service augmenting a simple heuristic, not replacing it.

Flip it on by setting `USE_AWS_COMPREHEND=true` and filling in AWS credentials
in your environment variables. Nothing else in the app changes.

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum
npx prisma db push     # creates the Ticket table
npm run dev
```

Visit `http://localhost:3000`.

## Setting up the database (Neon PostgreSQL)

1. Go to [neon.tech](https://neon.tech) → sign up (GitHub login is fastest) →
   **Create a project**. Pick a region close to you.
2. On the project dashboard, copy the **connection string** shown — it's
   already in the `postgresql://...` format Prisma expects.
3. Paste it into `.env` as `DATABASE_URL`.
4. Run `npx prisma db push` to create the schema.

That's it — no VPC, no security groups, no public-access toggles, and
nothing that expires. This is also the exact same `DATABASE_URL` you'll set
in Vercel's environment variables for the deployed app.

### If you'd rather use AWS RDS anyway (e.g. to have it as a resume bullet)

Steps: AWS Console → RDS → Create database → PostgreSQL → Free tier template
→ set master credentials → enable public access + a security group allowing
inbound 5432 → build `DATABASE_URL` from the endpoint → `npx prisma db push`.
Just know this instance bills ~$12–15/month once the 12-month free tier
ends, whether or not you're using it — either budget for that or move
`DATABASE_URL` to Neon later (one env var change, no code change, one-click
redeploy on Vercel).

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Add environment variables (from `.env.example`) in the Vercel project
   settings: `DATABASE_URL`, and if using Comprehend, `AWS_REGION`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `USE_AWS_COMPREHEND`.
4. Deploy. Vercel runs `prisma generate && next build` automatically (see the
   `build` script in `package.json`).

Frontend and backend ship as a single Vercel deployment — the API routes
under `src/app/api/**` run as serverless functions alongside the pages.

## Project structure

```
src/
  app/
    page.tsx                 # triage queue (dashboard)
    new/page.tsx              # new ticket form
    tickets/[id]/page.tsx      # ticket detail + status controls
    api/
      tickets/route.ts         # GET list, POST create (+ auto-classify)
      tickets/[id]/route.ts    # GET one, PATCH update
      classify/route.ts        # standalone classifier endpoint
  lib/
    prisma.ts                 # Prisma client singleton
    classifier.ts              # rule-based + AWS Comprehend classification
  components/
    Badges.tsx                 # priority/status/category UI
prisma/
  schema.prisma                # Ticket model
```

## Possible extensions

- SNS/Lambda alert when a CRITICAL ticket sits unassigned past an SLA window.
- S3-backed file attachments on tickets (client for this is already a
  dependency — `@aws-sdk/client-s3`).
- Swap the rule-based fallback for a small trained classifier if you want a
  from-scratch ML story instead of a managed AWS service.
