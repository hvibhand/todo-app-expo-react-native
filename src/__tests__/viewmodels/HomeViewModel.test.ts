import {GetTodosUseCase} from "@app/domain/usecases/GetTodosUseCase";
import {CreateTodoUseCase} from "@app/domain/usecases/CreateTodoUseCase";
import {UpdateTodoUseCase} from "@app/domain/usecases/UpdateTodoUseCase";
import {DeleteTodoUseCase} from "@app/domain/usecases/DeleteTodoUseCase";
import {useHomeViewModel} from "@app/presentation/viewmodels/HomeViewModel";
import {renderHook, waitFor} from "@testing-library/react-native";
import {act} from "react-test-renderer"; // React 19-compatible act
import type {Todo} from "@app/domain/entities/Todo";

const mockTodos: Todo[] = [
  {id: "1", title: "t1", completed: false},
  {id: "2", title: "t2", completed: true}
];

describe("HomeViewModel CRUD", () => {
  it("loads, creates, updates and deletes", async () => {
    const repo = {
      getTodos: jest.fn().mockResolvedValue(mockTodos.slice()),
      createTodo: jest.fn().mockImplementation(async (title: string) => ({id: "3", title, completed: false})),
      updateTodo: jest.fn().mockImplementation(async (todo: Todo) => ({...todo})),
      deleteTodo: jest.fn().mockResolvedValue(undefined)
    } as any;

    const getUseCase = new GetTodosUseCase(repo);
    const createUseCase = new CreateTodoUseCase(repo);
    const updateUseCase = new UpdateTodoUseCase(repo);
    const deleteUseCase = new DeleteTodoUseCase(repo);

    const {result} = renderHook(() =>
      useHomeViewModel({
        getTodosUseCase: getUseCase,
        createTodoUseCase: createUseCase,
        updateTodoUseCase: updateUseCase,
        deleteTodoUseCase: deleteUseCase
      })
    );

    // Initial state: loading true
    expect(result.current.loading).toBe(true);

    // Wait for a load to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

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

  it("handles load error", async () => {
    const repo = {
      getTodos: jest.fn().mockRejectedValue(new Error("Load failed")),
      createTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn()
    } as any;

    const getUseCase = new GetTodosUseCase(repo);
    const createUseCase = new CreateTodoUseCase(repo);
    const updateUseCase = new UpdateTodoUseCase(repo);
    const deleteUseCase = new DeleteTodoUseCase(repo);

    const {result} = renderHook(() =>
      useHomeViewModel({
        getTodosUseCase: getUseCase,
        createTodoUseCase: createUseCase,
        updateTodoUseCase: updateUseCase,
        deleteTodoUseCase: deleteUseCase
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Load failed");
  });

  it("handles create error", async () => {
    const repo = {
      getTodos: jest.fn().mockResolvedValue([]),
      createTodo: jest.fn().mockRejectedValue(new Error("Create failed")),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn()
    } as any;

    const getUseCase = new GetTodosUseCase(repo);
    const createUseCase = new CreateTodoUseCase(repo);
    const updateUseCase = new UpdateTodoUseCase(repo);
    const deleteUseCase = new DeleteTodoUseCase(repo);

    const {result} = renderHook(() =>
      useHomeViewModel({
        getTodosUseCase: getUseCase,
        createTodoUseCase: createUseCase,
        updateTodoUseCase: updateUseCase,
        deleteTodoUseCase: deleteUseCase
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.add("new todo");
    });
    expect(result.current.error).toBe("Create failed");
  });

  it("toggles todo", async () => {
    const repo = {
      getTodos: jest.fn().mockResolvedValue(mockTodos.slice()),
      createTodo: jest.fn(),
      updateTodo: jest.fn().mockImplementation(async (todo: Todo) => ({...todo})),
      deleteTodo: jest.fn()
    } as any;

    const getUseCase = new GetTodosUseCase(repo);
    const createUseCase = new CreateTodoUseCase(repo);
    const updateUseCase = new UpdateTodoUseCase(repo);
    const deleteUseCase = new DeleteTodoUseCase(repo);

    const {result} = renderHook(() =>
      useHomeViewModel({
        getTodosUseCase: getUseCase,
        createTodoUseCase: createUseCase,
        updateTodoUseCase: updateUseCase,
        deleteTodoUseCase: deleteUseCase
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggle("1");
    });

    expect(repo.updateTodo).toHaveBeenCalled();
    const toggled = result.current.todos.find(t => t.id === "1");
    expect(toggled?.completed).toBe(true);
  });
});