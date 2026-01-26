import type {Todo} from "../entities/Todo";
import type {ITodoRepository} from "@app/data/repositories/ITodoRepository";

export class GetTodosUseCase {
  constructor(public repository: ITodoRepository) {
  }

  async execute(): Promise<Todo[]> {
    // business rules / filtering / mapping could live here
    return this.repository.getTodos();
  }
}