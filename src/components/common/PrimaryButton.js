// PrimaryButton component
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const PrimaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;