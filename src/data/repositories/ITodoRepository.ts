import type { Todo } from "../../domain/entities/Todo";

export interface ITodoRepository {
  getTodos(): Promise<Todo[]>;
  toggleTodo(id: string): Promise<Todo>;
}