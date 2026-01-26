import React, {useEffect, useState} from "react";
import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import type {Todo} from "../domain/entities/Todo";
import {MaterialIcons} from "@expo/vector-icons";

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  todo?: Todo | null;
  onSaveAdd?: (title: string) => void;
  onSaveEdit?: (id: string, title: string) => void;
  onCancel: () => void;
};

export default function EditTodoModal({visible, mode, todo, onSaveAdd, onSaveEdit, onCancel}: Props) {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    setTitle(todo?.title ?? "");
  }, [todo]);

  const handleSave = () => {
    if (mode === 'add') {
      onSaveAdd?.(title);
    } else {
      onSaveEdit?.(todo!.id, title);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>{mode === 'add' ? 'Add Todo' : 'Edit Todo'}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#444"/>
            </TouchableOpacity>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
            testID="edit-input"
            returnKeyType="done"
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel} style={[styles.actionBtn, styles.cancelBtn]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionBtn, styles.saveBtn]}
              testID="save-edit"
            >
              <MaterialIcons name="save" size={18} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    // shadow
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222"
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA"
  },
  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8
  },
  cancelText: {
    color: "#444",
    fontWeight: "600"
  },
  saveBtn: {
    backgroundColor: "#1976D2"
  }
});