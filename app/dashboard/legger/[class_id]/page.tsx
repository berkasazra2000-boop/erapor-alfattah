// app/dashboard/legger/[class_id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import ExportButton from './ExportButton'

export default async function LeggerDetailPage({
  params,
}: {
  params: Promise<{ class_id: string }>
}) {
  const { class_id } = await params
  const supabase = await createClient()

  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_level_id, class_levels(nama)')
    .eq('id', class_id)
    .single()

  if (!kelas) notFound()

  // Mapel urut sesuai class_level_subjects
  const { data: mapelMapping } = await supabase
    .from('class_level_subjects')
    .select('subject_id, kategori, urutan, subjects(nama)')
    .eq('class_level_id', kelas.class_level_id)
    .order('urutan')

  const mapelList = (mapelMapping ?? []).map((m: any) => ({
    subject_id: m.subject_id,
    nama: m.subjects?.nama,
    kategori: m.kategori,
  }))

  // Siswa kelas ini
  const { data: siswaList } = await supabase
    .from('students')
    .select('id, nama, nis, nisn')
    .eq('class_id', class_id)
    .order('nama')

  const siswa = siswaList ?? []
  const studentIds = siswa.map((s) => s.id)

  // Nilai semua siswa
  const { data: grades } = studentIds.length > 0
    ? await supabase
        .from('student_grades')
        .select('student_id, subject_id, nilai_angka')
        .in('student_id', studentIds)
    : { data: [] }

  const gradeMap = new Map<string, number | null>()
  ;(grades ?? []).forEach((g: any) => {
    gradeMap.set(`${g.student_id}-${g.subject_id}`, g.nilai_angka)
  })

  // Build rows
  const rows = siswa.map((s, idx) => {
    const nilai: Record<string, number | null> = {}
    let sum = 0
    let count = 0

    mapelList.forEach((m) => {
      const val = gradeMap.get(`${s.id}-${m.subject_id}`) ?? null
      nilai[m.subject_id] = val
      if (val !== null && val !== undefined) {
        sum += val
        count++
      }
    })

    const rata = count > 0 ? sum / count : 0

    return {
      no: idx + 1,
      id: s.id,
      nama: s.nama,
      nis: s.nis ?? '-',
      nisn: s.nisn ?? '-',
      nilai,
      jumlah: sum,
      rata,
    }
  })

  // Rank by rata (descending)
  const sortedByRata = [...rows].sort((a, b) => b.rata - a.rata)
  const rankMap = new Map<string, number>()
  sortedByRata.forEach((r, i) => {
    rankMap.set(r.id, i + 1)
  })

  const finalRows = rows.map((r) => ({
    ...r,
    rank: rankMap.get(r.id) ?? 0,
  }))

  return (
    <div>
      <div className="no-print mb-4">
        <Link
          href="/dashboard/legger"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar Kelas
        </Link>
      </div>

      <div className="no-print flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <PageHeader
          title={`Legger Kelas ${kelas.nama}`}
          subtitle={`Tingkat ${(kelas as any).class_levels?.nama} · ${siswa.length} siswa · ${mapelList.length} mapel`}
          badge="Rekap Nilai"
        />
        <ExportButton
          kelasNama={kelas.nama}
          mapelList={mapelList}
          rows={finalRows}
        />
      </div>

      {siswa.length === 0 ? (
        <Card>
          <div className="p-16 text-center text-slate-500">
            Belum ada siswa di kelas ini
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-700 sticky left-0 bg-slate-100 z-10">
                    No
                  </th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold text-slate-700 min-w-[140px]">
                    Nama
                  </th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold text-slate-700">
                    NIS
                  </th>
                  <th className="border border-slate-200 px-2 py-2 text-left font-semibold text-slate-700">
                    NISN
                  </th>
                  {mapelList.map((m) => (
                    <th
                      key={m.subject_id}
                      className="border border-slate-200 px-1.5 py-2 text-center font-semibold text-slate-700 min-w-[70px] align-bottom"
                      title={m.nama}
                    >
                      <div className="text-[10px] leading-tight">{m.nama}</div>
                    </th>
                  ))}
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-800 bg-amber-50">
                    Jumlah
                  </th>
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-800 bg-amber-50">
                    Rata-rata
                  </th>
                  <th className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-800 bg-emerald-50">
                    Peringkat
                  </th>
                </tr>
              </thead>
              <tbody>
                {finalRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="border border-slate-200 px-2 py-1.5 text-center text-slate-500 sticky left-0 bg-white">
                      {r.no}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-medium text-slate-900">
                      {r.nama}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-600 font-mono">
                      {r.nis}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-600 font-mono">
                      {r.nisn}
                    </td>
                    {mapelList.map((m) => {
                      const val = r.nilai[m.subject_id]
                      return (
                        <td
                          key={m.subject_id}
                          className={`border border-slate-200 px-1.5 py-1.5 text-center ${
                            val === null ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {val ?? '-'}
                        </td>
                      )
                    })}
                    <td className="border border-slate-200 px-2 py-1.5 text-center font-semibold text-amber-800 bg-amber-50/50">
                      {r.jumlah}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-center font-semibold text-amber-800 bg-amber-50/50">
                      {r.rata.toFixed(2)}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-center font-bold bg-emerald-50/50">
                      {r.rank === 1 ? '🥇 1' : r.rank === 2 ? '🥈 2' : r.rank === 3 ? '🥉 3' : r.rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Catatan */}
      <div className="no-print mt-4 text-xs text-slate-500">
        💡 <b>Tips:</b> Scroll ke kanan untuk melihat semua kolom mapel. Klik <b>Export Excel</b> untuk download dalam format Excel.
      </div>
    </div>
  )
}