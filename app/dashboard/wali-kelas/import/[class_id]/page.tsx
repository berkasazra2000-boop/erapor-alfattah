// app/dashboard/wali-kelas/import/[class_id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ImportForm from './ImportForm'

export default async function ImportWaliKelasPage({
  params,
}: {
  params: Promise<{ class_id: string }>
}) {
  const { class_id } = await params
  const supabase = await createClient()

  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_levels(nama)')
    .eq('id', class_id)
    .single()

  if (!kelas) notFound()

  const { data: siswa } = await supabase
    .from('students')
    .select('id, nis, nama')
    .eq('class_id', class_id)
    .order('nama')

  return (
    <div>
      <Link
        href="/dashboard/wali-kelas"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors mb-3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar
      </Link>

      <PageHeader
        title={`Import Wali Kelas — ${kelas.nama}`}
        subtitle={`Tingkat ${(kelas as any).class_levels?.nama} · ${siswa?.length ?? 0} siswa`}
        badge="Bulk Input"
      />

      {siswa && siswa.length > 0 ? (
        <ImportForm
          classId={class_id}
          kelasNama={kelas.nama}
          siswa={siswa}
        />
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-sm flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <div>Kelas ini belum ada siswanya. Import siswa dulu di menu <Link href="/dashboard/siswa" className="underline font-semibold">Siswa</Link>.</div>
        </div>
      )}
    </div>
  )
}