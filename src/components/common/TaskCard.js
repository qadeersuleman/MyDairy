// TaskCard component
import React from 'react';
import { View, Text } from 'react-native';

const TaskCard = ({ task }) => {
  return (
    <View>
      <Text>{task.title}</Text>
    </View>
  );
};

export default TaskCard;