import { supabase } from './supabaseClient'

// removes the files (photos, receipts, videos) that belonged to what was deleted
async function removeFiles(paths) {
  const groups = [
    ['business-photos', paths.photos],
    ['payment-receipts', paths.receipts],
    ['business-videos', paths.videos],
  ]
  for (const [bucket, list] of groups) {
    if (list?.length) await supabase.storage.from(bucket).remove(list)
  }
}

export async function deleteBusinessAsAdmin(businessId, reason) {
  const { data, error } = await supabase.rpc('admin_delete_business', {
    p_business_id: businessId,
    p_reason: reason,
  })
  if (error) throw error
  await removeFiles(data || {})
}

export async function deleteBranchAsAdmin(branchId, reason) {
  const { data, error } = await supabase.rpc('admin_delete_branch', {
    p_branch_id: branchId,
    p_reason: reason,
  })
  if (error) throw error
  await removeFiles(data || {})
}