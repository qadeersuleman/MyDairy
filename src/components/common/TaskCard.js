// src/components/common/TaskCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';

const TaskCard = ({ task, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title}>{task.title}</Text>
        {task.completed && (
          <Ionicons name="checkmark-circle" size={20} color="green" />
        )}
      </View>
      <Text style={styles.dateTime}>
        {task.date} | {task.time}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTime: {
    color: '#555',
    marginTop: 5,
  },
});

export default TaskCard;
