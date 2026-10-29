// app/dashboard/siswa/FilterKelas.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterKelas({
  kelasList,
  defaultKelas,
}: {
  kelasList: any[]
  defaultKelas: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (val === 'all') {
      params.delete('kelas') // Hapus parameter jika pilih 'Semua Kelas'
    } else {
      params.set('kelas', val)
    }
    
    router.push(`/dashboard/siswa?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500">Filter Kelas:</label>
      <select
        value={defaultKelas}
        onChange={handleChange}
        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:border-emerald-500 outline-none cursor-pointer"
      >
        <option value="all">Semua Kelas</option>
        {kelasList.map((k) => (
          <option key={k.id} value={k.id}>
            {k.nama} ({k.class_levels?.nama})
          </option>
        ))}
      </select>
    </div>
  )
}