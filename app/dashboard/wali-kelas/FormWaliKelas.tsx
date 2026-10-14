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

const Icon = {
  Plus: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>),
  Trash: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>),
}

export default function FormWaliKelas({ studentId, initial }: Props) {
  const router = useRouter()
  const [ekskul, setEkskul] = useState<EkskulRow[]>(
    initial.ekskul.length > 0 ? initial.ekskul : [{ nama: '', predikat: '', keterangan: '' }]
  )
  const [sakit, setSakit] = useState(initial.sakit)
  const [izin, setIzin] = useState(initial.izin)
  const [alpha, setAlpha] = useState(initial.alpha)
  const [catatan, setCatatan] = useState(initial.catatan)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function addEkskul() { setEkskul([...ekskul, { nama: '', predikat: '', keterangan: '' }]) }
  function removeEkskul(i: number) { setEkskul(ekskul.filter((_, idx) => idx !== i)) }
  function updateEkskul(i: number, field: keyof EkskulRow, value: string) {
    const next = [...ekskul]; next[i][field] = value; setEkskul(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const result = await simpanWaliKelas(studentId, { ekskul, sakit, izin, alpha, catatan })
    setLoading(false)
    if (result.error) setMsg('❌ ' + result.error)
    else { setMsg('✅ Berhasil disimpan'); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* EKSKUL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>Ekstrakurikuler</div>
            <div className="text-xs text-slate-500 mt-0.5">Kegiatan ekskul dan predikatnya</div>
          </div>
          <button type="button" onClick={addEkskul} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            {Icon.Plus} Tambah
          </button>
        </div>
        <div className="p-5 space-y-3">
          {ekskul.map((e, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <input placeholder="Nama ekskul" value={e.nama} onChange={(ev) => updateEkskul(i, 'nama', ev.target.value)} className="col-span-12 md:col-span-4 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none" />
              <input placeholder="Predikat (A/B/C)" value={e.predikat} onChange={(ev) => updateEkskul(i, 'predikat', ev.target.value)} className="col-span-12 md:col-span-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none" />
              <input placeholder="Keterangan" value={e.keterangan} onChange={(ev) => updateEkskul(i, 'keterangan', ev.target.value)} className="col-span-10 md:col-span-5 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none" />
              <button type="button" onClick={() => removeEkskul(i)} className="col-span-2 md:col-span-1 p-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center">
                {Icon.Trash}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ABSENSI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>Absensi (dalam hari)</div>
          <div className="text-xs text-slate-500 mt-0.5">Jumlah hari tidak hadir siswa</div>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Sakit', val: sakit, set: setSakit, color: 'text-blue-600 bg-blue-50' },
            { label: 'Izin', val: izin, set: setIzin, color: 'text-amber-600 bg-amber-50' },
            { label: 'Tanpa Keterangan', val: alpha, set: setAlpha, color: 'text-red-600 bg-red-50' },
          ].map((item) => (
            <div key={item.label}>
              <label className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-2 ${item.color}`}>{item.label}</label>
              <input type="number" value={item.val} onChange={(e) => item.set(parseInt(e.target.value) || 0)} min={0} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none" />
            </div>
          ))}
        </div>
      </div>

      {/* CATATAN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>Catatan Wali Kelas</div>
          <div className="text-xs text-slate-500 mt-0.5">Pesan untuk siswa ini (akan muncul di rapor)</div>
        </div>
        <div className="p-5">
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={4} placeholder="Contoh: Apa yang kamu usahakan sampai hari ini akan menjadi bekal di kemudian hari..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none resize-none" />
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-50 transition-all" style={{ fontFamily: 'var(--font-jakarta)' }}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}