import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import type { Todo } from "../domain/entities/Todo";
import { MaterialIcons, Feather } from "@expo/vector-icons";

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
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card} testID={`card-${item.id}`}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => onToggle(item.id)}
            testID={`todo-${item.id}`}
            activeOpacity={0.8}
          >
            <View style={styles.titleRow}>
              <Text style={[styles.title, item.completed && styles.done]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.dateText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</Text>
            </View>
            <Text style={styles.subtitle}>{item.completed ? "Completed" : "Open"}</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconBtn} testID={`edit-${item.id}`}>
              <MaterialIcons name="edit" size={20} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconBtn} testID={`delete-${item.id}`}>
              <Feather name="trash-2" size={20} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 64,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // elevation (Android)
    elevation: 3
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flex: 1,
    marginRight: 8
  },
  dateText: {
    fontSize: 12,
    color: "#888"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#666"
  },
  done: {
    textDecorationLine: "line-through",
    color: "#9E9E9E"
  },
  actions: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  iconBtn: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8
  }
});