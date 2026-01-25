import type { ITodoRepository } from "../../data/repositories/ITodoRepository";

export class DeleteTodoUseCase {
  constructor(private repository: ITodoRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error("Invalid id");
    return this.repository.deleteTodo(id);
  }
}