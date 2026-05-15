export type Todo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTodoInput = {
  title: string;
  description?: string | null;
  completed?: boolean;
};

export type UpdateTodoInput = Partial<{
  title: string;
  description: string | null;
  completed: boolean;
}>;
