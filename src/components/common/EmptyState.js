// EmptyState component
import React from 'react';
import { View, Text } from 'react-native';

const EmptyState = ({ message }) => {
  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
};

export default EmptyState;