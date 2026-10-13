// app/dashboard/wali-kelas/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type EkskulRow = { nama: string; predikat: string; keterangan: string }

export async function simpanWaliKelas(
  student_id: string,
  payload: {
    ekskul: EkskulRow[]
    sakit: number
    izin: number
    alpha: number
    catatan: string
  }
) {
  const supabase = await createClient()

  await supabase.from('extracurriculars').delete().eq('student_id', student_id)

  if (payload.ekskul.length > 0) {
    const ekskulData = payload.ekskul
      .filter((e) => e.nama.trim() !== '')
      .map((e) => ({
        student_id,
        nama: e.nama,
        predikat: e.predikat,
        keterangan: e.keterangan,
      }))

    if (ekskulData.length > 0) {
      const { error } = await supabase.from('extracurriculars').insert(ekskulData)
      if (error) return { error: error.message }
    }
  }

  const { error: errAbsen } = await supabase
    .from('attendances')
    .upsert(
      {
        student_id,
        sakit: payload.sakit,
        izin: payload.izin,
        alpha: payload.alpha,
      },
      { onConflict: 'student_id' }
    )
  if (errAbsen) return { error: errAbsen.message }

  const { error: errCatatan } = await supabase
    .from('homeroom_notes')
    .upsert({ student_id, catatan: payload.catatan }, { onConflict: 'student_id' })
  if (errCatatan) return { error: errCatatan.message }

  revalidatePath('/dashboard/wali-kelas')
  revalidatePath(`/dashboard/wali-kelas/${student_id}`)
  revalidatePath(`/dashboard/rapor/${student_id}`)

  return { success: true }
}