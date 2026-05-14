import { useState, type FormEvent } from 'react';
import { useCreateTodoMutation } from '../api.hooks';

export function TodoForm() {
  const { mutateAsync: createTodo, isPending: isCreating } = useCreateTodoMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    await createTodo({
      title: trimmedTitle,
      description: description.trim() || null,
    });

    setTitle('');
    setDescription('');
  }

  return (
    <aside className='h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
      <form
        className='space-y-4'
        onSubmit={handleSubmit}
      >
        <div>
          <label
            className='text-sm font-medium text-slate-700'
            htmlFor='todo-title'
          >
            Task
          </label>
          <input
            id='todo-title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className='mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
            placeholder='Add a new task'
          />
        </div>

        <div>
          <label
            className='text-sm font-medium text-slate-700'
            htmlFor='todo-description'
          >
            Notes
          </label>
          <textarea
            id='todo-description'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className='mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
            placeholder='Optional details'
          />
        </div>

        <button
          type='submit'
          disabled={!title.trim() || isCreating}
          className='h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500'
        >
          {isCreating ? 'Adding...' : 'Add todo'}
        </button>
      </form>
    </aside>
  );
}
