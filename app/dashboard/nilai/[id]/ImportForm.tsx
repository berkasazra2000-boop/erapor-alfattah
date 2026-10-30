// app/dashboard/nilai/[id]/ImportForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { simpanNilai } from './actions'

type Siswa = { id: string; nis: string | null; nama: string }
type ParsedRow = {
  student_id: string
  nis: string
  nama: string
  nilai_angka: number | null
  capaian_kompetensi: string
  valid: boolean
  catatan: string
}

const Icon = {
  Download: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>),
  Check: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
}

export default function ImportForm({
  assignmentId,
  kelasNama,
  mapelNama,
  siswa,
}: {
  assignmentId: string
  kelasNama: string
  mapelNama: string
  siswa: Siswa[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function downloadTemplate() {
    const nilaiData = siswa.map((s) => ({ NIS: s.nis ?? '', Nama: s.nama, Nilai: '' }))
    
    // ✅ Ganti CP1, CP2, CP3 menjadi Materi1, Materi2, Materi3
    const materiData = siswa.map((s) => ({ 
      NIS: s.nis ?? '', 
      Nama: s.nama, 
      Materi1: '', 
      Materi2: '', 
      Materi3: ''  
    }))
    
    const ws1 = XLSX.utils.json_to_sheet(nilaiData)
    const ws2 = XLSX.utils.json_to_sheet(materiData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws1, 'Nilai')
    XLSX.utils.book_append_sheet(wb, ws2, 'Materi') // ✅ Nama Sheet jadi Materi
    XLSX.writeFile(wb, `nilai-${kelasNama}-${mapelNama}.xlsx`)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setRows([])
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)
      const wsNilai = wb.Sheets['Nilai']
      
      // ✅ Baca Sheet 'Materi' (sebelumnya 'CP')
      const wsMateri = wb.Sheets['Materi']

      if (!wsNilai) return setError('Sheet "Nilai" tidak ditemukan.')

      const jsonNilai = XLSX.utils.sheet_to_json<any>(wsNilai)
      const jsonMateri = wsMateri ? XLSX.utils.sheet_to_json<any>(wsMateri) : []

      const materiByNis: Record<string, string[]> = {}
      jsonMateri.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (!nis) return
        
        // ✅ Cari kolom Materi1, Materi2, dst
        const materiKeys = Object.keys(r)
          .filter((k) => /^Materi\d+$/i.test(k))
          .sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))
          
        const materiArray = materiKeys
          .map((k) => String(r[k] ?? '').trim())
          .filter((v) => v.length > 0)

        materiByNis[nis] = materiArray
      })

      const mapped: ParsedRow[] = jsonNilai.map((r) => {
        const nis = String(r.NIS ?? '').trim()
        const nilaiRaw = r.Nilai
        const nilai = nilaiRaw === '' || nilaiRaw == null ? null : Number(nilaiRaw)
        const siswaMatch = siswa.find((s) => s.nis === nis)

        let catatan = ''
        let valid = true
        if (!nis) { catatan = 'NIS kosong'; valid = false }
        else if (!siswaMatch) { catatan = 'NIS tidak ditemukan'; valid = false }
        else if (nilai !== null && (isNaN(nilai) || nilai < 0 || nilai > 100)) { catatan = 'Nilai tidak valid'; valid = false }

        // ✅ LOGIKA PREDIKAT OTOMATIS
        let predikat = ''
        if (nilai !== null) {
          if (nilai >= 88) predikat = 'Sangat Baik'
          else if (nilai >= 75) predikat = 'Baik'
          else if (nilai >= 62) predikat = 'Cukup'
          else predikat = 'Kurang'
        }

        let finalCp = ''
        const materiSiswa = materiByNis[nis] || []

        if (materiSiswa.length > 0 && nilai !== null) {
          finalCp = materiSiswa
            .map((materi) => `Murid menunjukkan capaian ${predikat} dalam menguasai materi ${materi}.`)
            .join(' ')
        } else if (nilai !== null) {
          finalCp = `Murid menunjukkan capaian ${predikat} dalam menguasai materi mata pelajaran ini.`
        }

        return {
          student_id: siswaMatch?.id ?? '',
          nis, nama: siswaMatch?.nama ?? String(r.Nama ?? ''),
          nilai_angka: nilai,
          capaian_kompetensi: finalCp,
          valid, catatan,
        }
      })
      setRows(mapped)
    } catch (err: any) {
      setError('Gagal baca file: ' + (err.message ?? 'unknown'))
    }
  }

  async function handleSubmit() {
    setError('')
    const invalid = rows.filter((r) => !r.valid)
    if (invalid.length > 0) return setError(`${invalid.length} baris tidak valid.`)
    setLoading(true)
    const result = await simpanNilai(
      assignmentId,
      rows.map((r) => ({ student_id: r.student_id, nilai_angka: r.nilai_angka, capaian_kompetensi: r.capaian_kompetensi }))
    )
    setLoading(false)
    if (result.error) return setError(result.error)
    alert(`✅ Berhasil simpan ${result.count} nilai`)
    router.push('/dashboard/nilai')
    router.refresh()
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">1</div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>Download Template</div>
            <p className="text-sm text-slate-500 mb-4">
              File berisi 2 sheet: <b>Nilai</b> (NIS, Nama, Nilai) dan <b>Materi</b> (NIS, Nama, Materi1, Materi2, Materi3). <br/>
              <span className="text-emerald-600 font-medium">Di Sheet Materi, guru cukup mengetik NAMA MATERI (contoh: Aljabar, Geometri). Sistem akan otomatis membuat kalimat deskripsinya.</span>
            </p>
            <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {Icon.Download} Download Template
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">2</div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>Upload File</div>
            <p className="text-sm text-slate-500 mb-4">File Excel yang sudah diisi nilai dan materi pokoknya</p>
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="block w-full text-sm border border-dashed border-slate-300 rounded-xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
          <div className="shrink-0 mt-0.5">⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>Preview Data</div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">{validCount} valid</span>
                {invalidCount > 0 && <span className="text-red-600 font-semibold ml-2">{invalidCount} error</span>}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-50 transition-all" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {loading ? 'Menyimpan...' : <>{Icon.Check} Simpan Nilai</>}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi Otomatis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b border-slate-50 ${r.valid ? '' : 'bg-red-50/50'}`}>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{r.nis}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.nama}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.nilai_angka ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 min-w-[300px]">{r.capaian_kompetensi || '—'}</td>
                    <td className="px-4 py-3">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">{r.catatan}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}