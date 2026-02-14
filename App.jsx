// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/Splash/SplashScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import AddTaskScreen from './src/screens/AddTask/AddTaskScreen';
import TaskDetailScreen from './src/screens/TaskDetail/TaskDetailScreen';
import PendingTasksScreen from './src/screens/PendingTasks/PendingTasksScreen';
import CompletedTasksScreen from './src/screens/CompletedTasks/CompletedTasksScreen';
import AllTasks from './src/screens/AllTasks/AllTasks';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="PendingTasks" component={PendingTasksScreen} />
        <Stack.Screen name="CompletedTasks" component={CompletedTasksScreen} />
        <Stack.Screen name="AllTasks" component={AllTasks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
