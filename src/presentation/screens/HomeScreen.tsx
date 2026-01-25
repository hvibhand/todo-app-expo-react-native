import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import TodoList from "../../components/TodoList";
import { InMemoryTodoRepository } from "../../data/repositories/InMemoryTodoRepository";
import { GetTodosUseCase } from "../../domain/usecases/GetTodosUseCase";
import { useHomeViewModel } from "../viewmodels/HomeViewModel";

const repo = new InMemoryTodoRepository();
const useCase = new GetTodosUseCase(repo as any);

export default function HomeScreen() {
  const vm = useHomeViewModel(useCase as any);

  return (
    <View style={styles.container}>
      {vm.loading ? (
        <ActivityIndicator size="large" />
      ) : vm.error ? (
        <Text testID="error-text">Error: {vm.error}</Text>
      ) : (
        <TodoList todos={vm.todos} onToggle={vm.toggle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }
});