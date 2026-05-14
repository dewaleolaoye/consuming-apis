export const todoKeys = {
  all: ['todos'],
  lists: () => [...todoKeys.all, 'list'],
  detail: (id: number) => [...todoKeys.all, 'detail', id],
  createTodo: ['create']
};
