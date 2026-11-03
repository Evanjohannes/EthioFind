import { supabase } from './supabaseClient'

export function photoUrl(path) {
  return supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl
}

// shrink big phone photos before uploading
async function resizeImage(file, max = 1280) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
}

// branchId = null means the photo belongs to the main business
export async function uploadBusinessPhotos(businessId, files, startOrder = 0, branchId = null) {
  for (let i = 0; i < files.length; i++) {
    const blob = await resizeImage(files[i])
    const folder = branchId ? `${businessId}/${branchId}` : businessId
    const path = `${folder}/${Date.now()}-${i}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('business-photos')
      .upload(path, blob, { contentType: 'image/jpeg' })
    if (uploadError) throw uploadError

    const { error: rowError } = await supabase.from('business_photos').insert({
      business_id: businessId,
      branch_id: branchId,
      storage_path: path,
      sort_order: startOrder + i,
    })
    if (rowError) throw rowError
  }
}