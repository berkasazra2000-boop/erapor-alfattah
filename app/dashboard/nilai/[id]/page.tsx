// app/dashboard/nilai/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ImportForm from './ImportForm'

export default async function NilaiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: assignment } = await supabase
    .from('teacher_subjects')
    .select(`
      id,
      classes(id, nama, class_levels(nama)),
      subjects(id, nama)
    `)
    .eq('id', id)
    .single()

  if (!assignment) notFound()

  const kelas = (assignment as any).classes
  const mapel = (assignment as any).subjects

  const { data: siswa } = await supabase
    .from('students')
    .select('id, nis, nama')
    .eq('class_id', kelas?.id)
    .order('nama')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/nilai"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke Nilai
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          Input Nilai — {mapel?.nama}
        </h1>
        <p className="text-sm text-gray-500">
          Kelas {kelas?.nama} ({kelas?.class_levels?.nama}) • {siswa?.length ?? 0}{' '}
          siswa
        </p>
      </div>

      {siswa && siswa.length > 0 ? (
        <ImportForm
          assignmentId={id}
          kelasNama={kelas?.nama ?? ''}
          mapelNama={mapel?.nama ?? ''}
          siswa={siswa}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm">
          ⚠️ Kelas ini belum ada siswanya. Import siswa dulu di menu{' '}
          <Link href="/dashboard/siswa" className="underline font-medium">
            Siswa
          </Link>
          .
        </div>
      )}
    </div>
  )
}