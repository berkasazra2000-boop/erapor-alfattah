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
    // Sheet 1: Nilai
    const nilaiData = siswa.map((s) => ({
      NIS: s.nis ?? '',
      Nama: s.nama,
      Nilai: '',
    }))

    // Sheet 2: CP — contoh 3 kolom, guru bisa tambah CP4, CP5, dst
    const cpData = siswa.map((s) => ({
      NIS: s.nis ?? '',
      Nama: s.nama,
      CP1: '',
      CP2: '',
      CP3: '',
    }))

    const ws1 = XLSX.utils.json_to_sheet(nilaiData)
    const ws2 = XLSX.utils.json_to_sheet(cpData)

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws1, 'Nilai')
    XLSX.utils.book_append_sheet(wb, ws2, 'CP')

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
      const wsCP = wb.Sheets['CP']

      if (!wsNilai) {
        return setError('Sheet "Nilai" tidak ditemukan di file Excel.')
      }

      const jsonNilai = XLSX.utils.sheet_to_json<any>(wsNilai)
      const jsonCP = wsCP ? XLSX.utils.sheet_to_json<any>(wsCP) : []

      // Mapping NIS → CP gabungan
      const cpByNis: Record<string, string> = {}
      jsonCP.forEach((r) => {
        const nis = String(r.NIS ?? '').trim()
        if (!nis) return

        // Deteksi kolom CP1, CP2, ... CP10 (urutan by angka)
        const cpKeys = Object.keys(r)
          .filter((k) => /^CP\d+$/i.test(k))
          .sort(
            (a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
          )

        const cps = cpKeys
          .map((k) => String(r[k] ?? '').trim())
          .filter((v) => v.length > 0)

        const gabung = cps
          .map((c) => (c.endsWith('.') ? c : c + '.'))
          .join(' ')

        cpByNis[nis] = gabung
      })

      const mapped: ParsedRow[] = jsonNilai.map((r) => {
        const nis = String(r.NIS ?? '').trim()
        const nilaiRaw = r.Nilai
        const nilai =
          nilaiRaw === '' || nilaiRaw === null || nilaiRaw === undefined
            ? null
            : Number(nilaiRaw)

        const siswaMatch = siswa.find((s) => s.nis === nis)

        let catatan = ''
        let valid = true

        if (!nis) {
          catatan = 'NIS kosong'
          valid = false
        } else if (!siswaMatch) {
          catatan = 'NIS tidak ditemukan di kelas ini'
          valid = false
        } else if (nilai !== null && (isNaN(nilai) || nilai < 0 || nilai > 100)) {
          catatan = 'Nilai tidak valid (0-100)'
          valid = false
        }

        return {
          student_id: siswaMatch?.id ?? '',
          nis,
          nama: siswaMatch?.nama ?? String(r.Nama ?? ''),
          nilai_angka: nilai,
          capaian_kompetensi: cpByNis[nis] ?? '',
          valid,
          catatan,
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
    const result = await simpanNilai(
      assignmentId,
      rows.map((r) => ({
        student_id: r.student_id,
        nilai_angka: r.nilai_angka,
        capaian_kompetensi: r.capaian_kompetensi,
      }))
    )
    setLoading(false)

    if (result.error) return setError(result.error)

    alert(`✅ Berhasil simpan ${result.count} nilai`)
    router.push('/dashboard/nilai')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-3">1. Download Template</h2>
        <p className="text-sm text-gray-600 mb-3">
          File berisi 2 sheet:
          <br />• <b>Nilai</b> — kolom: NIS, Nama, Nilai
          <br />• <b>CP</b> — kolom: NIS, Nama, CP1, CP2, CP3, ... (bisa tambah CP4, CP5
          dst)
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Download Template
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-3">2. Upload File yang Sudah Diisi</h2>
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
              {loading ? 'Menyimpan...' : '✅ Simpan Nilai'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">NIS</th>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Nilai</th>
                  <th className="text-left px-3 py-2">CP (gabungan)</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b ${r.valid ? '' : 'bg-red-50'}`}
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.nis}</td>
                    <td className="px-3 py-2">{r.nama}</td>
                    <td className="px-3 py-2">{r.nilai_angka ?? '-'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-md truncate">
                      {r.capaian_kompetensi || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <span className="text-green-600 text-xs font-medium">
                          ✓ OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">
                          ✗ {r.catatan}
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