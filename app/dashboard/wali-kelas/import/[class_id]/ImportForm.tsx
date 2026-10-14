// app/dashboard/wali-kelas/import/[class_id]/ImportForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { importWaliKelas } from './actions'

type Siswa = { id: string; nis: string | null; nama: string }
type EkskulItem = { nama: string; predikat: string; keterangan: string }

type ParsedRow = {
  student_id: string
  nis: string
  nama: string
  ekskul: EkskulItem[]
  sakit: number
  izin: number
  alpha: number
  catatan: string
  valid: boolean
  catatanErr: string
}

const Icon = {
  Download: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
}

export default function ImportForm({
  classId,
  kelasNama,
  siswa,
}: {
  classId: string
  kelasNama: string
  siswa: Siswa[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function downloadTemplate() {
    const ekskulData = siswa.map((s) => ({
      NIS: s.nis ?? '',
      Nama: s.nama,
      Ekskul1: '',
      Predikat1: '',
      Keterangan1: '',
      Ekskul2: '',
      Predikat2: '',
      Keterangan2: '',
      Ekskul3: '',
      Predikat3: '',
      Keterangan3: '',
    }))

    const absensiData = siswa.map((s) => ({
      NIS: s.nis ?? '',
      Nama: s.nama,
      Sakit: 0,
      Izin: 0,
      Alpha: 0,
      Catatan: '',
    }))

    const ws1 = XLSX.utils.json_to_sheet(ekskulData)
    const ws2 = XLSX.utils.json_to_sheet(absensiData)

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws1, 'Ekskul')
    XLSX.utils.book_append_sheet(wb, ws2, 'Absensi-Catatan')

    XLSX.writeFile(wb, `wali-kelas-${kelasNama}.xlsx`)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setRows([])

    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)

      const wsEkskul = wb.Sheets['Ekskul']
      const wsAbsen = wb.Sheets['Absensi-Catatan']

      if (!wsEkskul && !wsAbsen) {
        return setError('Sheet "Ekskul" atau "Absensi-Catatan" tidak ditemukan.')
      }

      const jsonEkskul = wsEkskul ? XLSX.utils.sheet_to_json<any>(wsEkskul) : []
      const jsonAbsen = wsAbsen ? XLSX.utils.sheet_to_json<any>(wsAbsen) : []

      const absenMap: Record<string, any> = {}
      jsonAbsen.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (nis) absenMap[nis] = r
      })

      const allNis = new Set<string>()
      jsonEkskul.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (nis) allNis.add(nis)
      })
      jsonAbsen.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (nis) allNis.add(nis)
      })

      const mapped: ParsedRow[] = Array.from(allNis).map((nis) => {
        const ekskulRow = jsonEkskul.find(
          (r) => String(r.NIS ?? '').trim() === nis
        )
        const absenRow = absenMap[nis]

        const ekskul: EkskulItem[] = []
        if (ekskulRow) {
          const ekskulKeys = Object.keys(ekskulRow)
            .filter((k) => /^Ekskul\d+$/i.test(k))
            .sort(
              (a, b) =>
                parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
            )

          ekskulKeys.forEach((key) => {
            const idx = key.replace(/\D/g, '')
            const nama = String(ekskulRow[key] ?? '').trim()
            if (nama) {
              ekskul.push({
                nama,
                predikat: String(ekskulRow[`Predikat${idx}`] ?? '').trim(),
                keterangan: String(ekskulRow[`Keterangan${idx}`] ?? '').trim(),
              })
            }
          })
        }

        const siswaMatch = siswa.find((s) => s.nis === nis)

        let catatanErr = ''
        let valid = true

        if (!nis) {
          catatanErr = 'NIS kosong'
          valid = false
        } else if (!siswaMatch) {
          catatanErr = 'NIS tidak ada di kelas ini'
          valid = false
        }

        return {
          student_id: siswaMatch?.id ?? '',
          nis,
          nama:
            siswaMatch?.nama ??
            String(ekskulRow?.Nama ?? absenRow?.Nama ?? ''),
          ekskul,
          sakit: parseInt(absenRow?.Sakit ?? 0) || 0,
          izin: parseInt(absenRow?.Izin ?? 0) || 0,
          alpha: parseInt(absenRow?.Alpha ?? 0) || 0,
          catatan: String(absenRow?.Catatan ?? '').trim(),
          valid,
          catatanErr,
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
    if (invalid.length > 0) {
      return setError(`${invalid.length} baris tidak valid.`)
    }

    setLoading(true)
    const result = await importWaliKelas(
      classId,
      rows.map((r) => ({
        student_id: r.student_id,
        ekskul: r.ekskul,
        sakit: r.sakit,
        izin: r.izin,
        alpha: r.alpha,
        catatan: r.catatan,
      }))
    )
    setLoading(false)

    if (result.error) return setError(result.error)

    alert(`✅ Berhasil import ${result.count} siswa`)
    router.push('/dashboard/wali-kelas')
    router.refresh()
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  return (
    <div className="space-y-5">
      {/* STEP 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold" style={{ fontFamily: 'var(--font-jakarta)' }}>
            1
          </div>
          <div className="flex-1">
            <div
              className="font-bold text-slate-900 mb-1"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              Download Template
            </div>
            <p className="text-sm text-slate-500 mb-4">
              File berisi <b>2 sheet</b>:
              <br />• <b>Ekskul</b> — NIS, Nama, Ekskul1, Predikat1, Keterangan1, Ekskul2, ...
              <br />• <b>Absensi-Catatan</b> — NIS, Nama, Sakit, Izin, Alpha, Catatan
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {Icon.Download}
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold" style={{ fontFamily: 'var(--font-jakarta)' }}>
            2
          </div>
          <div className="flex-1">
            <div
              className="font-bold text-slate-900 mb-1"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              Upload File
            </div>
            <p className="text-sm text-slate-500 mb-4">
              File Excel yang sudah diisi ekskul, absensi, dan catatan
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="block w-full text-sm border border-dashed border-slate-300 rounded-xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{Icon.Alert}</div>
          <div>{error}</div>
        </div>
      )}

      {/* PREVIEW */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div
                className="font-bold text-slate-900"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Preview Data
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">
                  {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="text-red-600 font-semibold ml-2">
                    {invalidCount} error
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-50 transition-all"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  {Icon.Check}
                  Import Sekarang
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    NIS
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ekskul
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S / I / A
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-50 ${
                      r.valid ? '' : 'bg-red-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {r.nis}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {r.nama}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {r.ekskul.length > 0
                        ? r.ekskul.map((e) => e.nama).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                      {r.sakit} / {r.izin} / {r.alpha}
                    </td>
                    <td className="px-4 py-3">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">
                          {r.catatanErr}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INFO FILE FORMAT */}
      {rows.length === 0 && !error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl text-xs flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div>
            <b>Tips:</b> Isi hanya kolom yang perlu. Kolom kosong akan dilewati otomatis. Bisa tambah kolom <b>Ekskul4</b>, <b>Ekskul5</b>, dst — sistem deteksi otomatis.
          </div>
        </div>
      )}
    </div>
  )
}