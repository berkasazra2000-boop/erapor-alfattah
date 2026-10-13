// app/dashboard/wali-kelas/import/[class_id]/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type EkskulItem = { nama: string; predikat: string; keterangan: string }

type ImportRow = {
  student_id: string
  ekskul: EkskulItem[]
  sakit: number
  izin: number
  alpha: number
  catatan: string
}

export async function importWaliKelas(class_id: string, rows: ImportRow[]) {
  if (rows.length === 0) return { error: 'Tidak ada data untuk diimport' }

  const supabase = await createClient()
  const studentIds = rows.map((r) => r.student_id)

  // Hapus ekskul lama
  await supabase.from('extracurriculars').delete().in('student_id', studentIds)

  // Insert ekskul baru
  const ekskulData: any[] = []
  rows.forEach((r) => {
    r.ekskul.forEach((e) => {
      if (e.nama.trim()) {
        ekskulData.push({
          student_id: r.student_id,
          nama: e.nama,
          predikat: e.predikat,
          keterangan: e.keterangan,
        })
      }
    })
  })

  if (ekskulData.length > 0) {
    const { error } = await supabase.from('extracurriculars').insert(ekskulData)
    if (error) return { error: error.message }
  }

  // Upsert absensi
  const absensiData = rows.map((r) => ({
    student_id: r.student_id,
    sakit: r.sakit,
    izin: r.izin,
    alpha: r.alpha,
  }))

  const { error: errAbsen } = await supabase
    .from('attendances')
    .upsert(absensiData, { onConflict: 'student_id' })
  if (errAbsen) return { error: errAbsen.message }

  // Upsert catatan
  const catatanData = rows.map((r) => ({
    student_id: r.student_id,
    catatan: r.catatan,
  }))

  const { error: errCatatan } = await supabase
    .from('homeroom_notes')
    .upsert(catatanData, { onConflict: 'student_id' })
  if (errCatatan) return { error: errCatatan.message }

  revalidatePath('/dashboard/wali-kelas')
  revalidatePath('/dashboard/rapor')

  return { success: true, count: rows.length }
}