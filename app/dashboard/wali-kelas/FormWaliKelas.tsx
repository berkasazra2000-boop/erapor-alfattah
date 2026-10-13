// app/dashboard/wali-kelas/FormWaliKelas.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { simpanWaliKelas } from './actions'

type EkskulRow = { nama: string; predikat: string; keterangan: string }

type Props = {
  studentId: string
  initial: {
    ekskul: EkskulRow[]
    sakit: number
    izin: number
    alpha: number
    catatan: string
  }
}

export default function FormWaliKelas({ studentId, initial }: Props) {
  const router = useRouter()
  const [ekskul, setEkskul] = useState<EkskulRow[]>(
    initial.ekskul.length > 0
      ? initial.ekskul
      : [{ nama: '', predikat: '', keterangan: '' }]
  )
  const [sakit, setSakit] = useState(initial.sakit)
  const [izin, setIzin] = useState(initial.izin)
  const [alpha, setAlpha] = useState(initial.alpha)
  const [catatan, setCatatan] = useState(initial.catatan)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function addEkskul() {
    setEkskul([...ekskul, { nama: '', predikat: '', keterangan: '' }])
  }

  function removeEkskul(idx: number) {
    setEkskul(ekskul.filter((_, i) => i !== idx))
  }

  function updateEkskul(idx: number, field: keyof EkskulRow, value: string) {
    const next = [...ekskul]
    next[idx][field] = value
    setEkskul(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const result = await simpanWaliKelas(studentId, {
      ekskul,
      sakit,
      izin,
      alpha,
      catatan,
    })

    setLoading(false)
    if (result.error) setMsg('❌ ' + result.error)
    else {
      setMsg('✅ Berhasil disimpan')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Ekstrakurikuler</h2>
          <button
            type="button"
            onClick={addEkskul}
            className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
          >
            + Tambah
          </button>
        </div>

        <div className="space-y-3">
          {ekskul.map((e, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <input
                placeholder="Nama ekskul"
                value={e.nama}
                onChange={(ev) => updateEkskul(i, 'nama', ev.target.value)}
                className="col-span-4 border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Predikat (A/B/C)"
                value={e.predikat}
                onChange={(ev) => updateEkskul(i, 'predikat', ev.target.value)}
                className="col-span-2 border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Keterangan"
                value={e.keterangan}
                onChange={(ev) => updateEkskul(i, 'keterangan', ev.target.value)}
                className="col-span-5 border rounded px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeEkskul(i)}
                className="col-span-1 text-red-600 hover:underline text-sm py-2"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-4">Absensi (dalam hari)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Sakit</label>
            <input
              type="number"
              value={sakit}
              onChange={(e) => setSakit(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Izin</label>
            <input
              type="number"
              value={izin}
              onChange={(e) => setIzin(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tanpa Keterangan</label>
            <input
              type="number"
              value={alpha}
              onChange={(e) => setAlpha(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-semibold mb-4">Catatan Wali Kelas</h2>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}