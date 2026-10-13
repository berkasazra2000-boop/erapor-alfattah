// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama, role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'admin'

  // ===== ADMIN =====
  if (role === 'admin') {
    const [siswa, kelas, mapel] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
    ])

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Siswa" value={siswa.count ?? 0} icon="👥" />
          <StatCard label="Kelas" value={kelas.count ?? 0} icon="🏫" />
          <StatCard label="Mata Pelajaran" value={mapel.count ?? 0} icon="📚" />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold mb-2">Akses Admin</h2>
          <p className="text-sm text-gray-700">
            Anda bisa mengelola tahun ajaran, kelas, siswa, mapel, assign guru,
            input nilai, dan cetak rapor.
          </p>
        </div>
      </div>
    )
  }

  // ===== GURU MAPEL / WALI KELAS =====
  if (role === 'guru_mapel' || role === 'wali_kelas') {
    // Mapel yang dia ajar
    const { data: assignments } = await supabase
      .from('teacher_subjects')
      .select(`
        id,
        classes(id, nama, class_levels(nama)),
        subjects(id, nama)
      `)
      .eq('teacher_id', user.id)

    // Kelas yang dia jadi wali kelas
    const { data: kelasBinaan } = await supabase
      .from('classes')
      .select('id, nama, class_levels(nama)')
      .eq('wali_kelas_id', user.id)

    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Dashboard {role === 'wali_kelas' ? 'Wali Kelas' : 'Guru Mapel'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Halo, {profile?.nama}
        </p>

        {/* Ringkasan guru */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Mapel Diampu"
            value={assignments?.length ?? 0}
            icon="📚"
          />
          <StatCard
            label="Kelas Binaan"
            value={kelasBinaan?.length ?? 0}
            icon="🏫"
          />
          {role === 'wali_kelas' && (
            <StatCard
              label="Akses"
              value="Nilai + Wali Kelas"
              icon="✅"
            />
          )}
        </div>

        {/* Daftar mapel yang diajar */}
        {assignments && assignments.length > 0 && (
          <div className="bg-white rounded-lg border mb-6">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold flex justify-between items-center">
              <span>Mapel yang Saya Ajar</span>
              <Link
                href="/dashboard/nilai"
                className="text-sm text-blue-600 hover:underline"
              >
                Input Nilai →
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center px-3 py-2 border rounded text-sm"
                >
                  <span className="font-medium">{a.subjects?.nama}</span>
                  <span className="text-gray-500">{a.classes?.nama}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kelas binaan (kalau wali kelas) */}
        {role === 'wali_kelas' && (
          <>
            {kelasBinaan && kelasBinaan.length > 0 ? (
              <div className="bg-white rounded-lg border mb-6">
                <div className="px-4 py-3 border-b bg-gray-50 font-semibold flex justify-between items-center">
                  <span>Kelas yang Saya Bina</span>
                  <Link
                    href="/dashboard/wali-kelas"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Input Wali Kelas →
                  </Link>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {kelasBinaan.map((k: any) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center px-3 py-2 border rounded text-sm"
                    >
                      <span className="font-medium">{k.nama}</span>
                      <span className="text-gray-500">
                        {k.class_levels?.nama}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm">
                Anda belum di-assign sebagai wali kelas. Hubungi admin.
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ===== DEFAULT =====
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500">
        Halo, {profile?.nama} ({role})
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}