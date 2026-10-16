// app/dashboard/legger/[class_id]/ExportButton.tsx
'use client'

import * as XLSX from 'xlsx'

type Mapel = { subject_id: string; nama: string; kategori: string }
type Row = {
  no: number
  id: string
  nama: string
  nis: string
  nisn: string
  nilai: Record<string, number | null>
  jumlah: number
  rata: number
  rank: number
}

export default function ExportButton({
  kelasNama,
  mapelList,
  rows,
}: {
  kelasNama: string
  mapelList: Mapel[]
  rows: Row[]
}) {
  function handleExport() {
    // ===== SHEET 1: LEGGER =====
    const header: Record<string, string> = {
      No: 'No',
      Nama: 'Nama',
      NIS: 'NIS',
      NISN: 'NISN',
    }
    mapelList.forEach((m) => {
      header[m.subject_id] = m.nama
    })
    header['Jumlah'] = 'Jumlah'
    header['Rata'] = 'Rata-rata'
    header['Rank'] = 'Peringkat'

    const leggerRows = rows.map((r) => {
      const obj: Record<string, any> = {
        No: r.no,
        Nama: r.nama,
        NIS: r.nis,
        NISN: r.nisn,
      }
      mapelList.forEach((m) => {
        obj[m.subject_id] = r.nilai[m.subject_id] ?? ''
      })
      obj['Jumlah'] = r.jumlah
      obj['Rata'] = Number(r.rata.toFixed(2))
      obj['Rank'] = r.rank
      return obj
    })

    const ws1 = XLSX.utils.json_to_sheet(leggerRows, {
      header: Object.keys(header),
    })

    // Set header text pakai mapel nama (bukan subject_id)
    const keys = Object.keys(header)
    keys.forEach((key, idx) => {
      const cellRef = XLSX.utils.encode_cell({ c: idx, r: 0 })
      if (ws1[cellRef]) {
        ws1[cellRef].v = header[key]
      }
    })

    // Lebar kolom
    ws1['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 10 },
      { wch: 12 },
      ...mapelList.map(() => ({ wch: 15 })),
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
    ]

    // ===== SHEET 2: RANKING =====
    const rankingRows = [...rows]
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({
        Peringkat: r.rank,
        Nama: r.nama,
        NIS: r.nis,
        'Rata-rata': Number(r.rata.toFixed(2)),
        Jumlah: r.jumlah,
      }))

    const ws2 = XLSX.utils.json_to_sheet(rankingRows)
    ws2['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
    ]

    // ===== BUILD WORKBOOK =====
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws1, 'Legger')
    XLSX.utils.book_append_sheet(wb, ws2, 'Ranking')

    const safeName = kelasNama.replace(/[^a-zA-Z0-9]/g, '-')
    XLSX.writeFile(wb, `legger-kelas-${safeName}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all shrink-0"
      style={{ fontFamily: 'var(--font-jakarta)' }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Export Excel
    </button>
  )
}