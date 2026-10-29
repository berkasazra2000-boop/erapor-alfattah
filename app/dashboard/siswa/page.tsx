// app/dashboard/siswa/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button, ButtonLink } from '@/components/ui/Button'
import FilterKelas from './FilterKelas'

const Icon = {
  Plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Import: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </svg>
  ),
  Edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
}

async function tambahSiswa(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const nama = formData.get('nama') as string
  const nis = (formData.get('nis') as string) || null
  const nisn = (formData.get('nisn') as string) || null
  const class_id = formData.get('class_id') as string
  await supabase.from('students').insert({ nama, nis, nisn, class_id })
  revalidatePath('/dashboard/siswa')
}

async function hapusSiswa(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('students').delete().eq('id', id)
  revalidatePath('/dashboard/siswa')
}

export default async function SiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>
}) {
  const { kelas: filterId } = await searchParams
  const supabase = await createClient()

  // Siapkan query dasar
  let siswaQuery = supabase
    .from('students')
    .select('id, nama, nis, nisn, class_id, classes(nama)')
    .order('nama')

  // Jika ada filter kelas dari URL, tambahkan kondisinya
  if (filterId && filterId !== 'all') {
    siswaQuery = siswaQuery.eq('class_id', filterId)
  }

  const [kelasRes, siswaRes] = await Promise.all([
    supabase.from('classes').select('id, nama, class_levels(nama)').order('nama'),
    siswaQuery,
  ])

  const kelas = kelasRes.data ?? []
  const daftar = siswaRes.data ?? []

  return (
    <div>
      <PageHeader
        title="Siswa"
        subtitle={`${daftar.length} siswa terdaftar`}
        badge="Manajemen Data"
        actions={
          <>
            <ButtonLink href="/dashboard/siswa/import" variant="secondary">
              {Icon.Import}
              Import Excel
            </ButtonLink>
          </>
        }
      />

      {/* FORM TAMBAH */}
      <Card className="mb-6">
        <CardHeader title="Tambah Siswa" subtitle="Isi data siswa baru secara manual" />
        <form action={tambahSiswa} className="p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Lengkap</label>
            <input name="nama" required placeholder="Ahmad Fauzi" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">NIS</label>
            <input name="nis" placeholder="1567" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">NISN</label>
            <input name="nisn" placeholder="3098590005" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Kelas</label>
            <select name="class_id" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white">
              <option value="">Pilih...</option>
              {kelas.map((k: any) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <Button type="submit">
            {Icon.Plus} Simpan
          </Button>
        </form>
      </Card>

      {/* TABEL SISWA */}
      <Card className="overflow-hidden">
        <CardHeader 
          title="Daftar Siswa" 
          subtitle={`Menampilkan ${daftar.length} siswa`}
          action={<FilterKelas kelasList={kelas} defaultKelas={filterId || 'all'} />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NISN</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.length > 0 ? (
                daftar.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {row.nama.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{row.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{row.nis ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{row.nisn ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {row.classes?.nama ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/siswa/${row.id}/edit`}
                        className="inline-flex items-center gap-1 p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Siswa"
                      >
                        {Icon.Edit}
                      </Link>
                      <form action={hapusSiswa} className="inline">
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Siswa"
                        >
                          {Icon.Trash}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        {Icon.Users}
                      </div>
                      <div>
                        <div className="font-medium text-slate-600 mb-1">Siswa tidak ditemukan</div>
                        <div className="text-xs">Tidak ada siswa di kelas yang dipilih.</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}