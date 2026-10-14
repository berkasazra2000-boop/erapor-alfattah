// app/dashboard/rapor/BulkPrintButton.tsx
'use client'

import { useState } from 'react'

export default function BulkPrintButton({
  classId,
  kelasNama,
}: {
  classId: string
  kelasNama: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (
      !confirm(
        `Download rapor SEMUA siswa kelas ${kelasNama}? Ini mungkin butuh 1-2 menit.`
      )
    )
      return

    setLoading(true)
    try {
      const res = await fetch('/api/generate-pdf-kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Gagal generate PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `rapor-kelas-${kelasNama}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('❌ ' + (err.message ?? 'Gagal generate PDF'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-50 transition-all"
      style={{ fontFamily: 'var(--font-jakarta)' }}
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Memproses...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
          Cetak Semua
        </>
      )}
    </button>
  )
}