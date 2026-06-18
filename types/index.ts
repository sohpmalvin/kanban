export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  position: number
  created_at: string
}

export interface Column {
  id: Status
  title: string
  color: string
  accent: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500', accent: 'border-blue-400' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500', accent: 'border-amber-400' },
  { id: 'done', title: 'Done', color: 'bg-green-500', accent: 'border-green-400' },
]
