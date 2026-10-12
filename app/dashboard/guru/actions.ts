// app/dashboard/guru/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignGuru(formData: FormData) {
  const supabase = await createClient()
  const teacher_id = formData.get('teacher_id') as string
  const class_id = formData.get('class_id') as string
  const subject_id = formData.get('subject_id') as string

  if (!teacher_id || !class_id || !subject_id) {
    throw new Error('Semua field wajib diisi')
  }

  const { error } = await supabase.from('teacher_subjects').insert({
    teacher_id,
    class_id,
    subject_id,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/guru')
}

export async function hapusAssign(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('teacher_subjects').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/guru')
}