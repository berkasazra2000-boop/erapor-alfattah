// app/dashboard/wali-kelas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'

const Icon = {
  Arrow: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>),
  Import: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>),
  Users: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>),
}

export default async function WaliKelasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  let query = supabase.from('classes').select('id, nama, class_levels(nama)').order('nama')
  if (!isAdmin) query = query.eq('wali_kelas_id', user.id)

  const { data: kelas } = await query

  const [kelasRes, siswaRes] = await Promise.all([
    supabase.from('classes').select('id, nama, class_levels(nama)').order('nama'),
    supabase.from('students').select('id, nama, nis, class_id').order('nama'),
  ])

  const list = (kelas ?? []).map((k: any) => ({
    ...k,
    siswa: (siswaRes.data ?? []).filter((s: any) => s.class_id === k.id),
  }))

  return (
    <div>
      <PageHeader
        title="Input Wali Kelas"
        subtitle="Isi ekstrakurikuler, absensi, dan catatan per siswa"
        badge={isAdmin ? 'Admin View' : 'Wali Kelas'}
      />

      {list.length > 0 ? (
        <div className="space-y-5">
          {list.map((k) => (
            <Card key={k.id} className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    Kelas {k.nama}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {k.siswa.length} siswa · Tingkat {k.class_levels?.nama}
                  </div>
                </div>
                <Link
                  href={`/dashboard/wali-kelas/import/${k.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm hover:shadow-md transition-all"
                >
                  {Icon.Import} Import Excel
                </Link>
              </div>

              {k.siswa.length > 0 ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {k.siswa.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/dashboard/wali-kelas/${s.id}`}
                      className="flex justify-between items-center px-3.5 py-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {s.nama.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{s.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.nis ?? '—'}</div>
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">{Icon.Arrow}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">Belum ada siswa di kelas ini.</div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">{Icon.Users}</div>
            <div className="font-semibold text-slate-700 mb-1">
              {isAdmin ? 'Belum ada kelas yang di-assign ke wali kelas' : 'Anda belum di-assign sebagai wali kelas'}
            </div>
            <div className="text-sm text-slate-500">
              {isAdmin ? 'Assign wali kelas di menu Kelas' : 'Hubungi admin untuk di-assign'}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}