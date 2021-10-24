import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { theme } from './colors';

export default function App() {
  const [working, setWorking] = useState(true);
  const [toDo, setTodo] = useState("");
  const [toDoList, setTodoList] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const addTodo = () => {
    if (!toDo) return;

    const newTodoList = {
      ...toDoList,
      [Date.now()]: {
        toDo,
        working,
      },
    };

    setTodoList(newTodoList);
    setTodo("");
  };
  const onChangeText = (payload) => setTodo(payload);
  const selectedThemeColor = (btn) => {
    if (working && btn !== 'work' || !working && btn === 'work') {
      return { color: theme.grey };
    }
    return { color: theme.white };
  };
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
          placeholder={working ? "Add a work" : "Where do you want to go?"}
          returnKeyType="done"
          style={styles.input}
          value={toDo}
        />
        <ScrollView>
          {Object.keys(toDoList).map(toDoKey => (
            toDoList[toDoKey].working === working ? (
              <View style={styles.toDo} key={toDoKey}>
                <Text style={styles.toDoText}>
                  {toDoList[toDoKey].toDo}
                </Text>
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
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
  },
});
