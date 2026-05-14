import { useMemo, useState } from 'react';
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  usePatchTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from './api.hooks';
import { EmptyState } from './components/EmptyState';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { TodoStats } from './components/TodoStats';

type Filter = 'all' | 'active' | 'completed';

const filters: Filter[] = ['all', 'active', 'completed'];

function App() {
  const [filter, setFilter] = useState<Filter>('all');

  const todosQuery = useTodosQuery();
  const createTodo = useCreateTodoMutation();
  const patchTodo = usePatchTodoMutation();
  const updateTodo = useUpdateTodoMutation();
  const deleteTodo = useDeleteTodoMutation();

  const todos = useMemo(() => todosQuery.data ?? [], [todosQuery.data]);
  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed);
    if (filter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }, [filter, todos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const completion = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const isSaving = createTodo.isPending || patchTodo.isPending || updateTodo.isPending || deleteTodo.isPending;

  return (
    <main className='min-h-screen bg-[#f6f7f4] text-slate-950'>
      <section className='mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8'>
        <header className='flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-emerald-700'>Todo workspace</p>
            <h1 className='mt-3 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl'>
              Plan the day with less friction.
            </h1>
          </div>
          <TodoStats
            total={todos.length}
            active={activeCount}
            completion={completion}
          />
        </header>

        <div className='grid flex-1 gap-6 py-6 lg:grid-cols-[380px_1fr]'>
          <TodoForm
            isCreating={createTodo.isPending}
            onCreate={createTodo.mutateAsync}
          />

          <section className='rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-slate-950'>Tasks</h2>
                <p className='mt-1 text-sm text-slate-500'>
                  {isSaving ? 'Syncing changes...' : `${visibleTodos.length} shown`}
                </p>
              </div>

              <div className='grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1'>
                {filters.map((item) => (
                  <button
                    key={item}
                    type='button'
                    onClick={() => setFilter(item)}
                    className={`h-9 rounded px-3 text-sm font-medium capitalize transition ${
                      filter === item ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className='divide-y divide-slate-100'>
              {todosQuery.isLoading ? (
                <EmptyState
                  title='Loading todos'
                  detail='Fetching the latest list from the API.'
                />
              ) : todosQuery.isError ? (
                <EmptyState
                  title='Could not load todos'
                  detail={todosQuery.error.message}
                  tone='error'
                />
              ) : visibleTodos.length === 0 ? (
                <EmptyState
                  title='No todos here'
                  detail='Create a task or switch filters to see more items.'
                />
              ) : (
                visibleTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    isUpdating={updateTodo.isPending}
                    onDelete={deleteTodo.mutate}
                    onToggle={(selectedTodo) =>
                      patchTodo.mutate({
                        id: selectedTodo.id,
                        input: { completed: !selectedTodo.completed },
                      })
                    }
                    onUpdate={(id, input) => updateTodo.mutateAsync({ id, input })}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
