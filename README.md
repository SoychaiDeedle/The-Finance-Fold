# The Finance Fold

Finance operations portal for The Fold London — built with Next.js 16, Tailwind CSS v4, shadcn/ui and Supabase.

## Sections

| Section | Path |
|---|---|
| Overview | `/dashboard` |
| Daily Sales | `/dashboard/daily-sales` |
| Orders | `/dashboard/orders` |
| Returns | `/dashboard/returns` |
| Inventory & Product | `/dashboard/inventory` |
| Customers | `/dashboard/customers` |
| Finance & Reporting | `/dashboard/finance` |
| Reporting | `/dashboard/reporting` |
| Knowledge Library | `/dashboard/knowledge` |
| Support Tickets | `/dashboard/support` |
| Operations | `/dashboard/operations` |
| People & Culture | `/dashboard/people` |

## Stack

- **Framework**: Next.js 16.2 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons
- **Database / Auth**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Package manager**: pnpm or npm

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://bunibppyamcpbajjcptl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Authentication

Auth is handled by Supabase Auth. Supports:
- Email + password login
- Magic link (passwordless)

Users are redirected to `/login` when unauthenticated (via Next.js middleware).

## Deployment

Deploy to Vercel — set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.
