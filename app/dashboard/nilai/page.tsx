// app/dashboard/nilai/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function NilaiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('teacher_subjects')
    .select(`
      id,
      teacher_id,
      classes(id, nama, class_levels(nama)),
      subjects(id, nama)
    `)
    .order('created_at')

  if (!isAdmin) {
    query = query.eq('teacher_id', user!.id)
  }

  const { data: assignments } = await query

  // Hitung progress: berapa siswa yang sudah ada nilai
  const list = await Promise.all(
    (assignments ?? []).map(async (a: any) => {
      const { count: totalSiswa } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', a.classes?.id)

      const { count: sudahDinilai } = await supabase
        .from('student_grades')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', a.subjects?.id)
        .not('nilai_angka', 'is', null)
        .in(
          'student_id',
          (
            await supabase
              .from('students')
              .select('id')
              .eq('class_id', a.classes?.id)
          ).data?.map((s: any) => s.id) ?? []
        )

      return {
        id: a.id,
        kelas: a.classes?.nama,
        tingkat: a.classes?.class_levels?.nama,
        mapel: a.subjects?.nama,
        progress: `${sudahDinilai ?? 0}/${totalSiswa ?? 0}`,
      }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Nilai</h1>
      <p className="text-sm text-gray-500 mb-6">
        {isAdmin
          ? 'Semua kelas & mapel'
          : 'Kelas & mapel yang Anda ajar'}
      </p>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Kelas</th>
              <th className="text-left px-4 py-3">Mata Pelajaran</th>
              <th className="text-left px-4 py-3">Progress</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.kelas}</td>
                  <td className="px-4 py-3">{row.mapel}</td>
                  <td className="px-4 py-3 text-gray-500">{row.progress}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/nilai/${row.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Input Nilai →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  {isAdmin
                    ? 'Belum ada assignment. Assign guru dulu di menu Guru.'
                    : 'Anda belum di-assign ke kelas/mapel apa pun.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}