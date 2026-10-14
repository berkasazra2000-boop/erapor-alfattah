// app/dashboard/mapel/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'

export default async function MapelPage() {
  const supabase = await createClient()

  const { data: levels } = await supabase.from('class_levels').select('id, nama, urutan').order('urutan')
  const { data: mapping } = await supabase.from('class_level_subjects').select(`kategori, urutan, class_level_id, subjects (nama, slug)`).order('urutan')

  return (
    <div>
      <PageHeader title="Mata Pelajaran" subtitle="Daftar mapel per tingkat dengan kategori dan urutan di rapor" badge="Master Data" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {levels?.map((lv) => {
          const items = (mapping ?? []).filter((m: any) => m.class_level_id === lv.id)
          const wajib = items.filter((i: any) => i.kategori === 'wajib')
          const pilihan = items.filter((i: any) => i.kategori === 'pilihan')
          const mulok = items.filter((i: any) => i.kategori === 'muatan_lokal')

          return (
            <div key={lv.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-jakarta)' }}>Kelas {lv.nama}</div>
                    <div className="text-emerald-400 text-xs font-medium mt-0.5">{items.length} mapel</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {lv.nama}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {wajib.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mata Pelajaran Wajib</h3>
                    <ol className="space-y-1">
                      {wajib.map((m: any, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="text-slate-400 w-5 font-mono text-xs pt-0.5">{i + 1}.</span>
                          <span>{m.subjects?.nama}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {pilihan.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kelompok Pilihan</h3>
                    <ol className="space-y-1">
                      {pilihan.map((m: any, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="text-slate-400 w-5 font-mono text-xs pt-0.5">{wajib.length + i + 1}.</span>
                          <span>{m.subjects?.nama}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {mulok.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Muatan Lokal</h3>
                    <ol className="space-y-1">
                      {mulok.map((m: any, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="text-slate-400 w-5 font-mono text-xs pt-0.5">{wajib.length + pilihan.length + i + 1}.</span>
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