# TicketWise 🎫

An AI-assisted IT helpdesk ticket triage system that categorizes and prioritizes support tickets automatically — no manual sorting required.

🔗 **Live Demo:** [https://ticket-wise-mu.vercel.app/](https://ticket-wise-mu.vercel.app/)

## What it does

Submit a ticket in plain English. The app scans the title and description, assigns a category (bug, access request, billing, hardware, general) and a priority (low → critical) based on urgency language, and sorts the queue automatically — cutting manual triage time to zero for the common case.

## Tech Stack

`Next.js 14` `TypeScript` `Tailwind CSS` `Prisma` `PostgreSQL (Neon)` `AWS Comprehend` `Vercel`

## Features

- Natural language ticket submission → automatic category + priority classification
- Rule-based classifier by default, with a pluggable AWS Comprehend sentiment-analysis layer for enhanced urgency detection
- Priority-sorted triage queue with live status/assignee updates
- Full REST API (`/api/tickets`, `/api/tickets/[id]`, `/api/classify`) alongside the frontend in a single deployment
- Zero-cost infrastructure: serverless Postgres on Neon, hosting on Vercel, no idle billing

## Architecture
Next.js (Vercel)
├─ Frontend — React pages (queue, new ticket, ticket detail)
├─ API routes — serverless functions (Node.js runtime)
│ ├─ POST /api/tickets → classify + create
│ ├─ GET /api/tickets → list, filterable by status/priority/category
│ ├─ PATCH /api/tickets/:id → update status/priority/assignee
│ └─ POST /api/classify → standalone classifier endpoint
├─ Prisma ORM → PostgreSQL (Neon, serverless)
└─ Classifier — rule-based keyword matching, optional AWS Comprehend sentiment boost

## Getting Started

```bash
npm install
cp .env.example .env      # add your Neon DATABASE_URL
npx prisma db push        # creates the Ticket table
npm run dev
```

Visit `http://localhost:3000`.

## Deployment

Deployed as a single Vercel project — frontend and API routes ship together. Database is [Neon](https://neon.tech) (serverless Postgres, permanent free tier). AWS Comprehend integration is optional and off by default (`USE_AWS_COMPREHEND=false`), so the project runs at zero cost with no AWS account required.

## Possible Extensions

- SNS/Lambda alert when a critical ticket sits unassigned past an SLA window
- S3-backed file attachments on tickets
- Swap the rule-based fallback for a trained ML classifier
