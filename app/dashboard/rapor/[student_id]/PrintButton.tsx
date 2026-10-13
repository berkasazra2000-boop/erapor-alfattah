// app/dashboard/rapor/[student_id]/PrintButton.tsx
'use client'

import { useState } from 'react'

export default function PrintButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Gagal generate PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
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
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
    >
      {loading ? '⏳ Memproses...' : '🖨️ Cetak / Simpan PDF'}
    </button>
  )
}