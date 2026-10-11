// app/dashboard/siswa/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function tambahSiswa(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const nama = formData.get('nama') as string
  const nis = formData.get('nis') as string
  const nisn = formData.get('nisn') as string
  const class_id = formData.get('class_id') as string

  await supabase.from('students').insert({
    nama,
    nis,
    nisn,
    class_id,
  })

  revalidatePath('/dashboard/siswa')
}

async function hapusSiswa(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('students').delete().eq('id', id)
  revalidatePath('/dashboard/siswa')
}

export default async function SiswaPage() {
  const supabase = await createClient()

  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_levels(nama)')
    .order('nama')

  const { data: daftar } = await supabase
    .from('students')
    .select('id, nama, nis, nisn, classes(nama)')
    .order('nama')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Siswa</h1>
        <Link
          href="/dashboard/siswa/import"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          📥 Import Excel
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg border mb-6">
        <h2 className="font-semibold mb-4">Tambah Siswa</h2>
        <form action={tambahSiswa} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input
              name="nama"
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">NIS</label>
            <input
              name="nis"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">NISN</label>
            <input
              name="nisn"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Kelas</label>
            <select name="class_id" required className="border rounded px-3 py-2 w-full">
              <option value="">Pilih...</option>
              {kelas?.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.class_levels?.nama})
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

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">NIS</th>
              <th className="text-left px-4 py-3">NISN</th>
              <th className="text-left px-4 py-3">Kelas</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar && daftar.length > 0 ? (
              daftar.map((row: any) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.nama}</td>
                  <td className="px-4 py-3">{row.nis ?? '-'}</td>
                  <td className="px-4 py-3">{row.nisn ?? '-'}</td>
                  <td className="px-4 py-3">{row.classes?.nama ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={hapusSiswa} className="inline">
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
                  Belum ada siswa
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}