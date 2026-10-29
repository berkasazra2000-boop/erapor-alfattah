// app/dashboard/ttd/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadTTD(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  const userId = formData.get('userId') as string // 'kepsek' atau UUID guru

  if (!file || file.size === 0) return { error: 'File kosong' }

  // 1. Upload ke Supabase Storage (bucket 'ttd')
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ttd')
    .upload(fileName, file, { cacheControl: '3600', upsert: true })

  if (uploadError) return { error: uploadError.message }

  // 2. Ambil URL Publik
  const { data: publicUrl } = supabase.storage
    .from('ttd')
    .getPublicUrl(uploadData.path)

  // 3. Simpan URL ke database
  if (userId === 'kepsek') {
    await supabase.from('schools').update({ kepala_sekolah_ttd_url: publicUrl.publicUrl }).neq('id', '00000000-0000-0000-0000-000000000000')
  } else {
    await supabase.from('profiles').update({ ttd_url: publicUrl.publicUrl }).eq('id', userId)
  }

  revalidatePath('/dashboard/ttd')
  revalidatePath('/dashboard/rapor')
  return { success: true }
}