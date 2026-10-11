import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server' // tambahkan ini
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection() // WAJIB: beri tahu Next.js bahwa ini request-time

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
      <Sidebar profile={profile} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}