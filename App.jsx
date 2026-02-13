import React,{useState} from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import SplashScreen from './src/screens/Splash/SplashScreen';

export default function App() {
  const [count, setCount] = useState(5);

  return (
    <SplashScreen />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#238bb7',
  },
  button: {
    padding: 10,
    backgroundColor: '#ffffff',
  }
});
