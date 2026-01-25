import { apiClient } from "../../services/api";
import type { ITodoRepository } from "./ITodoRepository";
import type { Todo } from "../../domain/entities/Todo";

export class ApiTodoRepository implements ITodoRepository {
  // GET /todos
  async getTodos(): Promise<Todo[]> {
    try {
      const res = await apiClient.get<Todo[]>("/todos");
      // ensure we map fields as our Todo type expects
      return (res.data || []).map((t: any) => ({
        id: String(t.id),
        title: t.title,
        completed: Boolean(t.completed),
        createdAt: t.createdAt
      }));
    } catch (err: any) {
      throw new Error(err?.message ?? "Failed to fetch todos");
    }
  }

  // POST /todos
  async createTodo(title: string): Promise<Todo> {
    try {
      const payload = {
        title,
        completed: false,
        createdAt: new Date().toISOString()
      };
      const res = await apiClient.post("/todos", payload);
      return {
        id: String(res.data.id),
        title: res.data.title,
        completed: Boolean(res.data.completed),
        createdAt: res.data.createdAt
      };
    } catch (err: any) {
      throw new Error(err?.message ?? "Failed to create todo");
    }
  }

  // PUT /todos/:id
  async updateTodo(todo: Todo): Promise<Todo> {
    try {
      const res = await apiClient.put(`/todos/${todo.id}`, {
        ...todo
      });
      return {
        id: String(res.data.id),
        title: res.data.title,
        completed: Boolean(res.data.completed),
        createdAt: res.data.createdAt
      };
    } catch (err: any) {
      throw new Error(err?.message ?? "Failed to update todo");
    }
  }

  // DELETE /todos/:id
  async deleteTodo(id: string): Promise<void> {
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (err: any) {
      throw new Error(err?.message ?? "Failed to delete todo");
    }
  }

  // Toggle uses GET + PUT (to know current completed state)
  async toggleTodo(id: string): Promise<Todo> {
    try {
      const getRes = await apiClient.get(`/todos/${id}`);
      const current = getRes.data;
      const updated = { ...current, completed: !current.completed };
      const res = await apiClient.put(`/todos/${id}`, updated);
      return {
        id: String(res.data.id),
        title: res.data.title,
        completed: Boolean(res.data.completed),
        createdAt: res.data.createdAt
      };
    } catch (err: any) {
      throw new Error(err?.message ?? "Failed to toggle todo");
    }
  }
}