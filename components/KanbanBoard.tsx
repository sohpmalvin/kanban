'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Task, Status, Priority, COLUMNS } from '@/types'
import { createClient } from '@/lib/supabase-client'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'

interface Props {
  initialTasks: Task[]
  userId: string
}

export default function KanbanBoard({ initialTasks, userId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [modal, setModal] = useState<{ open: boolean; task?: Task; status?: string }>({ open: false })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const supabase = createClient()

  const tasksByStatus = useCallback(
    (status: Status) => tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position),
    [tasks]
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    const overTask = tasks.find(t => t.id === overId)
    const overStatus = overTask ? overTask.status : (overId as Status)

    if (COLUMNS.some(c => c.id === overId) && activeTask.status !== overStatus) {
      setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overStatus as Status } : t))
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    setTasks(prev => {
      const activeTask = prev.find(t => t.id === activeId)
      if (!activeTask) return prev

      const overTask = prev.find(t => t.id === overId)
      const newStatus: Status = overTask ? overTask.status : (overId as Status)

      let updated = prev.map(t => t.id === activeId ? { ...t, status: newStatus } : t)

      if (overTask && activeId !== overId) {
        const activeIdx = updated.findIndex(t => t.id === activeId)
        const overIdx = updated.findIndex(t => t.id === overId)
        updated = arrayMove(updated, activeIdx, overIdx)
      }

      supabase.from('tasks').update({ status: newStatus }).eq('id', activeId).then(() => {})

      return updated
    })
  }

  async function handleSaveTask({ title, description, priority }: { title: string; description: string; priority: Priority }) {
    if (modal.task) {
      const updated = { title, description: description || null, priority }
      const { data } = await supabase.from('tasks').update(updated).eq('id', modal.task.id).select().single()
      if (data) setTasks(prev => prev.map(t => t.id === data.id ? data : t))
    } else {
      const status = (modal.status ?? 'todo') as Status
      const position = tasks.filter(t => t.status === status).length
      const { data } = await supabase
        .from('tasks')
        .insert({ title, description: description || null, priority, status, position, user_id: userId })
        .select()
        .single()
      if (data) setTasks(prev => [...prev, data])
    }
    setModal({ open: false })
  }

  async function handleDeleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-5 p-4 md:p-6 md:min-w-max">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus(column.id)}
              onAddTask={(status) => setModal({ open: true, status })}
              onEditTask={(task) => setModal({ open: true, task })}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          onSave={handleSaveTask}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
