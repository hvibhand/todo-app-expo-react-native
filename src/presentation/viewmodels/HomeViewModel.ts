import { useEffect, useState, useCallback } from "react";
import type { Todo } from "../../domain/entities/Todo";
import type { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import type { CreateTodoUseCase } from "../../domain/usecases/CreateTodoUseCase";
import type { UpdateTodoUseCase } from "../../domain/usecases/UpdateTodoUseCase";
import type { DeleteTodoUseCase } from "../../domain/usecases/DeleteTodoUseCase";

/**
 * ViewModel implemented as a hook.
 * Accepts explicit use-cases for testability and clear separation.
 */
type Deps = {
  getTodosUseCase: GetTodosUseCase;
  createTodoUseCase: CreateTodoUseCase;
  updateTodoUseCase: UpdateTodoUseCase;
  deleteTodoUseCase: DeleteTodoUseCase;
};

export function useHomeViewModel(deps: Deps) {
  const { getTodosUseCase, createTodoUseCase, updateTodoUseCase, deleteTodoUseCase } = deps;

  const [loading, setLoading] = useState<boolean>(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodosUseCase.execute();
      setTodos(data);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getTodosUseCase]);

  const add = useCallback(
    async (title: string) => {
      try {
        // optimistic: create local item to show immediately
        const created = await createTodoUseCase.execute(title);
        setTodos((prev) => [created, ...prev]);
      } catch (err: any) {
        setError(err?.message ?? "Create failed");
      }
    },
    [createTodoUseCase]
  );

  const edit = useCallback(
    async (id: string, title: string) => {
      try {
        const todo = todos.find((t) => t.id === id);
        if (!todo) throw new Error("Not found");
        const updated = await updateTodoUseCase.execute({ ...todo, title });
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (err: any) {
        setError(err?.message ?? "Update failed");
      }
    },
    [todos, updateTodoUseCase]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        // optimistic remove
        setTodos((prev) => prev.filter((t) => t.id !== id));
        await deleteTodoUseCase.execute(id);
      } catch (err: any) {
        // revert by reloading on failure
        await load();
        setError(err?.message ?? "Delete failed");
      }
    },
    [deleteTodoUseCase, load]
  );

  const toggle = useCallback(
    async (id: string) => {
      try {
        // optimistic toggle locally
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
        const todo = todos.find((t) => t.id === id);
        if (!todo) throw new Error("Not found");
        await updateTodoUseCase.execute({ ...todo, completed: !todo.completed });
      } catch {
        // on failure reload
        await load();
      }
    },
    [todos, updateTodoUseCase, load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { todos, loading, error, reload: load, add, edit, remove, toggle };
}