This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Production page visibility

Production deployments are homepage-only by default. Requests for any other
page redirect to the homepage in the requested or preferred language.

Set `FULL_SITE_ENABLED=true` in the production environment to make every page
available. Development continues to expose the full site regardless of the
flag.

## Live Google rating

The home page uses Google Maps Platform's Places UI Kit to load the current
rating and review count for Groupe Pure. Without credentials, it falls back to a
link that opens the business on Google Maps and never displays stale totals.

1. Create or select a billing-enabled project in Google Cloud.
2. Enable **Maps JavaScript API** and **Places API (New)**.
3. Create a browser API key and restrict it:
   - Application restriction: **Websites**
   - Allowed production referrers: `https://groupepure.ca/*` and
     `https://www.groupepure.ca/*`
   - Add `http://localhost:3000/*` only for local development.
   - API restrictions: **Maps JavaScript API** and **Places API (New)**.
4. Copy `.env.example` to `.env.local` and set
   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. After verifying the key restrictions, set
   `GOOGLE_MAPS_REVIEWS_ENABLED=true`.
6. Add both environment variables to the production deployment and rebuild.

The live widget is opt-in. If `GOOGLE_MAPS_REVIEWS_ENABLED` is missing or is not
exactly `true`, the site displays the Google Maps fallback link and makes no
Places API request.

The Google Place ID is public and is already configured for Groupe Pure. It can
be overridden with `NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID` if the listing changes.
The API key is intentionally delivered to the browser, so its website and API
restrictions are required.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
