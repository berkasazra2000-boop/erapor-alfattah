// app/dashboard/legger/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

const Icon = {
  Arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18M7 16l4-4 4 4 5-5" />
    </svg>
  ),
}

export default async function LeggerListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('classes')
    .select('id, nama, class_levels(nama)')
    .order('nama')

  if (!isAdmin) {
    query = query.eq('wali_kelas_id', user.id)
  }

  const { data: kelas } = await query

  const [kelasRes, siswaRes] = await Promise.all([
    supabase.from('classes').select('id, nama, class_levels(nama)').order('nama'),
    supabase.from('students').select('id, class_id'),
  ])

  const siswa = siswaRes.data ?? []

  const list = (kelas ?? []).map((k: any) => ({
    ...k,
    siswaCount: siswa.filter((s: any) => s.class_id === k.id).length,
  }))

  return (
    <div>
      <PageHeader
        title="Legger Nilai"
        subtitle="Rekapitulasi nilai semua mapel per kelas + Export Excel"
        badge="Rekap Nilai"
      />

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((k) => (
            <Link
              key={k.id}
              href={`/dashboard/legger/${k.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  {Icon.Chart}
                </div>
                <div className="text-slate-300 group-hover:text-emerald-600 transition-colors">
                  {Icon.Arrow}
                </div>
              </div>
              <div
                className="font-bold text-slate-900 mb-1"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Kelas {k.nama}
              </div>
              <div className="text-xs text-slate-500">
                Tingkat {k.class_levels?.nama} · {k.siswaCount} siswa
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              {Icon.Chart}
            </div>
            <div className="font-semibold text-slate-700 mb-1">
              {isAdmin ? 'Belum ada kelas' : 'Anda belum di-assign sebagai wali kelas'}
            </div>
            <div className="text-sm text-slate-500">
              {isAdmin ? 'Buat kelas di menu Kelas' : 'Hubungi admin untuk di-assign'}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}