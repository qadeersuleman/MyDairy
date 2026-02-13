// TaskDetailScreen component
import React from 'react';
import { View, Text } from 'react-native';

const TaskDetailScreen = ({ route }) => {
  const { taskId } = route.params;
  return (
    <View>
      <Text>Task Detail Screen for {taskId}</Text>
    </View>
  );
};

export default TaskDetailScreen;