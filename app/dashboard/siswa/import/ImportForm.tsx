// app/dashboard/siswa/import/ImportForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { importSiswa } from './actions'

type Kelas = { id: string; nama: string }

type ParsedRow = {
  nama: string
  nis: string
  nisn: string
  kelas_nama: string
  class_id: string
  valid: boolean
}

export default function ImportForm({ kelas }: { kelas: Kelas[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function downloadTemplate() {
    const contoh = [
      { Nama: 'Ahmad Fauzi', NIS: '1001', NISN: '0012345678', Kelas: 'X-1' },
      { Nama: 'Siti Aminah', NIS: '1002', NISN: '0012345679', Kelas: 'X-1' },
    ]
    const ws = XLSX.utils.json_to_sheet(contoh)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa')
    XLSX.writeFile(wb, 'template-import-siswa.xlsx')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setRows([])

    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<any>(ws)

      if (json.length === 0) {
        return setError('File kosong atau tidak ada data')
      }

      const mapped: ParsedRow[] = json.map((r) => {
        const kelasNama = String(r.Kelas ?? '').trim()
        const kls = kelas.find((k) => k.nama === kelasNama)
        const nama = String(r.Nama ?? '').trim()

        return {
          nama,
          nis: String(r.NIS ?? '').trim(),
          nisn: String(r.NISN ?? '').trim(),
          kelas_nama: kelasNama,
          class_id: kls?.id ?? '',
          valid: !!nama && !!kls,
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
      return setError(
        `${invalid.length} baris tidak valid. Cek nama kosong atau kelas tidak cocok.`
      )
    }

    setLoading(true)
    const result = await importSiswa(
      rows.map((r) => ({
        nama: r.nama,
        nis: r.nis,
        nisn: r.nisn,
        class_id: r.class_id,
      }))
    )
    setLoading(false)

    if (result.error) return setError(result.error)

    alert(`✅ Berhasil import ${result.count} siswa`)
    router.push('/dashboard/siswa')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-3">1. Download Template</h2>
        <p className="text-sm text-gray-600 mb-3">
          Kolom: <b>Nama</b>, <b>NIS</b>, <b>NISN</b>, <b>Kelas</b>. Nama kelas harus
          persis: X-1, X-2, XI-1, XI-2, XII-1, XII-2.
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Download Template
        </button>
      </div>

      {/* Step 2 */}
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

      {/* Preview */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <span className="font-medium">
              Preview — {rows.length} baris (
              {rows.filter((r) => r.valid).length} valid)
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
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">NIS</th>
                  <th className="text-left px-3 py-2">NISN</th>
                  <th className="text-left px-3 py-2">Kelas</th>
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
                    <td className="px-3 py-2">{r.nama || '-'}</td>
                    <td className="px-3 py-2">{r.nis || '-'}</td>
                    <td className="px-3 py-2">{r.nisn || '-'}</td>
                    <td className="px-3 py-2">{r.kelas_nama || '-'}</td>
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <span className="text-green-600 text-xs font-medium">
                          ✓ OK
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">
                          ✗ Error
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