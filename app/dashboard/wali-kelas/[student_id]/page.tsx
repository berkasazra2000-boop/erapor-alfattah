// app/dashboard/wali-kelas/[student_id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FormWaliKelas from '../FormWaliKelas'

export default async function WaliKelasDetailPage({
  params,
}: {
  params: Promise<{ student_id: string }>
}) {
  const { student_id } = await params
  const supabase = await createClient()

  const { data: siswa } = await supabase
    .from('students')
    .select('id, nama, nis, classes(nama)')
    .eq('id', student_id)
    .single()

  if (!siswa) notFound()

  const { data: ekskul } = await supabase
    .from('extracurriculars')
    .select('nama, predikat, keterangan')
    .eq('student_id', student_id)

  const { data: absensi } = await supabase
    .from('attendances')
    .select('sakit, izin, alpha')
    .eq('student_id', student_id)
    .maybeSingle()

  const { data: catatanData } = await supabase
    .from('homeroom_notes')
    .select('catatan')
    .eq('student_id', student_id)
    .maybeSingle()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/wali-kelas"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke Daftar
        </Link>
        <h1 className="text-2xl font-bold mt-2">{siswa.nama}</h1>
        <p className="text-sm text-gray-500">
          NIS {siswa.nis ?? '-'} — Kelas {(siswa as any).classes?.nama ?? '-'}
        </p>
      </div>

      <FormWaliKelas
        studentId={student_id}
        initial={{
          ekskul: ekskul ?? [],
          sakit: absensi?.sakit ?? 0,
          izin: absensi?.izin ?? 0,
          alpha: absensi?.alpha ?? 0,
          catatan: catatanData?.catatan ?? '',
        }}
      />
    </div>
  )
}