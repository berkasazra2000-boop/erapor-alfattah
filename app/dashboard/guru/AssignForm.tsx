// app/dashboard/guru/AssignForm.tsx
'use client'

import { useState } from 'react'
import { assignGuru } from './actions'

type Guru = { id: string; nama: string; role: string }
type Kelas = { id: string; nama: string; class_level_id: string }
type Mapel = { id: string; nama: string; class_level_id: string; kategori: string }

export default function AssignForm({
  guru,
  kelas,
  mapel,
}: {
  guru: Guru[]
  kelas: Kelas[]
  mapel: Mapel[]
}) {
  const [classId, setClassId] = useState('')

  const kelasTerpilih = kelas.find((k) => k.id === classId)
  const mapelTersedia = kelasTerpilih
    ? mapel.filter((m) => m.class_level_id === kelasTerpilih.class_level_id)
    : []

  return (
    <form action={assignGuru} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-sm mb-1">Guru</label>
        <select name="teacher_id" required className="border rounded px-3 py-2 w-full">
          <option value="">Pilih guru...</option>
          {guru.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nama} ({g.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Kelas</label>
        <select
          name="class_id"
          required
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Pilih kelas...</option>
          {kelas.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Mata Pelajaran</label>
        <select
          name="subject_id"
          required
          disabled={!classId}
          className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
        >
          <option value="">Pilih mapel...</option>
          {mapelTersedia.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nama} — {m.kategori}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Assign
      </button>
    </form>
  )
}