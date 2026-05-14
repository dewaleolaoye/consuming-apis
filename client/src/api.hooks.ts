import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  patchTodo,
  updateTodo,
  type CreateTodoInput,
  type PatchTodoInput,
  type Todo,
  type UpdateTodoInput,
} from './api'
import { queryClient } from './queryClient'
import { todoKeys } from './queryKeys'

type MutationContext = {
  previousTodos?: Todo[]
}

export function useTodosQuery() {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: getTodos,
  })
}

export function useTodoQuery(id: number) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => getTodo(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useCreateTodoMutation() {
  return useMutation<Todo, Error, CreateTodoInput, MutationContext>({
    mutationFn: createTodo,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists())
      const now = new Date().toISOString()
      const optimisticTodo: Todo = {
        id: -Date.now(),
        title: input.title,
        description: input.description ?? null,
        completed: input.completed ?? false,
        created_at: now,
        updated_at: now,
      }

      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (current = []) => [
        optimisticTodo,
        ...current,
      ])

      return { previousTodos }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

export function useUpdateTodoMutation() {
  return useMutation<Todo, Error, { id: number; input: UpdateTodoInput }, MutationContext>({
    mutationFn: ({ id, input }) => updateTodo(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists())
      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (current = []) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, ...input, updated_at: new Date().toISOString() } : todo,
        ),
      )

      return { previousTodos }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previousTodos)
    },
    onSuccess: (todo) => {
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

export function usePatchTodoMutation() {
  return useMutation<Todo, Error, { id: number; input: PatchTodoInput }, MutationContext>({
    mutationFn: ({ id, input }) => patchTodo(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists())
      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (current = []) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, ...input, updated_at: new Date().toISOString() } : todo,
        ),
      )

      return { previousTodos }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previousTodos)
    },
    onSuccess: (todo) => {
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

export function useDeleteTodoMutation() {
  return useMutation<void, Error, number, MutationContext>({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists())
      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (current = []) =>
        current.filter((todo) => todo.id !== id),
      )

      return { previousTodos }
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previousTodos)
    },
    onSettled: (_data, _error, id) => {
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
