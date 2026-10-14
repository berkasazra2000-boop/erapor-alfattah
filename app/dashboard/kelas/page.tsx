// app/dashboard/kelas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const Icon = {
  Plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
  ),
  Trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>
  ),
  Building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /></svg>
  ),
}

async function tambahKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const nama = formData.get('nama') as string
  const class_level_id = formData.get('class_level_id') as string
  const { data: aktif } = await supabase.from('academic_years').select('id').eq('is_active', true).single()
  if (!aktif) return
  await supabase.from('classes').insert({ nama, class_level_id, academic_year_id: aktif.id })
  revalidatePath('/dashboard/kelas')
}

async function hapusKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('classes').delete().eq('id', id)
  revalidatePath('/dashboard/kelas')
}

async function setWaliKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const wali_kelas_id = formData.get('wali_kelas_id') as string
  await supabase.from('classes').update({ wali_kelas_id: wali_kelas_id || null }).eq('id', id)
  if (wali_kelas_id) {
    await supabase.from('profiles').update({ role: 'wali_kelas' }).eq('id', wali_kelas_id).in('role', ['guru_mapel', 'wali_kelas'])
  }
  revalidatePath('/dashboard/kelas')
}

export default async function KelasPage() {
  const supabase = await createClient()
  const { data: aktif } = await supabase.from('academic_years').select('id, tahun, semester').eq('is_active', true).maybeSingle()
  const { data: levels } = await supabase.from('class_levels').select('*').order('urutan')
  const { data: daftar } = await supabase.from('classes').select('id, nama, wali_kelas_id, class_levels(nama), academic_years(tahun, semester), profiles(nama)').order('nama')
  const { data: guru } = await supabase.from('profiles').select('id, nama').in('role', ['wali_kelas', 'guru_mapel']).order('nama')

  return (
    <div>
      <PageHeader
        title="Kelas"
        subtitle={aktif ? `Tahun ajaran aktif: ${aktif.tahun} — Semester ${aktif.semester}` : 'Belum ada tahun ajaran aktif'}
        badge="Manajemen Data"
      />

      {aktif && (
        <Card className="mb-6">
          <CardHeader title="Tambah Kelas" subtitle="Buat kelas baru di tahun ajaran aktif" />
          <form action={tambahKelas} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Kelas</label>
              <input name="nama" required placeholder="X-1" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tingkat</label>
              <select name="class_level_id" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white">
                <option value="">Pilih...</option>
                {levels?.map((lv) => <option key={lv.id} value={lv.id}>{lv.nama}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">{Icon.Plus}Simpan Kelas</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardHeader title="Daftar Kelas" subtitle={`Total ${daftar?.length ?? 0} kelas`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tingkat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Ajaran</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Wali Kelas</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar && daftar.length > 0 ? (
                daftar.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {row.nama.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-900">{row.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                        {row.class_levels?.nama ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {row.academic_years?.tahun} — Smt {row.academic_years?.semester}
                    </td>
                    <td className="px-5 py-3.5">
                      <form action={setWaliKelas} className="flex gap-2 items-center">
                        <input type="hidden" name="id" value={row.id} />
                        <select name="wali_kelas_id" defaultValue={row.wali_kelas_id ?? ''} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none">
                          <option value="">— belum —</option>
                          {guru?.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                        </select>
                        <button type="submit" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2">Set</button>
                      </form>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={hapusKelas} className="inline">
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">
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
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">{Icon.Building}</div>
                      <div>
                        <div className="font-medium text-slate-600 mb-1">Belum ada kelas</div>
                        <div className="text-xs">Tambahkan kelas baru di atas</div>
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