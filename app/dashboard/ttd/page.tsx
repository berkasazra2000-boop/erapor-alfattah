// app/dashboard/ttd/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import UploadForm from './UploadForm'

export default async function TTDPage() {
  const supabase = await createClient()
  
  const { data: sekolah } = await supabase.from('schools').select('kepala_sekolah, kepala_sekolah_ttd_url').limit(1).single()
  const { data: guru } = await supabase.from('profiles').select('id, nama, ttd_url').in('role', ['guru_mapel', 'wali_kelas']).order('nama')

  return (
    <div>
      <PageHeader title="Tanda Tangan Digital" subtitle="Upload scan tanda tangan untuk rapor PDF" badge="Pengaturan" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KOLOM KEPSEK */}
        <Card>
          <CardHeader title="Kepala Sekolah" subtitle={sekolah?.kepala_sekolah || '-'} />
          <div className="p-5">
            <UploadForm userId="kepsek" currentUrl={sekolah?.kepala_sekolah_ttd_url} />
          </div>
        </Card>
        
        {/* KOLOM GURU */}
        <Card>
          <CardHeader title="Guru / Wali Kelas" subtitle="Upload TTD masing-masing guru" />
          <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto">
            {guru?.map((g) => (
              <div key={g.id} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="font-medium text-sm mb-2">{g.nama}</div>
                <UploadForm userId={g.id} currentUrl={g.ttd_url} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}