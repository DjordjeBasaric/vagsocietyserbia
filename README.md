# VagSocietySerbia Official Website

Full-stack Next.js (App Router) application for the VagSocietySerbia automobile club. Includes public pages, a web shop, event registration, and a secured admin panel.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth credentials for admin login
- Server Actions for mutations
- Zod validation
- Nodemailer email delivery
- Local file uploads (cloud-ready structure)

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

```bash
cp .env.example .env
```

3) Initialize database

```bash
npm run prisma:migrate
```

4) Create an admin user

```bash
ADMIN_SEED_EMAIL="admin@vagsocietyserbia.com" \
ADMIN_SEED_PASSWORD="change-me" \
ADMIN_SEED_NAME="VagSocietySerbia Admin" \
npm run create-admin
```

5) Run the app

```bash
npm run dev
```

## Folder Highlights

- `src/app` — App Router pages and server actions
- `src/lib` — Prisma client, auth, validators, email, uploads
- `prisma/schema.prisma` — Data models
- `public/placeholders` — Placeholder visuals for gallery and merch

## Notes

- Orders and event registrations send emails via SMTP.
- Event registration uploads are stored locally under `public/uploads` unless Cloudinary is configured.
- Payment integration can be added later to the order flow.

## Deploy (Vercel + Neon + Cloudinary)

1) Push the repo to GitHub.
2) Create a Postgres database on Neon (or Supabase).
3) Set `DATABASE_URL` in Vercel and run:

```bash
npx prisma migrate deploy
```

4) Add env vars in Vercel:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`

5) Redeploy. Uploads will go to Cloudinary, and images will work with Next/Image.
