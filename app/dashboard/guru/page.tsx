// app/dashboard/guru/page.tsx
import { createClient } from '@/lib/supabase/server'
import AssignForm from './AssignForm'
import { hapusAssign } from './actions'

export default async function GuruPage() {
  const supabase = await createClient()

  const { data: guru } = await supabase
    .from('profiles')
    .select('id, nama, role')
    .in('role', ['guru_mapel', 'wali_kelas'])
    .order('nama')

  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_level_id')
    .order('nama')

  const { data: mapelRaw }: { data: any[] | null } = await supabase
    .from('class_level_subjects')
    .select('class_level_id, subjects(id, nama)')

  const mapel = ((mapelRaw as any[]) ?? []).map((m: any) => ({
    id: m.subjects?.id,
    nama: m.subjects?.nama,
    class_level_id: m.class_level_id,
    kategori: m.kategori,
    }))

  const { data: assignments } = await supabase
    .from('teacher_subjects')
    .select(`
      id,
      profiles(nama),
      classes(nama),
      subjects(nama)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Guru & Assign Mapel</h1>

      <div className="bg-white p-6 rounded-lg border mb-6">
        <h2 className="font-semibold mb-4">Assign Guru ke Mapel + Kelas</h2>
        <AssignForm guru={guru ?? []} kelas={kelas ?? []} mapel={mapel} />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Guru</th>
              <th className="text-left px-4 py-3">Kelas</th>
              <th className="text-left px-4 py-3">Mata Pelajaran</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {assignments && assignments.length > 0 ? (
              assignments.map((row: any) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.profiles?.nama}</td>
                  <td className="px-4 py-3">{row.classes?.nama}</td>
                  <td className="px-4 py-3">{row.subjects?.nama}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={hapusAssign} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline text-xs"
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Belum ada assignment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}