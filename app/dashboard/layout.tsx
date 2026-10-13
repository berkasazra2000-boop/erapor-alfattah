// app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="no-print">
        <Sidebar profile={profile} />
      </div>
      <main className="flex-1 p-8 overflow-x-auto min-w-0">{children}</main>
    </div>
  )
}