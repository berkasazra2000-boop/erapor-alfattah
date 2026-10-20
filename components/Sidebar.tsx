// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from './Logo'

type Profile = {
  nama: string
  role: string
} | null

type MenuItem = {
  href: string
  label: string
  icon: React.ReactNode
}

// ============ ICONS (inline SVG) ============
const Icon = {
  Dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  TahunAjaran: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Kelas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
    </svg>
  ),
  Siswa: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Mapel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 1 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
    </svg>
  ),
  Guru: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
      <path d="M12 14v7" />
    </svg>
  ),
  Nilai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>
  ),
  WaliKelas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  Legger: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18M7 16l4-4 4 4 5-5" />
    </svg>
  ),
  Rapor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  ),
  Logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
}

const menuByRole: Record<string, MenuItem[]> = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
    { href: '/dashboard/tahun-ajaran', label: 'Tahun Ajaran', icon: Icon.TahunAjaran },
    { href: '/dashboard/kelas', label: 'Kelas', icon: Icon.Kelas },
    { href: '/dashboard/siswa', label: 'Siswa', icon: Icon.Siswa },
    { href: '/dashboard/mapel', label: 'Mata Pelajaran', icon: Icon.Mapel },
    { href: '/dashboard/guru', label: 'Guru & Assign', icon: Icon.Guru },
    { href: '/dashboard/nilai', label: 'Nilai', icon: Icon.Nilai },
    { href: '/dashboard/legger', label: 'Legger Nilai', icon: Icon.Legger },
    { href: '/dashboard/ttd', label: 'Tanda Tangan', icon: Icon.WaliKelas },
    { href: '/dashboard/rapor', label: 'Cetak Rapor', icon: Icon.Rapor },
  ],
  guru_mapel: [
    { href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
    { href: '/dashboard/nilai', label: 'Nilai Saya', icon: Icon.Nilai },
  ],
  wali_kelas: [
    { href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
    { href: '/dashboard/nilai', label: 'Nilai Saya', icon: Icon.Nilai },
    { href: '/dashboard/wali-kelas', label: 'Input Wali Kelas', icon: Icon.WaliKelas },
    { href: '/dashboard/legger', label: 'Legger Nilai', icon: Icon.Legger },
    { href: '/dashboard/rapor', label: 'Cetak Rapor', icon: Icon.Rapor },
  ],
  kepsek: [{ href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard }],
  siswa: [{ href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard }],
  ortu: [{ href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard }],
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    admin: 'Administrator',
    guru_mapel: 'Guru Mapel',
    wali_kelas: 'Wali Kelas',
    kepsek: 'Kepala Sekolah',
    siswa: 'Siswa',
    ortu: 'Orang Tua',
  }
  return map[role] ?? role
}

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menu = menuByRole[profile?.role ?? 'admin'] ?? menuByRole.admin
  const namaUser = profile?.nama ?? 'User'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-64 shrink-0 flex flex-col sticky top-0 h-screen"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* ===== BRAND ===== */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-lg shadow-black/20">
            <Logo size={36} />
          </div>
          <div className="min-w-0">
            <div
              className="text-white font-bold text-sm leading-tight"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              E-Rapor
            </div>
            <div className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase mt-0.5">
              SMA Unggulan BPPT Al Fattah
            </div>
          </div>
        </div>
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r-full" />
              )}

              <span
                className={`shrink-0 transition-colors ${
                  active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ===== USER CARD ===== */}
      <div className="p-3 border-t border-white/10">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm p-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(namaUser)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">
                {namaUser}
              </div>
              <div className="text-emerald-400/80 text-[10px] font-medium tracking-wide uppercase mt-0.5">
                {getRoleLabel(profile?.role ?? '')}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-red-500/20 bg-white/5 py-2.5 rounded-xl transition-all duration-200"
        >
          {Icon.Logout}
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}