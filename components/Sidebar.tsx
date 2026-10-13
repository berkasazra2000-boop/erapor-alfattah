// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  nama: string
  role: string
} | null

const menuByRole: Record<
  string,
  { href: string; label: string; icon: string }[]
> = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/tahun-ajaran', label: 'Tahun Ajaran', icon: '📅' },
    { href: '/dashboard/kelas', label: 'Kelas', icon: '🏫' },
    { href: '/dashboard/siswa', label: 'Siswa', icon: '👥' },
    { href: '/dashboard/mapel', label: 'Mata Pelajaran', icon: '📚' },
    { href: '/dashboard/guru', label: 'Guru & Assign', icon: '👨‍🏫' },
    { href: '/dashboard/nilai', label: 'Nilai', icon: '📝' },
    { href: '/dashboard/rapor', label: 'Cetak Rapor', icon: '🖨️' },
  ],
  guru_mapel: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/nilai', label: 'Nilai Saya', icon: '📝' },
  ],
  wali_kelas: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/nilai', label: 'Nilai Saya', icon: '📝' },
    { href: '/dashboard/wali-kelas', label: 'Wali Kelas', icon: '🏫' },
    { href: '/dashboard/rapor', label: 'Cetak Rapor', icon: '🖨️' },
  ],
  kepsek: [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }],
  siswa: [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }],
  ortu: [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }],
}

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menu = menuByRole[profile?.role ?? 'admin'] ?? menuByRole.admin

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r min-h-screen flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg">e-Rapor</h1>
        <p className="text-xs text-gray-500">SMAS Al Fattah</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm ${
                active
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="text-sm mb-2">
          <p className="font-medium">{profile?.nama ?? 'User'}</p>
          <p className="text-xs text-gray-500">{profile?.role ?? '-'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm bg-red-50 text-red-700 py-2 rounded hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}