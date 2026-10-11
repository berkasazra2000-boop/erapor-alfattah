import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [siswa, kelas, mapel] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Siswa', value: siswa.count ?? 0, icon: '👥' },
    { label: 'Kelas', value: kelas.count ?? 0, icon: '🏫' },
    { label: 'Mata Pelajaran', value: mapel.count ?? 0, icon: '📚' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-lg border">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Selamat datang di e-Rapor!</h2>
        <p className="text-sm text-gray-700">
          Mulai dengan mengisi data <b>Tahun Ajaran</b>, lalu <b>Kelas</b>, lalu{' '}
          <b>Siswa</b>.
        </p>
      </div>
    </div>
  )
}