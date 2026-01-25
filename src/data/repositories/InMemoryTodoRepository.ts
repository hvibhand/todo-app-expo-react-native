import type { ITodoRepository } from "./ITodoRepository";
import type { Todo } from "../../domain/entities/Todo";

const DUMMY: Todo[] = [
  { id: "1", title: "Write MVP", completed: false },
  { id: "2", title: "Ship starter", completed: false }
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [...DUMMY];

  async getTodos(): Promise<Todo[]> {
    await new Promise((r) => setTimeout(r, 50));
    return this.todos.slice();
  }

  async createTodo(title: string): Promise<Todo> {
    const todo: Todo = { id: generateId(), title, completed: false };
    this.todos = [todo, ...this.todos];
    await new Promise((r) => setTimeout(r, 50));
    return todo;
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const idx = this.todos.findIndex((t) => t.id === todo.id);
    if (idx === -1) throw new Error("Not found");
    this.todos[idx] = { ...todo };
    await new Promise((r) => setTimeout(r, 50));
    return this.todos[idx];
  }

  async deleteTodo(id: string): Promise<void> {
    const idx = this.todos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Not found");
    this.todos.splice(idx, 1);
    await new Promise((r) => setTimeout(r, 50));
  }

  async toggleTodo(id: string): Promise<Todo> {
    const idx = this.todos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Not found");
    this.todos[idx] = { ...this.todos[idx], completed: !this.todos[idx].completed };
    await new Promise((r) => setTimeout(r, 50));
    return this.todos[idx];
  }
}