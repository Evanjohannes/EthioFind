import { supabase } from './supabaseClient'

export function videoUrl(path) {
  return supabase.storage.from('business-videos').getPublicUrl(path).data.publicUrl
}

// uploads the new video, saves its path on the business (or branch), then deletes the old file
export async function uploadBusinessVideo(businessId, file, oldPath = null, branchId = null) {
  const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
  const folder = branchId ? `${businessId}/${branchId}` : businessId
  const path = `${folder}/${Date.now()}.${ext}`
  const table = branchId ? 'branches' : 'businesses'

  const { error: uploadError } = await supabase.storage
    .from('business-videos')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { error: rowError } = await supabase
    .from(table)
    .update({ video_path: path })
    .eq('id', branchId || businessId)
  if (rowError) {
    await supabase.storage.from('business-videos').remove([path])
    throw rowError
  }

  if (oldPath) await supabase.storage.from('business-videos').remove([oldPath])
  return path
}

export async function removeBusinessVideo(businessId, path, branchId = null) {
  const table = branchId ? 'branches' : 'businesses'
  const { error } = await supabase.from(table).update({ video_path: null }).eq('id', branchId || businessId)
  if (error) throw error
  await supabase.storage.from('business-videos').remove([path])
}