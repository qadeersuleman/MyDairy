// src/components/common/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message || "No items found"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#777',
  },
});

export default EmptyState;
