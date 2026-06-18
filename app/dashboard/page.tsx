import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import KanbanBoard from '@/components/KanbanBoard'
import Header from '@/components/Header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <Header email={user.email!} />
      <KanbanBoard initialTasks={tasks ?? []} userId={user.id} />
    </div>
  )
}
