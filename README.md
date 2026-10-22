# Focus & Mental Energy Survey (India)

Static survey site (plain HTML/CSS/JS) that stores responses in Supabase. Supabase settings come from environment variables and are injected at build time by `build.js`.

```
src/index.html        survey page (placeholders for Supabase config)
build.js              injects env vars → dist/index.html
supabase/schema.sql   table + Row Level Security (anon = insert only)
vercel.json           build + headers
.env.example          variable names
```

## 1. Supabase
1. Create a project at https://supabase.com.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Project Settings → API → copy the **Project URL** and the **anon / publishable key**.

## 2. Run locally
```bash
cp .env.example .env      # fill in the two values
npm run build             # writes dist/index.html
npx serve dist            # open the printed URL
```
Without the variables it builds in **demo mode** (answers are logged to the console, not saved).

## 3. Push to GitHub
```bash
git remote add origin https://github.com/<your-username>/focus-survey.git
git push -u origin main
```

## 4. Deploy on Vercel
1. vercel.com → **Add New → Project** → import the GitHub repo (settings are read from `vercel.json`).
2. Before deploying, add **Environment Variables** (Production, Preview and Development):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy. Every push to `main` redeploys. If you change the variables later, trigger a redeploy, because they're baked in at build time.

## Security notes
- The anon key ends up in the browser by design. Row Level Security (in `schema.sql`) lets it **insert only**, never read.
- Never put the `service_role` key in these variables. The build refuses it.
- Read results in the Supabase dashboard → Table Editor (or export CSV).
- For heavy public traffic, add bot protection (e.g. Cloudflare Turnstile) in front of the insert.
