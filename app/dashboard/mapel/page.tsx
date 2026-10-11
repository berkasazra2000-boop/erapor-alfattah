// app/dashboard/mapel/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function MapelPage() {
  const supabase = await createClient()

  const { data: levels } = await supabase
    .from('class_levels')
    .select('id, nama, urutan')
    .order('urutan')

  const { data: mapping } = await supabase
    .from('class_level_subjects')
    .select(`
      kategori,
      urutan,
      class_level_id,
      subjects (nama, slug)
    `)
    .order('urutan')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Mata Pelajaran</h1>
      <p className="text-sm text-gray-500 mb-6">
        Daftar mapel per tingkat beserta kategori dan urutan di rapor.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels?.map((lv) => {
          const items = (mapping ?? []).filter(
            (m: any) => m.class_level_id === lv.id
          )
          const wajib = items.filter((i: any) => i.kategori === 'wajib')
          const pilihan = items.filter((i: any) => i.kategori === 'pilihan')
          const mulok = items.filter((i: any) => i.kategori === 'muatan_lokal')

          return (
            <div key={lv.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-3 font-semibold">
                Kelas {lv.nama}
                <span className="text-xs font-normal ml-2 opacity-80">
                  ({items.length} mapel)
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Mata Pelajaran Wajib
                  </h3>
                  <ol className="space-y-1">
                    {wajib.map((m: any, i: number) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-gray-400 w-5">{i + 1}.</span>
                        <span>{m.subjects?.nama}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Kelompok Pilihan
                  </h3>
                  <ol className="space-y-1">
                    {pilihan.map((m: any, i: number) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-gray-400 w-5">
                          {wajib.length + i + 1}.
                        </span>
                        <span>{m.subjects?.nama}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {mulok.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Muatan Lokal
                    </h3>
                    <ol className="space-y-1">
                      {mulok.map((m: any, i: number) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-gray-400 w-5">
                            {wajib.length + pilihan.length + i + 1}.
                          </span>
                          <span>{m.subjects?.nama}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}