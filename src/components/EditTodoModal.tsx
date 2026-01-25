import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, StyleSheet, Button } from "react-native";
import type { Todo } from "../domain/entities/Todo";

type Props = {
  visible: boolean;
  todo?: Todo | null;
  onSave: (id: string, title: string) => void;
  onCancel: () => void;
};

export default function EditTodoModal({ visible, todo, onSave, onCancel }: Props) {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    setTitle(todo?.title ?? "");
  }, [todo]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.heading}>Edit Todo</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
            testID="edit-input"
          />
          <View style={styles.buttons}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Save" onPress={() => todo && onSave(todo.id, title)} testID="save-edit" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  container: { width: "90%", backgroundColor: "#fff", padding: 16, borderRadius: 8 },
  heading: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 4, marginBottom: 12 },
  buttons: { flexDirection: "row", justifyContent: "space-between" }
});