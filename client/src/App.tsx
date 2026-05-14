import { useMemo, useState } from 'react';
import { useDeleteTodoMutation, usePatchTodoMutation, useTodosQuery, useUpdateTodoMutation } from './api.hooks';
import { EmptyState } from './components/EmptyState';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { TodoStats } from './components/TodoStats';
import { useIsMutating } from '@tanstack/react-query';
// import { getTodos, type Todo } from './api';

type Filter = 'all' | 'active' | 'completed';

const filters: Filter[] = ['all', 'active', 'completed'];

function App() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading, isError, error } = useTodosQuery();
  const isCreating =
    useIsMutating({
      mutationKey: ['create'],
    }) > 0;

  const { mutate: patchTodo, isPending: isPatching } = usePatchTodoMutation();
  const { mutateAsync: updateTodo, isPending: isUpdating } = useUpdateTodoMutation();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodoMutation();

  const todos = useMemo(() => data ?? [], [data]);
  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed);
    if (filter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }, [filter, todos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const completion = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const isSaving = isCreating || isPatching || isUpdating || isDeleting;

  // const [fetchedData, setFetchedData] = useState<Todo[]>();
  // const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   const fetchFn = async () => {
  //     setLoading(true);
  //     const response = await getTodos();
  //     setFetchedData(response);
  //     setLoading(false);
  //   };

  //   fetchFn();
  // }, []);

  // console.log(fetchedData, loading, 'fetchedData');

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
          <TodoForm />

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
              {isLoading ? (
                <EmptyState
                  title='Loading todos'
                  detail='Fetching the latest list from the API.'
                />
              ) : isError ? (
                <EmptyState
                  title='Could not load todos'
                  detail={error.message}
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
                    isUpdating={isUpdating}
                    onDelete={deleteTodo}
                    onToggle={(selectedTodo) =>
                      patchTodo({
                        id: selectedTodo.id,
                        input: { completed: !selectedTodo.completed },
                      })
                    }
                    onUpdate={(id, input) => updateTodo({ id, input })}
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
