// app/dashboard/rapor/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import BulkPrintButton from './BulkPrintButton'

const Icon = {
  Arrow: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
  ),
  Print: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>
  ),
  User: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
}

export default async function RaporListPage() {
  const supabase = await createClient()

  const [kelasRes, siswaRes] = await Promise.all([
    supabase.from('classes').select('id, nama, class_levels(nama)').order('nama'),
    supabase.from('students').select('id, nama, nis, class_id').order('nama'),
  ])

  const kelas = kelasRes.data ?? []
  const semuaSiswa = siswaRes.data ?? []

  const denganSiswa = kelas.map((k) => ({
    ...k,
    siswa: semuaSiswa.filter((s) => s.class_id === k.id),
  }))

  return (
    <div>
      <PageHeader
        title="Cetak Rapor"
        subtitle="Cetak rapor per siswa atau download massal 1 kelas sekaligus"
        badge="Print Center"
      />

      <div className="space-y-5">
        {denganSiswa.map((k: any) => (
          <div
            key={k.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            {/* HEADER KELAS */}
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  {k.nama}
                </div>
                <div>
                  <div
                    className="font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-jakarta)' }}
                  >
                    Kelas {k.nama}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {k.siswa.length} siswa · Tingkat {k.class_levels?.nama}
                  </div>
                </div>
              </div>

              {k.siswa.length > 0 && (
                <BulkPrintButton classId={k.id} kelasNama={k.nama} />
              )}
            </div>

            {/* DAFTAR SISWA */}
            {k.siswa.length > 0 ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {k.siswa.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/rapor/${s.id}`}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.nama
                          .split(' ')
                          .slice(0, 2)
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {s.nama}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.nis ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                      {Icon.Arrow}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                  {Icon.User}
                </div>
                <div className="text-sm text-slate-500">
                  Belum ada siswa di kelas ini
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}