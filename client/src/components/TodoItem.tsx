import { useState } from 'react';
import type { Todo, UpdateTodoInput } from '../api.interface';

type TodoItemProps = {
  todo: Todo;
  isUpdating: boolean;
  onDelete: (id: number) => void;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<unknown>;
};

export function TodoItem({ todo, isUpdating, onDelete, onToggle, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const [editingDescription, setEditingDescription] = useState(todo.description ?? '');

  function startEditing() {
    setIsEditing(true);
    setEditingTitle(todo.title);
    setEditingDescription(todo.description ?? '');
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditingTitle(todo.title);
    setEditingDescription(todo.description ?? '');
  }

  async function saveTodo() {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) return;

    await onUpdate(todo.id, {
      title: trimmedTitle,
      description: editingDescription.trim() || null,
      completed: todo.completed,
    });

    setIsEditing(false);
  }

  return (
    <article className='p-4 transition hover:bg-slate-50'>
      {isEditing ? (
        <div className='space-y-3'>
          <input
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            className='h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
          />
          <textarea
            value={editingDescription}
            onChange={(event) => setEditingDescription(event.target.value)}
            className='min-h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
          />
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={saveTodo}
              disabled={!editingTitle.trim() || isUpdating}
              className='h-9 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500'
            >
              Save
            </button>
            <button
              type='button'
              onClick={cancelEditing}
              className='h-9 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950'
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className='flex gap-4'>
          <button
            type='button'
            aria-label={todo.completed ? 'Mark active' : 'Mark completed'}
            onClick={() => onToggle(todo)}
            className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
              todo.completed
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-slate-300 bg-white text-transparent hover:border-emerald-700'
            }`}
          >
            <span className='text-sm leading-none'>✓</span>
          </button>

          <div className='min-w-0 flex-1'>
            <h3
              className={`text-base font-semibold ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-950'}`}
            >
              {todo.title}
            </h3>
            {todo.description ? <p className='mt-1 text-sm leading-6 text-slate-500'>{todo.description}</p> : null}
          </div>

          <div className='flex shrink-0 gap-2'>
            <button
              type='button'
              onClick={startEditing}
              className='h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950'
            >
              Edit
            </button>
            <button
              type='button'
              onClick={() => onDelete(todo.id)}
              className='h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50'
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
