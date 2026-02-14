// src/components/pickers/DatePicker.js
import React, { useState } from 'react';
import { View, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({ date, onChange }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) onChange(selectedDate);
  };

  return (
    <View>
      <Button title={date ? date.toDateString() : "Select Date"} onPress={() => setShow(true)} />
      {show && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default DatePicker;
