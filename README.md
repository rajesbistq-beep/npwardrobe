This is the NP Wardrobe storefront and admin application built with Next.js, React, TypeScript and Supabase.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your actual Supabase project values from the Supabase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` — the Project URL for the Supabase project.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the public anon / publishable key.
   - `NEXT_PUBLIC_SITE_URL` — the local site URL such as `http://localhost:3000`.
3. Keep `.env.local` in the project root and never commit it.
4. Do not add real service-role credentials to the browser or source control. Server-only credentials belong in trusted server-side code only.

To find the values in Supabase:

- Go to your project dashboard.
- Open Project Settings → API.
- Copy the Project URL and the `anon` publishable key.
- Use those values in `.env.local`.

A working Supabase connection is required for real catalogue browsing, account sign-in, checkout, order creation, stock validation and admin operations.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production readiness notes

- Public storefront routes can render a safe fallback shell when Supabase is not configured, but protected routes and backend workflows fail closed until the required environment variables are set.
- The app will not claim live catalogue or account data until the backend is configured and reachable.
