'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column, Task } from '@/types'
import TaskCard from './TaskCard'

interface Props {
  column: Column
  tasks: Task[]
  onAddTask: (status: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export default function KanbanColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h2 className="font-semibold text-slate-700 text-sm">{column.title}</h2>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title={`Add task to ${column.title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl p-3 min-h-52 transition-colors ${
          isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-100/70'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400">
            <p className="text-xs">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
