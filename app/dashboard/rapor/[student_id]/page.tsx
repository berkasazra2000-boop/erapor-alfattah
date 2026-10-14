// app/dashboard/rapor/[student_id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRaporData } from '@/lib/rapor-data'
import RaporContent from '@/components/RaporContent'
import PrintButton from './PrintButton'

export default async function RaporDetailPage({
  params,
}: {
  params: Promise<{ student_id: string }>
}) {
  const { student_id } = await params
  const data = await getRaporData(student_id)
  if (!data) notFound()

  return (
    <div>
      <div className="no-print mb-5">
        <Link
          href="/dashboard/rapor"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Preview Rapor
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {data.siswa.nama}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelas {data.siswa.kelas} · NIS {data.siswa.nis}
            </p>
          </div>
          <PrintButton studentId={student_id} />
        </div>
      </div>

      <div className="no-print mb-5 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl text-xs flex items-start gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <b>Tips:</b> Klik tombol Cetak → PDF akan otomatis ter-download.
        </div>
      </div>

      <div className="bg-slate-100 rounded-2xl p-5 md:p-8 overflow-x-auto">
        <div className="bg-white shadow-xl mx-auto" style={{ width: '210mm', maxWidth: '100%' }}>
          <RaporContent
            sekolah={data.sekolah}
            siswa={data.siswa}
            tahun={data.tahun}
            mapel={data.mapel as any}
            ekskul={data.ekskul}
            absensi={data.absensi}
            catatan={data.catatan}
            waliKelas={data.waliKelas}
          />
        </div>
      </div>
    </div>
  )
}