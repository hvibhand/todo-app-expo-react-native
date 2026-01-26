import React, {useState} from "react";
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import TodoList from "../../components/TodoList";
import EditTodoModal from "../../components/EditTodoModal";
import {ApiTodoRepository} from "@app/data/repositories/ApiTodoRepository";
import {GetTodosUseCase} from "@app/domain/usecases/GetTodosUseCase";
import {CreateTodoUseCase} from "@app/domain/usecases/CreateTodoUseCase";
import {UpdateTodoUseCase} from "@app/domain/usecases/UpdateTodoUseCase";
import {DeleteTodoUseCase} from "@app/domain/usecases/DeleteTodoUseCase";
import {useHomeViewModel} from "../viewmodels/HomeViewModel";
import {MaterialIcons} from "@expo/vector-icons";
import {s} from "react-native-size-matters";

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
    setModalVisible(false);
    await vm.add(title);
  };

  const handleSaveEdit = async (id: string, title: string) => {
    if (!title.trim()) return;
    setModalVisible(false);
    await vm.edit(id, title);
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
              <MaterialIcons name="search" size={s(24)} color="#222"/>
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
            <TouchableOpacity onPress={() => {
              setSearchVisible(false);
              setSearchQuery("");
            }} testID="close-search">
              <MaterialIcons name="close" size={s(24)} color="#222"/>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.content}>
        {vm.loading ? (
          <ActivityIndicator size="large" style={{marginTop: 32}}/>
        ) : vm.error ? (
          <Text testID="error-text" style={styles.errorText}>
            Error: {vm.error}
          </Text>
        ) : (
          <TodoList todos={filteredTodos} onToggle={vm.toggle} onEdit={startEdit} onDelete={vm.remove}/>
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

      <TouchableOpacity style={styles.fab} onPress={startAdd} testID="add-fab">
        <MaterialIcons name="add" size={s(24)} color="#fff"/>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F5F7FB"},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: s(12),
    paddingHorizontal: s(16),
    backgroundColor: '#fff',
    // shadow for action bar look
    shadowColor: "#000",
    shadowOffset: {width: s(0), height: s(2)},
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 4,
  },
  title: {
    fontSize: s(24),
    fontWeight: 'bold',
    color: '#222',
    padding: s(3)
  },
  searchInput: {
    flex: 1,
    fontSize: s(16),
    color: '#222',
    borderWidth: s(1),
    borderColor: '#E0E0E0',
    borderRadius: s(8),
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    backgroundColor: '#fff',
    marginRight: s(8)
  },
  content: {
    flex: 1,
    padding: s(12)
  },
  errorText: {
    color: "#D32F2F",
    marginTop: s(24),
    textAlign: "center"
  },
  fab: {
    position: "absolute",
    bottom: s(20),
    right: s(20),
    backgroundColor: '#1976D2',
    padding: s(16),
    borderRadius: s(28),
    zIndex: 10,
    // shadow
    shadowColor: "#000",
    shadowOffset: {width: s(0), height: s(2)},
    shadowOpacity: 0.12,
    shadowRadius: s(4),
    elevation: 3
  }
});
