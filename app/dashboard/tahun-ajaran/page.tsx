// app/dashboard/tahun-ajaran/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const Icon = {
  Plus: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>),
  Trash: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>),
  Check: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  Calendar: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>),
}

async function tambahTahunAjaran(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const tahun = formData.get('tahun') as string
  const semester = parseInt(formData.get('semester') as string)
  await supabase.from('academic_years').insert({ tahun, semester, is_active: false })
  revalidatePath('/dashboard/tahun-ajaran')
}

async function setAktif(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('academic_years').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('academic_years').update({ is_active: true }).eq('id', id)
  revalidatePath('/dashboard/tahun-ajaran')
}

async function hapus(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('academic_years').delete().eq('id', id)
  revalidatePath('/dashboard/tahun-ajaran')
}

async function simpanCetak(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const tempat_cetak = (formData.get('tempat_cetak') as string) || null
  const tanggal_cetak = (formData.get('tanggal_cetak') as string) || null
  await supabase.from('academic_years').update({ tempat_cetak, tanggal_cetak }).eq('id', id)
  revalidatePath('/dashboard/tahun-ajaran')
}

export default async function TahunAjaranPage() {
  const supabase = await createClient()
  const { data: daftar } = await supabase.from('academic_years').select('*').order('tahun', { ascending: false })
  const aktif = (daftar ?? []).find((d) => d.is_active)

  return (
    <div>
      <PageHeader title="Tahun Ajaran" subtitle="Kelola tahun ajaran, semester, dan pengaturan cetak rapor" badge="Master Data" />

      <Card className="mb-6">
        <CardHeader title="Tambah Tahun Ajaran" subtitle="Buat tahun ajaran dan semester baru" />
        <form action={tambahTahunAjaran} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tahun</label>
            <input name="tahun" placeholder="2026/2027" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Semester</label>
            <select name="semester" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-emerald-500 outline-none">
              <option value="1">1 (Ganjil)</option>
              <option value="2">2 (Genap)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{Icon.Plus}Simpan</Button>
          </div>
        </form>
      </Card>

      {aktif && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardHeader title={`Pengaturan Cetak Rapor — ${aktif.tahun} Smt ${aktif.semester}`} subtitle="Tempat & tanggal ini akan muncul di bagian bawah rapor" />
          <form action={simpanCetak} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input type="hidden" name="id" value={aktif.id} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tempat Cetak</label>
              <input name="tempat_cetak" defaultValue={aktif.tempat_cetak ?? ''} placeholder="Lamongan" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tanggal Cetak</label>
              <input type="date" name="tanggal_cetak" defaultValue={aktif.tanggal_cetak ?? ''} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 outline-none bg-white" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">{Icon.Check}Simpan Pengaturan</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardHeader title="Daftar Tahun Ajaran" subtitle={`Total ${daftar?.length ?? 0} tahun ajaran`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar && daftar.length > 0 ? (
                daftar.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.tahun}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {row.semester === 1 ? 'Ganjil' : 'Genap'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {row.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-1">
                        {!row.is_active && (
                          <form action={setAktif} className="inline">
                            <input type="hidden" name="id" value={row.id} />
                            <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition-colors">
                              {Icon.Check}Set Aktif
                            </button>
                          </form>
                        )}
                        <form action={hapus} className="inline">
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">
                            {Icon.Trash}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">{Icon.Calendar}</div>
                      <div className="font-medium text-slate-600">Belum ada tahun ajaran</div>
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