// app/dashboard/siswa/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const Icon = {
  ArrowLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Save: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
}

async function updateSiswa(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const nama = formData.get('nama') as string
  const nis = (formData.get('nis') as string) || null
  const nisn = (formData.get('nisn') as string) || null
  const class_id = formData.get('class_id') as string

  await supabase
    .from('students')
    .update({ nama, nis, nisn, class_id })
    .eq('id', id)

  revalidatePath('/dashboard/siswa')
  redirect('/dashboard/siswa')
}

export default async function EditSiswaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Ambil data siswa berdasarkan ID
  const { data: siswa } = await supabase
    .from('students')
    .select('id, nama, nis, nisn, class_id')
    .eq('id', id)
    .single()

  if (!siswa) notFound()

  // Ambil data kelas untuk dropdown
  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama, class_levels(nama)')
    .order('nama')

  return (
    <div>
      <Link
        href="/dashboard/siswa"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors mb-3"
      >
        {Icon.ArrowLeft} Kembali ke Daftar Siswa
      </Link>

      <PageHeader
        title="Edit Data Siswa"
        subtitle={`Mengubah data untuk ${siswa.nama}`}
        badge="Manajemen Data"
      />

      <Card className="max-w-3xl">
        <CardHeader title="Form Edit Siswa" subtitle="Perbarui informasi Nama, NIS, NISN, atau pindah Kelas." />
        <form action={updateSiswa} className="p-6 space-y-5">
          <input type="hidden" name="id" value={siswa.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                name="nama"
                required
                defaultValue={siswa.nama}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NIS</label>
              <input
                name="nis"
                defaultValue={siswa.nis ?? ''}
                placeholder="Nomor Induk Siswa"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NISN</label>
              <input
                name="nisn"
                defaultValue={siswa.nisn ?? ''}
                placeholder="Nomor Induk Siswa Nasional"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas</label>
              <select
                name="class_id"
                required
                defaultValue={siswa.class_id}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white"
              >
                {kelas?.map((k: any) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.class_levels?.nama})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/dashboard/siswa"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </Link>
            <Button type="submit">
              {Icon.Save} Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}