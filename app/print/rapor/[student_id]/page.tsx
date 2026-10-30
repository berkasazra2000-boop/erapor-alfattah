// app/print/rapor/[student_id]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'

export const dynamic = 'force-dynamic'

// ✅ 1. Ini untuk mengubah Judul di Tab Browser / PDF
export async function generateMetadata({
  params,
}: {
  params: Promise<{ student_id: string }>
}): Promise<Metadata> {
  const { student_id } = await params
  const data = await getRaporData(student_id)

  if (!data) return { title: 'Cetak Rapor' }

  return {
    title: `Rapor - ${data.siswa.nama}`, // Hasilnya: "Rapor - Alfino Ahmad Faridho"
  }
}

// 2. Ini komponen utama halamannya
export default async function PrintRaporPage({
  params,
}: {
  params: Promise<{ student_id: string }>
}) {
  const { student_id } = await params
  const data = await getRaporData(student_id)

  if (!data) notFound()

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
      hideIdentitas={true}
    />
  )
}