// src/components/pickers/TimePicker.js
import React, { useState } from 'react';
import { View, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePicker = ({ time, onChange }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedTime) => {
    setShow(Platform.OS === 'ios');
    if (selectedTime) onChange(selectedTime);
  };

  return (
    <View>
      <Button title={time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Select Time"} onPress={() => setShow(true)} />
      {show && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default TimePicker;
