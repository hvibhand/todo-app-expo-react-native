import type { Todo } from "../../domain/entities/Todo";

export interface ITodoRepository {
  getTodos(): Promise<Todo[]>;
  createTodo(title: string): Promise<Todo>;
  updateTodo(todo: Todo): Promise<Todo>;
  deleteTodo(id: string): Promise<void>;
  toggleTodo(id: string): Promise<Todo>;
}