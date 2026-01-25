import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import type { Todo } from "../domain/entities/Todo";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
};

export default function TodoList({ todos, onToggle }: Props) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onToggle(item.id)} testID={`todo-${item.id}`}>
          <View style={styles.row}>
            <Text style={[styles.title, item.completed && styles.done]}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16 },
  done: { textDecorationLine: "line-through", color: "#999" }
});