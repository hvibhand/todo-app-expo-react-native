import type {Todo} from "../entities/Todo";
import type {ITodoRepository} from "@app/data/repositories/ITodoRepository";

export class CreateTodoUseCase {
  constructor(private repository: ITodoRepository) {
  }

  async execute(title: string): Promise<Todo> {
    const trimmed = title.trim();
    if (!trimmed) throw new Error("Title required");
    return this.repository.createTodo(trimmed);
  }
}