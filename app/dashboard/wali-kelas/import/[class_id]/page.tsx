// app/dashboard/wali-kelas/import/[class_id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
      <div className="mb-6">
        <Link
          href="/dashboard/wali-kelas"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke Wali Kelas
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          Import Wali Kelas — {kelas.nama}
        </h1>
        <p className="text-sm text-gray-500">
          Kelas {kelas.nama} ({(kelas as any).class_levels?.nama}) •{' '}
          {siswa?.length ?? 0} siswa
        </p>
      </div>

      {siswa && siswa.length > 0 ? (
        <ImportForm
          classId={class_id}
          kelasNama={kelas.nama}
          siswa={siswa}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm">
          ⚠️ Kelas ini belum ada siswanya.
        </div>
      )}
    </div>
  )
}