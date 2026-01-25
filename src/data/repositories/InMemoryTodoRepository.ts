import type { ITodoRepository } from "./ITodoRepository";
import type { Todo } from "../../domain/entities/Todo";

const DUMMY: Todo[] = [
  { id: "1", title: "Write MVP", completed: false },
  { id: "2", title: "Ship starter", completed: false }
];

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [...DUMMY];

  async getTodos(): Promise<Todo[]> {
    // simulate network latency
    await new Promise((r) => setTimeout(r, 50));
    return this.todos.slice();
  }

  async toggleTodo(id: string): Promise<Todo> {
    const idx = this.todos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Not found");
    this.todos[idx] = { ...this.todos[idx], completed: !this.todos[idx].completed };
    return this.todos[idx];
  }
}