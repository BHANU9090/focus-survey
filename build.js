// Injects Supabase settings from environment variables into src/index.html → public/index.html.
// Locally, values are also read from a .env file. On Vercel, set them in Project Settings → Environment Variables.
const fs = require("fs");
const path = require("path");

// minimal .env loader (no dependencies); real environment variables win
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  if (process.env.VERCEL) {
    console.error("Missing SUPABASE_URL and/or SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables.");
    process.exit(1);
  }
  console.warn("⚠  SUPABASE_URL / SUPABASE_ANON_KEY not set, building in demo mode (nothing will be saved).");
}

// Only the public anon key belongs in the browser. Refuse the service-role key.
if (/service_role/i.test(key) || (key.split(".")[1] && Buffer.from(key.split(".")[1], "base64").toString().includes('"service_role"'))) {
  console.error("That looks like a service_role key. Never ship it to the browser; use the anon/publishable key.");
  process.exit(1);
}

let html = fs.readFileSync(path.join(__dirname, "src", "index.html"), "utf8");
html = html.replace("__SUPABASE_URL__", () => url).replace("__SUPABASE_ANON_KEY__", () => key);

fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "public", "index.html"), html);
console.log(`Built public/index.html (${url ? "Supabase configured" : "demo mode"})`);
