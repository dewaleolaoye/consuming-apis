import type { CreateTodoInput, PatchTodoInput, Todo, UpdateTodoInput } from "./api.interface";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7071';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getTodos() {
  return request<Todo[]>('/todos');
}

export function getTodo(id: number) {
  return request<Todo>(`/todos/${id}`);
}

export function createTodo(input: CreateTodoInput) {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTodo(id: number, input: UpdateTodoInput) {
  return request<Todo>(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function patchTodo(id: number, input: PatchTodoInput) {
  return request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTodo(id: number) {
  return request<void>(`/todos/${id}`, {
    method: 'DELETE',
  });
}
