// app/dashboard/guru/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import AssignForm from './AssignForm'
import { hapusAssign } from './actions'

const Icon = {
  Trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>
  ),
  Users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" /></svg>
  ),
}

export default async function GuruPage() {
  const supabase = await createClient()

  const { data: guru } = await supabase.from('profiles').select('id, nama, role').in('role', ['guru_mapel', 'wali_kelas']).order('nama')
  const { data: kelas } = await supabase.from('classes').select('id, nama, class_level_id').order('nama')
  const { data: mapelRaw } = await supabase.from('class_level_subjects').select('class_level_id, subjects(id, nama)')

  const mapel = ((mapelRaw as any[]) ?? []).map((m: any) => ({
    id: m.subjects?.id,
    nama: m.subjects?.nama,
    class_level_id: m.class_level_id,
  }))

  const { data: assignments } = await supabase.from('teacher_subjects').select(`id, profiles(nama), classes(nama), subjects(nama)`).order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Guru & Assign Mapel" subtitle="Assign guru ke mata pelajaran per kelas" badge="Manajemen Data" />

      <Card className="mb-6">
        <CardHeader title="Assign Guru ke Mapel + Kelas" subtitle="Pilih guru, kelas, lalu mapel yang diajar" />
        <div className="p-5">
          <AssignForm guru={guru ?? []} kelas={kelas ?? []} mapel={mapel as any} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Daftar Assignment" subtitle={`Total ${assignments?.length ?? 0} penugasan`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guru</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assignments && assignments.length > 0 ? (
                assignments.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.profiles?.nama}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{row.classes?.nama}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">{row.subjects?.nama}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={hapusAssign} className="inline">
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">{Icon.Trash}</button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">{Icon.Users}</div>
                      <div className="font-medium text-slate-600">Belum ada assignment</div>
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