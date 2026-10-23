module.exports = (req, res) => {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";
  if (/service_role/i.test(key)) {
    res.status(500).setHeader("Content-Type", "application/javascript");
    return res.send('console.error("SUPABASE_ANON_KEY looks like a service_role key. Use the anon/publishable key.");window.ENV={};');
  }
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.send("window.ENV=" + JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key }) + ";");
};
