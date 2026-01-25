import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TextInput, Button } from "react-native";
import TodoList from "../../components/TodoList";
import EditTodoModal from "../../components/EditTodoModal";
import { InMemoryTodoRepository } from "../../data/repositories/InMemoryTodoRepository";
import { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import { CreateTodoUseCase } from "../../domain/usecases/CreateTodoUseCase";
import { UpdateTodoUseCase } from "../../domain/usecases/UpdateTodoUseCase";
import { DeleteTodoUseCase } from "../../domain/usecases/DeleteTodoUseCase";
import { useHomeViewModel } from "../viewmodels/HomeViewModel";

const repo = new InMemoryTodoRepository();
const getUseCase = new GetTodosUseCase(repo as any);
const createUseCase = new CreateTodoUseCase(repo as any);
const updateUseCase = new UpdateTodoUseCase(repo as any);
const deleteUseCase = new DeleteTodoUseCase(repo as any);

export default function HomeScreen() {
  const vm = useHomeViewModel({
    getTodosUseCase: getUseCase as any,
    createTodoUseCase: createUseCase as any,
    updateTodoUseCase: updateUseCase as any,
    deleteTodoUseCase: deleteUseCase as any
  });

  const [newTitle, setNewTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<any | null>(null);
  const [editingVisible, setEditingVisible] = useState(false);

  const startEdit = (todo: any) => {
    setEditingTodo(todo);
    setEditingVisible(true);
  };

  const handleSaveEdit = async (id: string, title: string) => {
    await vm.edit(id, title);
    setEditingVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          placeholder="Add todo..."
          value={newTitle}
          onChangeText={setNewTitle}
          style={styles.input}
          testID="add-input"
        />
        <Button
          title="Add"
          onPress={async () => {
            if (!newTitle.trim()) return;
            await vm.add(newTitle);
            setNewTitle("");
          }}
          testID="add-button"
        />
      </View>

      {vm.loading ? (
        <ActivityIndicator size="large" />
      ) : vm.error ? (
        <Text testID="error-text">Error: {vm.error}</Text>
      ) : (
        <TodoList todos={vm.todos} onToggle={vm.toggle} onEdit={startEdit} onDelete={vm.remove} />
      )}

      <EditTodoModal
        visible={editingVisible}
        todo={editingTodo}
        onSave={handleSaveEdit}
        onCancel={() => setEditingVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 12, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 4 }
});