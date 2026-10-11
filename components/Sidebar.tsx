'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  nama: string
  role: string
} | null

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menu = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/tahun-ajaran', label: 'Tahun Ajaran', icon: '📅' },
    { href: '/dashboard/kelas', label: 'Kelas', icon: '🏫' },
    { href: '/dashboard/siswa', label: 'Siswa', icon: '👥' },
    { href: '/dashboard/mapel', label: 'Mata Pelajaran', icon: '📚' },
  ]

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg">e-Rapor</h1>
        <p className="text-xs text-gray-500">SMAS Al Fattah</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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