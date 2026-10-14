// app/print/rapor/kelas/[class_id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'

export const dynamic = 'force-dynamic'

export default async function PrintRaporKelasPage({
  params,
}: {
  params: Promise<{ class_id: string }>
}) {
  const { class_id } = await params
  const supabase = await createClient()

  const { data: siswaList } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', class_id)
    .order('nama')

  if (!siswaList || siswaList.length === 0) notFound()

  const allData = await Promise.all(siswaList.map((s) => getRaporData(s.id)))

  const validData = allData.filter(
    (d): d is NonNullable<typeof d> => d !== null
  )

  return (
    <>
      {validData.map((data, i) => (
        <div
          key={i}
          className="rapor-bulk-item"
          style={{
            pageBreakAfter: i === validData.length - 1 ? 'auto' : 'always',
          }}
        >
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
      ))}
    </>
  )
}