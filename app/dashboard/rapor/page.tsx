// app/dashboard/rapor/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RaporListPage() {
  const supabase = await createClient()

  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_levels(nama)')
    .order('nama')

  const denganSiswa = await Promise.all(
    (kelas ?? []).map(async (k) => {
      const { data: siswa } = await supabase
        .from('students')
        .select('id, nama, nis')
        .eq('class_id', k.id)
        .order('nama')
      return { ...k, siswa: siswa ?? [] }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Cetak Rapor</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pilih siswa untuk melihat & mencetak rapornya.
      </p>

      <div className="space-y-6">
        {denganSiswa.map((k: any) => (
          <div key={k.id} className="bg-white rounded-lg border">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold">
              Kelas {k.nama} — {k.siswa.length} siswa
            </div>
            {k.siswa.length > 0 ? (
              <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                {k.siswa.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/rapor/${s.id}`}
                    className="flex justify-between items-center px-3 py-2 rounded hover:bg-blue-50 text-sm border"
                  >
                    <span>{s.nama}</span>
                    <span className="text-xs text-gray-400">
                      {s.nis ?? '-'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">
                Belum ada siswa di kelas ini.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}