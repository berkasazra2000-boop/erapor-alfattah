// app/dashboard/siswa/import/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ImportForm from './ImportForm'

export default async function ImportSiswaPage() {
  const supabase = await createClient()
  const { data: kelas } = await supabase
    .from('classes')
    .select('id, nama')
    .order('nama')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/siswa"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke Siswa
        </Link>
        <h1 className="text-2xl font-bold mt-2">Import Siswa dari Excel</h1>
      </div>

      <ImportForm kelas={kelas ?? []} />
    </div>
  )
}