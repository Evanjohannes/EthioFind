import { readFileSync, writeFileSync } from 'node:fs'

const site = (process.argv[2] || '').replace(/\/$/, '')
if (!site) {
  console.error('Usage: node scripts/generate-sitemap.mjs https://your-site.pages.dev')
  process.exit(1)
}

// read the Supabase address and key from .env.local
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const headers = { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }

async function get(path) {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${path}`, { headers })
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
  return res.json()
}

// only live businesses and their branches are visible without logging in
const businesses = await get('businesses?select=id,created_at&status=eq.active')
const branches = await get('branches?select=id,created_at')

const pages = [
  { loc: '/', priority: '1.0' },
  { loc: '/contact', priority: '0.3' },
  ...businesses.map((b) => ({ loc: `/business/${b.id}`, lastmod: b.created_at, priority: '0.8' })),
  ...branches.map((b) => ({ loc: `/branch/${b.id}`, lastmod: b.created_at, priority: '0.6' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${site}${p.loc}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod.slice(0, 10)}</lastmod>` : ''}
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync('public/sitemap.xml', xml)
console.log(`Wrote public/sitemap.xml with ${pages.length} pages`)