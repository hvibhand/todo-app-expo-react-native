import React, {useEffect, useState} from "react";
import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import type {Todo} from "../domain/entities/Todo";
import {MaterialIcons} from "@expo/vector-icons";
import {ms, s, vs} from "react-native-size-matters";

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
    setTitle("")
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>{mode === 'add' ? 'Add Todo' : 'Edit Todo'}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <MaterialIcons name="close" size={s(22)} color="#444"/>
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
              <MaterialIcons name="save" size={s(18)} color="#fff"/>
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
    paddingHorizontal: s(18),
    paddingVertical: vs(18),
    borderRadius: s(12),
    // shadow
    shadowColor: "#000",
    shadowOffset: {width: s(0), height: vs(4)},
    shadowOpacity: 0.12,
    shadowRadius: s(8),
    elevation: 6
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(12)
  },
  heading: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#222"
  },
  closeBtn: {
    paddingHorizontal: s(6),
    paddingVertical: vs(6),
    borderRadius: s(8)
  },
  input: {
    borderWidth: s(1),
    borderColor: "#E0E0E0",
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    fontSize: ms(15),
    backgroundColor: "#FAFAFA"
  },
  footer: {
    marginTop: vs(14),
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: vs(8)
  },
  actionBtn: {
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: s(10),
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderWidth: s(1),
    borderColor: "#E0E0E0",
    marginRight: s(8)
  },
  cancelText: {
    color: "#444",
    fontWeight: "600",
    fontSize: ms(15)
  },
  saveBtn: {
    backgroundColor: "#1976D2"
  }
});