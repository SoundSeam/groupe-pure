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

## Page visibility

The site is homepage-only by default in every environment. Requests for any
other page redirect to the homepage in the requested or preferred language.

Set `FULL_SITE_ENABLED=true` to make every page available. Missing, empty, and
`false` values keep secondary pages hidden.

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

## Contact form email delivery

The contact form sends inquiries through a Supabase Edge Function and Resend.
Attachments upload directly from the browser to the private
`contact-attachments` bucket, avoiding Vercel's request-size limit. The Edge
Function then:

- validates all fields again on the server;
- enforces a five-submissions-per-hour IP rate limit;
- rejects honeypot and unrealistically fast bot submissions;
- validates the uploaded file's size, declared MIME type, and file signature;
- sends the file as a real email attachment and includes a seven-day private
  download link;
- uses Resend idempotency keys to prevent duplicate delivery on retries; and
- stores the delivery state and Resend message ID in `contact_submissions`.

Allowed attachments are PDF, Word, HEIC, JPEG, PNG, and WebP files up to 20 MB.
The Storage bucket is private and the browser receives only a one-file signed
upload token.

### One-time Supabase and Resend setup

1. In Resend, add and verify `groupepure.ca`. The default sender is
   `Groupe Pure <website@groupepure.ca>` and the recipient is
   `info@groupepure.ca`.
2. Authenticate and link the Supabase CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Apply the contact table and private Storage bucket migration:

   ```bash
   npx supabase db push
   ```

4. In **Supabase → Edge Functions → Secrets**, add:

   ```text
   RESEND_API_KEY=re_...
   ```

5. Deploy the function:

   ```bash
   npx supabase functions deploy contact --no-verify-jwt
   ```

The function already defaults to the production domains and local development.
If another hostname needs to submit the form, set a comma-separated
`CONTACT_ALLOWED_ORIGINS` Edge Function secret. `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` may also override the defaults without code changes.

The Resend key must never use a `NEXT_PUBLIC_` name or be added to the browser
environment.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
