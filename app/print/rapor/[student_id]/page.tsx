// app/print/rapor/[student_id]/page.tsx
import { notFound } from 'next/navigation'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'

export const dynamic = 'force-dynamic'

export default async function PrintRaporPage({
  params,
}: {
  params: Promise<{ student_id: string }>
}) {
  const { student_id } = await params
  const data = await getRaporData(student_id)

  if (!data) notFound()

  return (
    <div style={{ background: 'white', padding: 0, margin: 0 }}>
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