import type {Todo} from "../entities/Todo";
import type {ITodoRepository} from "@app/data/repositories/ITodoRepository";

export class UpdateTodoUseCase {
  constructor(private repository: ITodoRepository) {
  }

  async execute(todo: Todo): Promise<Todo> {
    if (!todo.title.trim()) throw new Error("Title required");
    return this.repository.updateTodo(todo);
  }
}