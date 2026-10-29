// app/dashboard/ttd/UploadForm.tsx
'use client'

import { useState } from 'react'
import { uploadTTD } from './actions'

export default function UploadForm({ userId, currentUrl }: { userId: string, currentUrl?: string | null }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('userId', userId)
    
    const res = await uploadTTD(formData)
    setLoading(false)
    
    if (res.error) setMsg('❌ ' + res.error)
    else setMsg('✅ Berhasil diupload')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {currentUrl ? (
        <div className="p-2 border rounded-lg bg-slate-50 flex justify-center h-24 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="TTD" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="p-2 border border-dashed rounded-lg bg-slate-50 flex justify-center items-center h-24 text-xs text-slate-400">
          Belum ada TTD
        </div>
      )}
      
      <input type="file" name="file" accept="image/png, image/jpeg" required className="block w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
      
      <button type="submit" disabled={loading} className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg w-full font-medium disabled:opacity-50">
        {loading ? 'Mengupload...' : 'Upload TTD'}
      </button>
      
      {msg && <div className="text-[10px] font-medium text-slate-600">{msg}</div>}
    </form>
  )
}