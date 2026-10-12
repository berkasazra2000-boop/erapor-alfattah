// app/dashboard/nilai/[id]/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type NilaiRow = {
  student_id: string
  nilai_angka: number | null
  capaian_kompetensi: string
}

export async function simpanNilai(
  assignment_id: string,
  rows: NilaiRow[]
) {
  if (rows.length === 0) return { error: 'Tidak ada data untuk disimpan' }

  const supabase = await createClient()

  // Ambil info assignment dulu
  const { data: assignment } = await supabase
    .from('teacher_subjects')
    .select('subject_id, classes(id)')
    .eq('id', assignment_id)
    .single()

  if (!assignment) return { error: 'Assignment tidak ditemukan' }

  const subject_id = assignment.subject_id

  // Upsert nilai per siswa
  const upsertData = rows.map((r) => ({
    student_id: r.student_id,
    subject_id,
    nilai_angka: r.nilai_angka,
    capaian_kompetensi: r.capaian_kompetensi,
  }))

  const { error } = await supabase
    .from('student_grades')
    .upsert(upsertData, { onConflict: 'student_id,subject_id' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/nilai')
  revalidatePath(`/dashboard/nilai/${assignment_id}`)
  return { success: true, count: rows.length }
}