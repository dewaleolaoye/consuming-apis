import { useMemo, useState, type FormEvent } from 'react'
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  usePatchTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from './api.hooks'
import type { Todo } from './api'

type Filter = 'all' | 'active' | 'completed'

const filters: Filter[] = ['all', 'active', 'completed']

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  const todosQuery = useTodosQuery()
  const createTodo = useCreateTodoMutation()
  const patchTodo = usePatchTodoMutation()
  const updateTodo = useUpdateTodoMutation()
  const deleteTodo = useDeleteTodoMutation()

  const todos = useMemo(() => todosQuery.data ?? [], [todosQuery.data])
  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount
  const completion = todos.length ? Math.round((completedCount / todos.length) * 100) : 0
  const isSaving =
    createTodo.isPending ||
    patchTodo.isPending ||
    updateTodo.isPending ||
    deleteTodo.isPending

  function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    createTodo.mutate(
      {
        title: trimmedTitle,
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
        },
      },
    )
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
    setEditingDescription(todo.description ?? '')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingTitle('')
    setEditingDescription('')
  }

  function saveTodo(todo: Todo) {
    const trimmedTitle = editingTitle.trim()

    if (!trimmedTitle) return

    updateTodo.mutate(
      {
        id: todo.id,
        input: {
          title: trimmedTitle,
          description: editingDescription.trim() || null,
          completed: todo.completed,
        },
      },
      {
        onSuccess: cancelEditing,
      },
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              Todo workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Plan the day with less friction.
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-96">
            <Stat label="Total" value={todos.length} />
            <Stat label="Active" value={activeCount} />
            <Stat label="Done" value={`${completion}%`} />
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[380px_1fr]">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <form className="space-y-4" onSubmit={handleCreateTodo}>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="todo-title">
                  Task
                </label>
                <input
                  id="todo-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Add a new task"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="todo-description">
                  Notes
                </label>
                <textarea
                  id="todo-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Optional details"
                />
              </div>

              <button
                type="submit"
                disabled={!title.trim() || createTodo.isPending}
                className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {createTodo.isPending ? 'Adding...' : 'Add todo'}
              </button>
            </form>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Tasks</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isSaving ? 'Syncing changes...' : `${visibleTodos.length} shown`}
                </p>
              </div>

              <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`h-9 rounded px-3 text-sm font-medium capitalize transition ${
                      filter === item
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {todosQuery.isLoading ? (
                <EmptyState title="Loading todos" detail="Fetching the latest list from the API." />
              ) : todosQuery.isError ? (
                <EmptyState
                  title="Could not load todos"
                  detail={todosQuery.error.message}
                  tone="error"
                />
              ) : visibleTodos.length === 0 ? (
                <EmptyState
                  title="No todos here"
                  detail="Create a task or switch filters to see more items."
                />
              ) : (
                visibleTodos.map((todo) => (
                  <article key={todo.id} className="p-4 transition hover:bg-slate-50">
                    {editingId === todo.id ? (
                      <div className="space-y-3">
                        <input
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        />
                        <textarea
                          value={editingDescription}
                          onChange={(event) => setEditingDescription(event.target.value)}
                          className="min-h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveTodo(todo)}
                            disabled={!editingTitle.trim() || updateTodo.isPending}
                            className="h-9 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="h-9 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          aria-label={todo.completed ? 'Mark active' : 'Mark completed'}
                          onClick={() =>
                            patchTodo.mutate({
                              id: todo.id,
                              input: { completed: !todo.completed },
                            })
                          }
                          className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                            todo.completed
                              ? 'border-emerald-700 bg-emerald-700 text-white'
                              : 'border-slate-300 bg-white text-transparent hover:border-emerald-700'
                          }`}
                        >
                          <span className="text-sm leading-none">✓</span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <h3
                            className={`text-base font-semibold ${
                              todo.completed ? 'text-slate-400 line-through' : 'text-slate-950'
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description ? (
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {todo.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(todo)}
                            className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTodo.mutate(todo.id)}
                            className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
    </div>
  )
}

function EmptyState({
  title,
  detail,
  tone = 'neutral',
}: {
  title: string
  detail: string
  tone?: 'neutral' | 'error'
}) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <p
          className={`text-lg font-semibold ${
            tone === 'error' ? 'text-red-700' : 'text-slate-950'
          }`}
        >
          {title}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{detail}</p>
      </div>
    </div>
  )
}

export default App
