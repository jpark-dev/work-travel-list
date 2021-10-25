import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './colors';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const STORAGE_TODOLIST = "@toDoList"
const STORAGE_WORKING = "@workingState"

export default function App() {
  const [config, setConfig] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [targetTodoText, onChangeTodoText] = useState("");
  const [targetTodoKey, setTargetTodoKey] = useState("");
  const [toDo, setTodo] = useState("");
  const [toDoList, setTodoList] = useState({});

  useEffect(() => {
    loadWorkingState();
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (!toDo) return;

    const newTodoList = {
      ...toDoList,
      [Date.now()]: {
        complete: false,
        toDo,
        working: config.working,
      },
    };

    setTodoList(newTodoList);
    await saveTodos(newTodoList);
    setTodo("");
  };
  const closeEditModal = () => {
    setEditModal(!editModal);
    setTargetTodoKey("");
  };
  const completeTodo = (key) => {
    const newTodoList = { ...toDoList };
    newTodoList[key].complete = !newTodoList[key].complete;
    setTodoList(newTodoList);
    saveTodos(newTodoList);

  };
  const deleteTodo = (key) => {
    if (Platform.OS === "web") {
      const input = confirm(`Are you sure to delete this todo: ${toDoList[key].toDo}?`);
      if (input) {
        const newTodoList = { ...toDoList };
        delete newTodoList[key];
        setTodoList(newTodoList);
        saveTodos(newTodoList);
      }
    } else {
      Alert.alert("Delete a Todo", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "Proceed",
          onPress : () => {
            const newTodoList = { ...toDoList };
            delete newTodoList[key];
            setTodoList(newTodoList);
            saveTodos(newTodoList);
          },
        },
      ]);
    }
  };
  const loadTodos = async () => {
    const toDoList = await AsyncStorage.getItem(STORAGE_TODOLIST);
    if (toDoList) setTodoList(JSON.parse(toDoList));
  };
  const loadWorkingState = async () => {
    const existingWorking = await AsyncStorage.getItem(STORAGE_WORKING);
    const working = typeof existingWorking === "string" ? JSON.parse(existingWorking).working : true
    setConfig({ ...config, working });
  };
  const onChangeText = (payload) => setTodo(payload);
  const saveTodos = async (payload) => await AsyncStorage.setItem(STORAGE_TODOLIST, JSON.stringify(payload));
  const saveWorkingState = async (payload) => await AsyncStorage.setItem(STORAGE_WORKING, JSON.stringify(payload));
  const selectedThemeColor = (btn) => {
    if (config.working && btn !== 'work' || !config.working && btn === 'work') {
      return { color: theme.grey };
    }
    return { color: theme.white };
  };
  const updateTodo = () => {
    const newTodoList = { ...toDoList };
    newTodoList[targetTodoKey].toDo = targetTodoText;
    setTodoList(newTodoList);
    saveTodos(newTodoList);
    closeEditModal();
  };
  const travel = () => {
    const newConfig = { ...config, working: false };
    setConfig(newConfig);
    saveWorkingState(newConfig);
  }
  const work = () => {
    const newConfig = { ...config, working: true };
    setConfig(newConfig);
    saveWorkingState(newConfig);
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={[styles.btnTxt, selectedThemeColor('work')]}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={[styles.btnTxt, selectedThemeColor('travel')]}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onChangeText={onChangeText}
          onSubmitEditing={addTodo}
          placeholder={config.working ? "Add a work" : "Where do you want to go?"}
          returnKeyType="done"
          style={styles.input}
          value={toDo}
        />
        <ScrollView>
          {Object.keys(toDoList).map(toDoKey => (
            toDoList[toDoKey].working === config.working ? (
              <View style={styles.toDo} key={toDoKey}>
                <Text style={[styles.toDoText, toDoList[toDoKey].complete && styles.toDoTextComplete]}>
                  {toDoList[toDoKey].toDo}
                </Text>
                <View style={styles.toDoInteraction}>
                  <TouchableOpacity onPress={() => completeTodo(toDoKey)}>
                    <MaterialCommunityIcons
                      name={toDoList[toDoKey].complete ? "reload" : "checkbox-marked-circle"}
                      size={24}
                      color="green"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setEditModal(!editModal);
                    setTargetTodoKey(toDoKey);
                  }}>
                    <MaterialCommunityIcons name="circle-edit-outline" size={24} color="orange" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(toDoKey)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          ))}
        </ScrollView>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={closeEditModal}
        transparent={true}
        visible={editModal}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.editModalContainer}>
            <Text>Edit Todo: {toDoList[targetTodoKey]?.toDo || ""}</Text>
            <TextInput
              onChangeText={onChangeTodoText}
              placeholder="Please enter your new todo:"
              style={styles.editModalInput}
              value={targetTodoText}
            >
            </TextInput>
            <View style={styles.editBtnContainer}>
              <TouchableOpacity onPress={updateTodo}>
                <Text style={[styles.editModalBtn, styles.btnConfirm]}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeEditModal}>
                <Text style={[styles.editModalBtn, styles.btnCancel]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  btnConfirm: {
    backgroundColor: theme.confirm,
  },
  btnCancel: {
    backgroundColor: theme.cancel,
  },
  btnTxt: {
    color: "white",
    fontSize: 35,
    fontWeight: "600",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  editBtnContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    flex: 1,
  },
  editModalBtn: {
    marginLeft: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 4,
  },
  editModalContainer: {
    margin: 20,
    backgroundColor: theme.white,
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: SCREEN_WIDTH * 0.8,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  editModalInput: {
    textAlign: "center",
    width: "100%",
    flex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent:'space-between',
    marginTop: 50,
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoInteraction: {
    flexDirection: "row",
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
  },
  toDoTextComplete: {
    textDecorationLine: 'line-through',
    color: "darkgrey",
  },
});
