// app/dashboard/nilai/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
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
    .select(`id, classes(id, nama, class_levels(nama)), subjects(id, nama)`)
    .eq('id', id)
    .single()

  if (!assignment) notFound()

  const kelas = (assignment as any).classes
  const mapel = (assignment as any).subjects

  const { data: siswa } = await supabase
    .from('students').select('id, nis, nama').eq('class_id', kelas?.id).order('nama')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/nilai"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Kembali ke Daftar Nilai
        </Link>
      </div>

      <PageHeader
        title={mapel?.nama ?? 'Input Nilai'}
        subtitle={`Kelas ${kelas?.nama} · ${kelas?.class_levels?.nama} · ${siswa?.length ?? 0} siswa`}
        badge="Input Nilai"
      />

      {siswa && siswa.length > 0 ? (
        <ImportForm
          assignmentId={id}
          kelasNama={kelas?.nama ?? ''}
          mapelNama={mapel?.nama ?? ''}
          siswa={siswa}
        />
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-sm flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
          <div>
            Kelas ini belum ada siswanya. Import siswa dulu di menu{' '}
            <Link href="/dashboard/siswa" className="underline font-semibold">Siswa</Link>.
          </div>
        </div>
      )}
    </div>
  )
}