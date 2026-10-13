// app/dashboard/kelas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function tambahKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const nama = formData.get('nama') as string
  const class_level_id = formData.get('class_level_id') as string

  // Ambil tahun ajaran aktif
  const { data: aktif } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!aktif) return

  await supabase.from('classes').insert({
    nama,
    class_level_id,
    academic_year_id: aktif.id,
  })
  revalidatePath('/dashboard/kelas')
}

async function setWaliKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const wali_kelas_id = formData.get('wali_kelas_id') as string

  // Update kelas
  await supabase
    .from('classes')
    .update({ wali_kelas_id: wali_kelas_id || null })
    .eq('id', id)

  // Kalau ada wali kelas yang di-set, update role jadi 'wali_kelas'
  if (wali_kelas_id) {
    await supabase
      .from('profiles')
      .update({ role: 'wali_kelas' })
      .eq('id', wali_kelas_id)
      .in('role', ['guru_mapel', 'wali_kelas']) // jangan overwrite admin
  }

  revalidatePath('/dashboard/kelas')
  revalidatePath('/dashboard/wali-kelas')
}

async function hapusKelas(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('classes').delete().eq('id', id)
  revalidatePath('/dashboard/kelas')
}

export default async function KelasPage() {
  const supabase = await createClient()

  const { data: aktif } = await supabase
    .from('academic_years')
    .select('id, tahun, semester')
    .eq('is_active', true)
    .single()

  const { data: levels } = await supabase
    .from('class_levels')
    .select('*')
    .order('urutan')

  const { data: daftar } = await supabase
    .from('classes')
    .select(`
        id, nama,
        class_levels(nama),
        academic_years(tahun, semester),
        wali_kelas_id,
        profiles(nama)
    `)
    .order('nama')

  const { data: guru } = await supabase
    .from('profiles')
    .select('id, nama')
    .eq('role', 'wali_kelas')
    .order('nama')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Kelas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tahun ajaran aktif:{' '}
        {aktif ? (
          <span className="font-medium text-green-700">
            {aktif.tahun} — Semester {aktif.semester}
          </span>
        ) : (
          <span className="text-red-600">Belum ada. Set aktif dulu di Tahun Ajaran.</span>
        )}
      </p>

      {aktif && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="font-semibold mb-4">Tambah Kelas</h2>
          <form action={tambahKelas} className="flex gap-3 items-end">
            <div>
              <label className="block text-sm mb-1">Nama Kelas</label>
              <input
                name="nama"
                placeholder="X-1"
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Tingkat</label>
              <select
                name="class_level_id"
                required
                className="border rounded px-3 py-2"
              >
                <option value="">Pilih...</option>
                {levels?.map((lv) => (
                  <option key={lv.id} value={lv.id}>
                    {lv.nama}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Kelas</th>
              <th className="text-left px-4 py-3">Tingkat</th>
              <th className="text-left px-4 py-3">Tahun Ajaran</th>
              <th className="text-left px-4 py-3">Wali Kelas</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar && daftar.length > 0 ? (
              daftar.map((row: any) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.nama}</td>
                  <td className="px-4 py-3">{row.class_levels?.nama}</td>
                  <td className="px-4 py-3">
                    {row.academic_years?.tahun} — Smt {row.academic_years?.semester}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setWaliKelas} className="flex gap-2 items-center">
                        <input type="hidden" name="id" value={row.id} />
                        <select
                        name="wali_kelas_id"
                        defaultValue={row.wali_kelas_id ?? ''}
                        className="border rounded px-2 py-1 text-xs"
                        >
                        <option value="">— belum —</option>
                        {guru?.map((g) => (
                            <option key={g.id} value={g.id}>
                            {g.nama}
                            </option>
                        ))}
                        </select>
                        <button
                        type="submit"
                        className="text-blue-600 hover:underline text-xs"
                        >
                        Set
                        </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={hapusKelas} className="inline">
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Belum ada kelas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}