import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './colors';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const STORAGE_TODOLIST = "@toDoList"
const STORAGE_WORKING = "@workingState"

export default function App() {
  const [config, setConfig] = useState({});
  const [toDo, setTodo] = useState("");
  const [toDoList, setTodoList] = useState({});

  useEffect(() => {
    loadWorkingState();
    loadToDos();
  }, []);

  const addTodo = async () => {
    if (!toDo) return;

    const newTodoList = {
      ...toDoList,
      [Date.now()]: {
        toDo,
        working: config.working,
      },
    };

    setTodoList(newTodoList);
    await saveTodos(newTodoList);
    setTodo("");
  };
  const deleteTodo = (key) => {
    Alert.alert("Delete a Todo", "Are you sure?", [
      {
        text: "Cancel"
      },
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
  };
  const loadToDos = async () => {
    const toDoList = await AsyncStorage.getItem(STORAGE_TODOLIST);
    setTodoList(JSON.parse(toDoList));
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
                <Text style={styles.toDoText}>
                  {toDoList[toDoKey].toDo}
                </Text>
                <TouchableOpacity onPress={() => deleteTodo(toDoKey)}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ) : null
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnTxt: {
    color: "white",
    fontSize: 35,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
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
    paddingHorizontal: 40,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
  },
});
