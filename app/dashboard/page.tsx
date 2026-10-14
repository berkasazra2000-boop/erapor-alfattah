// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ============ ICONS ============
const Icon = {
  Users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Building: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
    </svg>
  ),
  Book: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 1 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
    </svg>
  ),
  Teacher: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
    </svg>
  ),
  ArrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  href?: string
}) {
  const content = (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        {href && (
          <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
            {Icon.ArrowRight}
          </div>
        )}
      </div>
      <div
        className="text-3xl font-bold text-slate-900 mb-1"
        style={{ fontFamily: 'var(--font-jakarta)' }}
      >
        {value}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

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
  const nama = profile?.nama ?? 'User'
  const firstName = nama.split(' ')[0]

  // ============ ADMIN ============
  if (role === 'admin') {
    const [siswa, kelas, mapel, guru] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['guru_mapel', 'wali_kelas']),
    ])

    return (
      <div className="space-y-8">
        {/* ===== HEADER ===== */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600">
              {Icon.Sparkles}
            </span>
            <span className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">
              Dashboard Admin
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Selamat datang, {firstName} 👋
          </h1>
          <p className="text-slate-500">
            Kelola data e-Rapor SMA Unggulan BPPT Al Fattah dari sini.
          </p>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Siswa"
            value={siswa.count ?? 0}
            icon={Icon.Users}
            color="bg-blue-50 text-blue-600"
            href="/dashboard/siswa"
          />
          <StatCard
            label="Total Kelas"
            value={kelas.count ?? 0}
            icon={Icon.Building}
            color="bg-purple-50 text-purple-600"
            href="/dashboard/kelas"
          />
          <StatCard
            label="Mata Pelajaran"
            value={mapel.count ?? 0}
            icon={Icon.Book}
            color="bg-amber-50 text-amber-600"
            href="/dashboard/mapel"
          />
          <StatCard
            label="Total Guru"
            value={guru.count ?? 0}
            icon={Icon.Teacher}
            color="bg-emerald-50 text-emerald-600"
            href="/dashboard/guru"
          />
        </div>

        {/* ===== WELCOME CARD ===== */}
        <div
          className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <div className="text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-2">
              Sistem e-Rapor
            </div>
            <h2
              className="text-xl md:text-2xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              SMA Unggulan BPPT Al Fattah
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Mulai dari mengelola tahun ajaran, siswa, guru, hingga cetak rapor
              PDF. Semua data terpusat dan siap cetak kapan saja.
            </p>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div>
          <h2
            className="text-lg font-bold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              href="/dashboard/siswa/import"
              title="Import Siswa"
              desc="Tambahkan siswa massal via file Excel"
              color="from-blue-500 to-blue-600"
            />
            <QuickAction
              href="/dashboard/nilai"
              title="Input Nilai"
              desc="Isi nilai & capaian kompetensi siswa"
              color="from-emerald-500 to-emerald-600"
            />
            <QuickAction
              href="/dashboard/rapor"
              title="Cetak Rapor"
              desc="Download rapor PDF per siswa atau per kelas"
              color="from-amber-500 to-amber-600"
            />
          </div>
        </div>
      </div>
    )
  }

  // ============ GURU / WALI KELAS ============
  if (role === 'guru_mapel' || role === 'wali_kelas') {
    const { data: assignments } = await supabase
      .from('teacher_subjects')
      .select(`
        id,
        classes(id, nama, class_levels(nama)),
        subjects(id, nama)
      `)
      .eq('teacher_id', user.id)

    const { data: kelasBinaan } = await supabase
      .from('classes')
      .select('id, nama, class_levels(nama)')
      .eq('wali_kelas_id', user.id)

    const isWaliKelas = role === 'wali_kelas'

    return (
      <div className="space-y-8">
        {/* ===== HEADER ===== */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600">
              {Icon.Sparkles}
            </span>
            <span className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">
              Dashboard {isWaliKelas ? 'Wali Kelas' : 'Guru Mapel'}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Halo, {firstName} 👋
          </h1>
          <p className="text-slate-500">
            {isWaliKelas
              ? 'Kelola nilai dan data wali kelas Anda di sini.'
              : 'Kelola nilai siswa yang Anda ajar di sini.'}
          </p>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Mapel Diampu"
            value={assignments?.length ?? 0}
            icon={Icon.Book}
            color="bg-blue-50 text-blue-600"
            href="/dashboard/nilai"
          />
          {isWaliKelas && (
            <StatCard
              label="Kelas Binaan"
              value={kelasBinaan?.length ?? 0}
              icon={Icon.Building}
              color="bg-purple-50 text-purple-600"
              href="/dashboard/wali-kelas"
            />
          )}
          {isWaliKelas && (
            <StatCard
              label="Cetak Rapor"
              value="Buka"
              icon={Icon.Teacher}
              color="bg-emerald-50 text-emerald-600"
              href="/dashboard/rapor"
            />
          )}
        </div>

        {/* ===== MAPEL SAYA ===== */}
        {assignments && assignments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Mapel yang Saya Ajar
              </h2>
              <Link
                href="/dashboard/nilai"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                Input Nilai {Icon.ArrowRight}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {a.subjects?.nama}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Kelas {a.classes?.nama}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== KELAS BINAAN ===== */}
        {isWaliKelas && (
          <>
            {kelasBinaan && kelasBinaan.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-jakarta)' }}
                  >
                    Kelas yang Saya Bina
                  </h2>
                  <Link
                    href="/dashboard/wali-kelas"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                  >
                    Input Wali Kelas {Icon.ArrowRight}
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kelasBinaan.map((k: any) => (
                    <Link
                      key={k.id}
                      href="/dashboard/wali-kelas"
                      className="bg-white rounded-xl border border-slate-200/80 p-4 flex justify-between items-center hover:shadow-md hover:border-emerald-200 transition-all"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {k.nama}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Tingkat {k.class_levels?.nama}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                ⚠️ Anda belum di-assign sebagai wali kelas. Hubungi admin.
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ============ DEFAULT ============
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Halo, <span className="font-semibold text-slate-700">{nama}</span> — Role: {role}
        </p>
      </div>
    </div>
  )
}

// ============ QUICK ACTION COMPONENT ============
function QuickAction({
  href,
  title,
  desc,
  color,
}: {
  href: string
  title: string
  desc: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-200/80 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div
        className="font-bold text-slate-900 mb-1"
        style={{ fontFamily: 'var(--font-jakarta)' }}
      >
        {title}
      </div>
      <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
    </Link>
  )
}