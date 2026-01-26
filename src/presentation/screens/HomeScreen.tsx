import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalTodo, setModalTodo] = useState<any | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const startAdd = () => {
    if (searchVisible) {
      setSearchVisible(false);
      setSearchQuery("");
    }
    setModalMode('add');
    setModalTodo(null);
    setModalVisible(true);
  };

  const startEdit = (todo: any) => {
    setModalMode('edit');
    setModalTodo(todo);
    setModalVisible(true);
  };

  const handleAdd = async (title: string) => {
    if (!title.trim()) return;
    await vm.add(title);
    setModalVisible(false);
  };

  const handleSaveEdit = async (id: string, title: string) => {
    if (!title.trim()) return;
    await vm.edit(id, title);
    setModalVisible(false);
  };

  const filteredTodos = searchQuery
    ? vm.todos.filter(todo => todo.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : vm.todos;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!searchVisible ? (
          <>
            <Text style={styles.title}>Todos</Text>
            <TouchableOpacity onPress={() => setSearchVisible(true)} testID="search-btn">
              <MaterialIcons name="search" size={24} color="#1976D2" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Search todos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoFocus
              testID="search-input"
            />
            <TouchableOpacity onPress={() => { setSearchVisible(false); setSearchQuery(""); }} testID="close-search">
              <MaterialIcons name="close" size={24} color="#1976D2" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.content}>
        {vm.loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        ) : vm.error ? (
          <Text testID="error-text" style={styles.errorText}>
            Error: {vm.error}
          </Text>
        ) : (
          <TodoList todos={filteredTodos} onToggle={vm.toggle} onEdit={startEdit} onDelete={vm.remove} />
        )}
      </View>

      <EditTodoModal
        visible={modalVisible}
        mode={modalMode}
        todo={modalTodo}
        onSaveAdd={handleAdd}
        onSaveEdit={handleSaveEdit}
        onCancel={() => setModalVisible(false)}
      />

      <TouchableOpacity style={styles.fab} onPress={ startAdd } testID="add-fab">
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    // shadow for action bar look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginRight: 8
  },
  content: {
    flex: 1,
    padding: 12
  },
  errorText: {
    color: "#D32F2F",
    marginTop: 24,
    textAlign: "center"
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 28,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3
  }
});