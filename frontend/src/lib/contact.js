const strip = (v) => v.trim().replace(/^(https?:\/\/)?(www\.)?/i, '')

// a TikTok link that is not a normal profile link (like vm.tiktok.com/xyz) is kept as it is
const isOtherTiktokLink = (clean) =>
  /^[a-z]+\.tiktok\.com\//i.test(clean) || /^tiktok\.com\/(?!@)/i.test(clean)

// pulls the account name out of whatever the owner typed:
// "@name", "name", "tiktok.com/@name" or "https://www.tiktok.com/@name?lang=en"
function handleFrom(value, domain) {
  let v = strip(value)
  v = v.replace(new RegExp(`^${domain}/`, 'i'), '')
  v = v.split(/[/?#]/)[0]
  return v.replace(/^@/, '')
}

export function href(kind, value) {
  const v = value.trim()
  const isUrl = /^https?:\/\//i.test(v)

  if (kind === 'phone') return `tel:${v.replace(/\s+/g, '')}`
  if (kind === 'email') return `mailto:${v}`

  if (kind === 'tiktok') {
    if (isOtherTiktokLink(strip(v))) return isUrl ? v : `https://${v}`
    return `https://www.tiktok.com/@${handleFrom(v, 'tiktok\\.com')}`
  }
  if (kind === 'telegram') return `https://t.me/${handleFrom(v, 't\\.me')}`

  return isUrl ? v : `https://${v}`
}

// what the user sees written on a contact pill
export function shown(kind, value) {
  const t = value.trim()

  if (kind === 'tiktok') {
    const clean = strip(t)
    if (isOtherTiktokLink(clean)) return clean.replace(/\/$/, '')
    return '@' + handleFrom(t, 'tiktok\\.com')
  }
  if (kind === 'telegram') return '@' + handleFrom(t, 't\\.me')

  return t.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

export const directions = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

export const isExternal = (url) => !/^(tel|mailto):/.test(url)