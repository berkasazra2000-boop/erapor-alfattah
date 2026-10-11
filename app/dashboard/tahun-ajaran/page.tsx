// app/dashboard/tahun-ajaran/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function tambahTahunAjaran(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const tahun = formData.get('tahun') as string
  const semester = parseInt(formData.get('semester') as string)

  await supabase.from('academic_years').insert({
    tahun,
    semester,
    is_active: false,
  })
  revalidatePath('/dashboard/tahun-ajaran')
}

async function setAktif(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase
    .from('academic_years')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  await supabase.from('academic_years').update({ is_active: true }).eq('id', id)

  revalidatePath('/dashboard/tahun-ajaran')
  revalidatePath('/dashboard/kelas')
}

async function hapus(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('academic_years').delete().eq('id', id)
  revalidatePath('/dashboard/tahun-ajaran')
}

export default async function TahunAjaranPage() {
  const supabase = await createClient()
  const { data: daftar } = await supabase
    .from('academic_years')
    .select('*')
    .order('tahun', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tahun Ajaran</h1>

      <div className="bg-white p-6 rounded-lg border mb-6">
        <h2 className="font-semibold mb-4">Tambah Tahun Ajaran</h2>
        <form action={tambahTahunAjaran} className="flex gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Tahun</label>
            <input
            name="tahun"
            placeholder="2026/2027"
            required
            className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Semester</label>
            <select name="semester" required className="border rounded px-3 py-2">
              <option value="1">1 (Ganjil)</option>
              <option value="2">2 (Genap)</option>
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

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Tahun</th>
              <th className="text-left px-4 py-3">Semester</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar && daftar.length > 0 ? (
              daftar.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{row.tahun}</td>
                  <td className="px-4 py-3">
                    {row.semester === 1 ? 'Ganjil' : 'Genap'}
                  </td>
                  <td className="px-4 py-3">
                    {row.is_active ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {!row.is_active && (
                      <form action={setAktif} className="inline">
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Set Aktif
                        </button>
                      </form>
                    )}
                    <form action={hapus} className="inline">
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
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}