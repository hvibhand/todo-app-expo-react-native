import { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import { CreateTodoUseCase } from "../../domain/usecases/CreateTodoUseCase";
import { UpdateTodoUseCase } from "../../domain/usecases/UpdateTodoUseCase";
import { DeleteTodoUseCase } from "../../domain/usecases/DeleteTodoUseCase";
import { useHomeViewModel } from "../../presentation/viewmodels/HomeViewModel";
import { renderHook, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer"; // React 19-compatible act
import type { Todo } from "../../domain/entities/Todo";

const mockTodos: Todo[] = [
  { id: "1", title: "t1", completed: false },
  { id: "2", title: "t2", completed: true }
];

describe("HomeViewModel CRUD", () => {
  it("loads, creates, updates and deletes", async () => {
    const repo = {
      getTodos: jest.fn().mockResolvedValue(mockTodos.slice()),
      createTodo: jest.fn().mockImplementation(async (title: string) => ({ id: "3", title, completed: false })),
      updateTodo: jest.fn().mockImplementation(async (todo: Todo) => ({ ...todo })),
      deleteTodo: jest.fn().mockResolvedValue(undefined)
    } as any;

    const getUseCase = new GetTodosUseCase(repo);
    const createUseCase = new CreateTodoUseCase(repo);
    const updateUseCase = new UpdateTodoUseCase(repo);
    const deleteUseCase = new DeleteTodoUseCase(repo);

    const { result, waitForNextUpdate } = renderHook(() =>
      useHomeViewModel({
        getTodosUseCase: getUseCase,
        createTodoUseCase: createUseCase,
        updateTodoUseCase: updateUseCase,
        deleteTodoUseCase: deleteUseCase
      })
    );

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(repo.getTodos).toHaveBeenCalled();
    expect(result.current.todos.length).toBe(2);

    // create
    await act(async () => {
      await result.current.add("new todo");
    });
    expect(repo.createTodo).toHaveBeenCalledWith("new todo");
    expect(result.current.todos[0].id).toBe("3");

    // edit
    await act(async () => {
      await result.current.edit("3", "edited");
    });
    expect(repo.updateTodo).toHaveBeenCalled();
    expect(result.current.todos[0].title).toBe("edited");

    // delete
    await act(async () => {
      await result.current.remove("3");
    });
    expect(repo.deleteTodo).toHaveBeenCalledWith("3");
    expect(result.current.todos.find((t) => t.id === "3")).toBeUndefined();
  });
});

/*
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
*/