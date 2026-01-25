
import { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import { useHomeViewModel } from "../../presentation/viewmodels/HomeViewModel";
import { renderHook, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer"; // React 19-compatible act
import type { Todo } from "../../domain/entities/Todo";

const mockTodos: Todo[] = [
  { id: "1", title: "t1", completed: false },
  { id: "2", title: "t2", completed: true },
];

describe("HomeViewModel", () => {
  it("loads todos and toggles", async () => {
    const repo = {
      getTodos: jest.fn().mockResolvedValue(mockTodos),
      toggleTodo: jest.fn().mockImplementation(async (id: string) => {
        return mockTodos.find((t) => t.id === id)!;
      }),
    } as any;

    const useCase = new GetTodosUseCase(repo);
    // if your ViewModel reads useCase.repository internally:
    (useCase as any).repository = repo;

    const { result } = renderHook(() => useHomeViewModel(useCase as any));

    // initial state: loading true
    expect(result.current.loading).toBe(true);

    // wait for load() to finish
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(repo.getTodos).toHaveBeenCalledTimes(1);
    expect(result.current.todos.length).toBe(2);

    // toggle (async) — ensure all state updates are flushed
    await act(async () => {
      await result.current.toggle("1");
    });

    // assert final state
    await waitFor(() => {
      const t1 = result.current.todos.find((t) => t.id === "1");
      expect(t1?.completed).toBe(true);
    });
    expect(repo.toggleTodo).toHaveBeenCalledWith("1");
  });
});
