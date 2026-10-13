// app/dashboard/rapor/[student_id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'
import PrintButton from './PrintButton'

export default async function RaporDetailPage({
  params,
}: {
  params: Promise<{ student_id: string }>
}) {
  const { student_id } = await params
  const data = await getRaporData(student_id)

  if (!data) notFound()

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/rapor"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold mt-1">Preview Rapor</h1>
          <p className="text-sm text-gray-500">
            {data.siswa.nama} — Kelas {data.siswa.kelas}
          </p>
        </div>
        <PrintButton studentId={student_id} />
      </div>

      <RaporContent
        sekolah={data.sekolah}
        siswa={data.siswa}
        tahun={data.tahun}
        mapel={data.mapel as any}
        ekskul={data.ekskul}
        absensi={data.absensi}
        catatan={data.catatan}
        waliKelas={data.waliKelas}
      />
    </div>
  )
}