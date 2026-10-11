// app/dashboard/siswa/import/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SiswaRow = {
  nama: string
  nis: string
  nisn: string
  class_id: string
}

export async function importSiswa(rows: SiswaRow[]) {
  if (rows.length === 0) return { error: 'Tidak ada data untuk diimport' }

  const supabase = await createClient()
  const { error } = await supabase.from('students').insert(rows)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/siswa')
  return { success: true, count: rows.length }
}