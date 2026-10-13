// app/dashboard/wali-kelas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WaliKelasPage() {
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

  const list = await Promise.all(
    (kelas ?? []).map(async (k: any) => {
      const { data: siswa } = await supabase
        .from('students')
        .select('id, nama, nis')
        .eq('class_id', k.id)
        .order('nama')
      return { ...k, siswa: siswa ?? [] }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Wali Kelas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Isi ekstrakurikuler, absensi, dan catatan wali kelas per siswa.
      </p>

      <div className="space-y-6">
        {list.map((k) => (
          <div key={k.id} className="bg-white rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold flex justify-between items-center">
              <span>
                Kelas {k.nama} — {k.siswa.length} siswa
              </span>
              <Link
                href={`/dashboard/wali-kelas/import/${k.id}`}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
              >
                📥 Import Excel
              </Link>
            </div>
            {k.siswa.length > 0 ? (
              <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                {k.siswa.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/wali-kelas/${s.id}`}
                    className="flex justify-between items-center px-3 py-2 rounded hover:bg-blue-50 text-sm border"
                  >
                    <span>{s.nama}</span>
                    <span className="text-xs text-gray-400">{s.nis ?? '-'}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">
                Belum ada siswa di kelas ini.
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm">
            {isAdmin
              ? 'Belum ada kelas yang di-assign ke wali kelas.'
              : 'Anda belum di-assign sebagai wali kelas mana pun.'}
          </div>
        )}
      </div>
    </div>
  )
}