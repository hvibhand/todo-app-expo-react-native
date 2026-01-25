import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from "react-native";
import type { Todo } from "../domain/entities/Todo";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({ todos, onToggle, onEdit, onDelete }: Props) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => onToggle(item.id)} testID={`todo-${item.id}`}>
            <Text style={[styles.title, item.completed && styles.done]}>{item.title}</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <Button title="Edit" onPress={() => onEdit(item)} testID={`edit-${item.id}`} />
            <Button title="Delete" onPress={() => onDelete(item.id)} color="#d9534f" testID={`delete-${item.id}`} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: { fontSize: 16, flex: 1 },
  done: { textDecorationLine: "line-through", color: "#999" },
  actions: { flexDirection: "row", gap: 8 }
});