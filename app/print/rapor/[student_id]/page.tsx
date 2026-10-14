// app/print/rapor/[student_id]/page.tsx
import { notFound } from 'next/navigation'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'

export const dynamic = 'force-dynamic'

export default async function PrintRaporPage({
  params,
  searchParams,
}: {
  params: Promise<{ student_id: string }>
  searchParams: Promise<{ bulk?: string }>
}) {
  const { student_id } = await params
  const { bulk } = await searchParams
  const data = await getRaporData(student_id)

  if (!data) notFound()

  // bulk=1 → tampilkan identitas di body (untuk bulk print)
  // default → sembunyikan identitas (untuk single PDF, identitas dari Puppeteer header)
  const isBulk = bulk === '1'

  return (
    <RaporContent
      sekolah={data.sekolah}
      siswa={data.siswa}
      tahun={data.tahun}
      mapel={data.mapel as any}
      ekskul={data.ekskul}
      absensi={data.absensi}
      catatan={data.catatan}
      waliKelas={data.waliKelas}
      hideIdentitas={!isBulk}
    />
  )
}