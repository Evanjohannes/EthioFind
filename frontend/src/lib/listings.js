// turns a plain business row (from Saved) into the same shape search results use
export function businessToListing(b) {
  const cover = [...(b.business_photos || [])].filter((p) => !p.branch_id).sort((x, y) => x.sort_order - y.sort_order)[0]
  return {
    listing_id: b.id,
    business_id: b.id,
    is_branch: false,
    name: b.name,
    branch_label: null,
    category_name: b.categories?.name,
    city: b.city,
    subcity: b.subcity,
    address_text: b.address_text,
    lat: b.lat,
    lng: b.lng,
    rating_avg: b.rating_avg,
    rating_count: b.rating_count,
    cover: cover?.storage_path || null,
  }
}