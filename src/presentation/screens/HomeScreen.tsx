import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import TodoList from "../../components/TodoList";
import EditTodoModal from "../../components/EditTodoModal";
import { ApiTodoRepository } from "../../data/repositories/ApiTodoRepository";
import { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import { CreateTodoUseCase } from "../../domain/usecases/CreateTodoUseCase";
import { UpdateTodoUseCase } from "../../domain/usecases/UpdateTodoUseCase";
import { DeleteTodoUseCase } from "../../domain/usecases/DeleteTodoUseCase";
import { useHomeViewModel } from "../viewmodels/HomeViewModel";
import { MaterialIcons } from "@expo/vector-icons";

const repo = new ApiTodoRepository();
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
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Add a new todo item..."
            value={newTitle}
            onChangeText={setNewTitle}
            style={styles.input}
            testID="add-input"
            returnKeyType="done"
            onSubmitEditing={async () => {
              if (!newTitle.trim()) return;
              await vm.add(newTitle);
              setNewTitle("");
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            if (!newTitle.trim()) return;
            await vm.add(newTitle);
            setNewTitle("");
          }}
          testID="add-button"
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {vm.loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : vm.error ? (
        <Text testID="error-text" style={styles.errorText}>
          Error: {vm.error}
        </Text>
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
  container: { flex: 1, padding: 12, backgroundColor: "#F5F7FB" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 4
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    paddingHorizontal: 12,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#222"
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3
  },
  errorText: {
    color: "#D32F2F",
    marginTop: 24,
    textAlign: "center"
  }
});