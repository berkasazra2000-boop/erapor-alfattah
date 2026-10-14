// app/dashboard/nilai/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'

const Icon = {
  Arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
  ),
  File: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg>
  ),
}

export default async function NilaiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('teacher_subjects')
    .select(`id, teacher_id, classes(id, nama, class_levels(nama)), subjects(id, nama)`)
    .order('created_at')

  if (!isAdmin) query = query.eq('teacher_id', user!.id)

  const { data: assignments } = await query

  // Hitung progress per assignment
  const list = await Promise.all(
    (assignments ?? []).map(async (a: any) => {
      const { count: totalSiswa } = await supabase
        .from('students').select('*', { count: 'exact', head: true })
        .eq('class_id', a.classes?.id)

      const { data: siswaIds } = await supabase
        .from('students').select('id').eq('class_id', a.classes?.id)

      const ids = (siswaIds ?? []).map((s: any) => s.id)

      const { count: sudahDinilai } = ids.length > 0
        ? await supabase
            .from('student_grades').select('*', { count: 'exact', head: true })
            .eq('subject_id', a.subjects?.id)
            .not('nilai_angka', 'is', null)
            .in('student_id', ids)
        : { count: 0 }

      const total = totalSiswa ?? 0
      const done = sudahDinilai ?? 0
      const percent = total > 0 ? Math.round((done / total) * 100) : 0

      return {
        id: a.id,
        kelas: a.classes?.nama,
        tingkat: a.classes?.class_levels?.nama,
        mapel: a.subjects?.nama,
        done,
        total,
        percent,
      }
    })
  )

  return (
    <div>
      <PageHeader
        title="Nilai"
        subtitle={isAdmin ? 'Semua kelas & mapel' : 'Kelas & mapel yang Anda ajar'}
        badge={isAdmin ? 'Admin View' : 'Guru View'}
      />

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((row) => (
            <Link
              key={row.id}
              href={`/dashboard/nilai/${row.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  {Icon.File}
                </div>
                <div className="text-slate-300 group-hover:text-emerald-600 transition-colors">
                  {Icon.Arrow}
                </div>
              </div>

              <div className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
                {row.mapel}
              </div>
              <div className="text-xs text-slate-500 mb-4">
                Kelas {row.kelas} · {row.tingkat}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-semibold text-slate-700">
                    {row.done}/{row.total} siswa
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      row.percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              {Icon.File}
            </div>
            <div className="font-semibold text-slate-700 mb-1">
              {isAdmin
                ? 'Belum ada assignment guru'
                : 'Anda belum di-assign ke kelas/mapel apa pun'}
            </div>
            <div className="text-sm text-slate-500">
              {isAdmin
                ? 'Assign guru ke mapel di menu Guru terlebih dahulu'
                : 'Hubungi admin untuk di-assign'}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}