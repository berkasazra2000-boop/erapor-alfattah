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

async function simpanCetak(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const tempat_cetak = (formData.get('tempat_cetak') as string) || null
  const tanggal_cetak = (formData.get('tanggal_cetak') as string) || null

  await supabase
    .from('academic_years')
    .update({ tempat_cetak, tanggal_cetak })
    .eq('id', id)

  revalidatePath('/dashboard/tahun-ajaran')
  revalidatePath('/dashboard/rapor')
}

export default async function TahunAjaranPage() {
  const supabase = await createClient()
  const { data: daftar } = await supabase
    .from('academic_years')
    .select('*')
    .order('tahun', { ascending: false })

  const aktif = (daftar ?? []).find((d) => d.is_active)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tahun Ajaran</h1>

      {/* Form tambah */}
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

      {/* Form pengaturan cetak (hanya untuk tahun ajaran aktif) */}
      {aktif && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h2 className="font-semibold mb-1">
            Pengaturan Cetak Rapor — {aktif.tahun} Smt {aktif.semester}
          </h2>
          <p className="text-xs text-gray-600 mb-4">
            Tanggal & tempat ini akan muncul di bagian bawah rapor.
          </p>
          <form action={simpanCetak} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input type="hidden" name="id" value={aktif.id} />
            <div>
              <label className="block text-sm mb-1">Tempat Cetak</label>
              <input
                name="tempat_cetak"
                defaultValue={aktif.tempat_cetak ?? ''}
                placeholder="Lamongan"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Tanggal Cetak</label>
              <input
                type="date"
                name="tanggal_cetak"
                defaultValue={aktif.tanggal_cetak ?? ''}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 Simpan Pengaturan Cetak
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel daftar */}
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