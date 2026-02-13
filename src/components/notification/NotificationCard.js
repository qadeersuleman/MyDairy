// NotificationCard component
import React from 'react';
import { View, Text } from 'react-native';

const NotificationCard = ({ notification }) => {
  return (
    <View>
      <Text>{notification.message}</Text>
    </View>
  );
};

export default NotificationCard;