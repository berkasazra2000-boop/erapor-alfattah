// app/dashboard/wali-kelas/import/[class_id]/ImportForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { importWaliKelas } from './actions'

type Siswa = { id: string; nis: string; nama: string }

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
    // Sheet 1: Ekskul
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

    // Sheet 2: Absensi & Catatan
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

      // Map NIS → data absen+catatan
      const absenMap: Record<string, any> = {}
      jsonAbsen.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (nis) absenMap[nis] = r
      })

      // Gabung semua NIS dari kedua sheet
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

        // Deteksi kolom Ekskul1..EkskulN
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
          nama: siswaMatch?.nama ?? String(ekskulRow?.Nama ?? absenRow?.Nama ?? ''),
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
      return setError(`${invalid.length} baris tidak valid. Cek kolom "Catatan".`)
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-3">1. Download Template</h2>
        <p className="text-sm text-gray-600 mb-3">
          File berisi <b>2 sheet</b>:
          <br />• <b>Ekskul</b> — NIS, Nama, Ekskul1, Predikat1, Keterangan1, Ekskul2, ...
          <br />• <b>Absensi-Catatan</b> — NIS, Nama, Sakit, Izin, Alpha, Catatan
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Download Template
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-3">2. Upload File Excel</h2>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="block w-full text-sm border rounded p-2"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <span className="font-medium">
              Preview — {rows.length} siswa ({rows.filter((r) => r.valid).length}{' '}
              valid)
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : '✅ Import Sekarang'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">NIS</th>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Ekskul</th>
                  <th className="text-left px-3 py-2">S/I/A</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b ${r.valid ? '' : 'bg-red-50'}`}>
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.nis}</td>
                    <td className="px-3 py-2">{r.nama}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.ekskul.length > 0
                        ? r.ekskul.map((e) => e.nama).join(', ')
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.sakit}/{r.izin}/{r.alpha}
                    </td>
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <span className="text-green-600 text-xs font-medium">
                          ✓ OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">
                          ✗ {r.catatanErr}
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
    </div>
  )
}