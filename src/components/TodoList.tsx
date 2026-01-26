import React from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import type {Todo} from "../domain/entities/Todo";
import {Feather, MaterialIcons} from "@expo/vector-icons";
import {ms, s, vs} from "react-native-size-matters";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({todos, onToggle, onEdit, onDelete}: Props) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({item}) => (
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
              <MaterialIcons name="edit" size={s(20)} color="#1976D2"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconBtn} testID={`delete-${item.id}`}>
              <Feather name="trash-2" size={s(20)} color="#D32F2F"/>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: vs(64),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: s(12),
    paddingHorizontal: s(8),
    paddingVertical: vs(8),
    marginHorizontal: s(4),
    marginVertical: vs(6),
    flexDirection: "row",
    alignItems: "center",
    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: {width: s(0), height: vs(2)},
    shadowOpacity: 0.08,
    shadowRadius: s(6),
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
    fontSize: ms(16),
    fontWeight: "600",
    color: "#222",
    flex: 1,
    marginRight: s(8)
  },
  dateText: {
    fontSize: ms(12),
    color: "#888"
  },
  subtitle: {
    marginTop: vs(6),
    fontSize: ms(13),
    color: "#666"
  },
  done: {
    textDecorationLine: "line-through",
    color: "#9E9E9E"
  },
  actions: {
    marginLeft: s(12),
    flexDirection: "row",
    alignItems: "center"
  },
  iconBtn: {
    paddingHorizontal: s(8),
    paddingVertical: vs(8),
    marginLeft: s(6),
    borderRadius: s(8)
  }
});