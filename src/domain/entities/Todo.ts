export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string; // optional; provided by the API
};