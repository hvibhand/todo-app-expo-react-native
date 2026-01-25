import { useEffect, useState, useCallback } from "react";
import type { Todo } from "../../domain/entities/Todo";
import type { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import type { ITodoRepository } from "../../data/repositories/ITodoRepository";

/**
 * Minimal ViewModel implemented as a hook.
 * In bigger apps you can use classes + DI container, or MST/RTK Query depending on preference.
 */
export function useHomeViewModel(getTodosUseCase: GetTodosUseCase & { repository?: ITodoRepository }) {
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

  const toggle = useCallback(
    async (id: string) => {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
      // delegate write to repo (optimistic update)
      try {
        await getTodosUseCase.repository?.toggleTodo(id);
      } catch {
        // on failure you might reload or revert — simple example keeps optimistic state
        load();
      }
    },
    [getTodosUseCase, load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { todos, loading, error, reload: load, toggle };
}