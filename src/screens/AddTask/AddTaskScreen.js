// AddTaskScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  Vibration,
  Switch,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import {taskStorage} from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const AddTaskScreen = ({ navigation, route }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('work');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReminderOptions, setShowReminderOptions] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerRotate = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successRotate = useRef(new Animated.Value(0)).current;
  const reminderSlideAnim = useRef(new Animated.Value(0)).current;

  // Categories with colors and icons
  const categories = [
    { id: 'work', label: 'Work', icon: 'work', color: colors.primary.main },
    { id: 'personal', label: 'Personal', icon: 'person', color: colors.secondary.main },
    { id: 'shopping', label: 'Shopping', icon: 'shopping-cart', color: colors.accent.teal },
    { id: 'health', label: 'Health', icon: 'fitness-center', color: colors.accent.orange },
    { id: 'education', label: 'Education', icon: 'school', color: colors.accent.purple },
  ];

  // Priority levels
  const priorities = [
    { id: 'high', label: 'High', color: colors.status.error, icon: 'flag' },
    { id: 'medium', label: 'Medium', color: colors.status.warning, icon: 'flag' },
    { id: 'low', label: 'Low', color: colors.status.success, icon: 'flag' },
  ];

  // Reminder options
  const reminderOptions = [5, 10, 15, 30, 60, 120, 1440]; // minutes (1440 = 1 day)



  // In AddTaskScreen.js, ensure it handles editing:
useEffect(() => {
  if (route.params?.task) {
    const { task } = route.params;
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setSelectedCategory(task.category);
    setSelectedPriority(task.priority);
    setSelectedDate(new Date(task.date));
    setSelectedTime(new Date(task.time));
    setReminderEnabled(task.reminder?.enabled ?? true);
    setReminderMinutes(task.reminder?.minutes || 10);
  }
}, [route.params?.task]);


  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate reminder options when expanded
    Animated.timing(reminderSlideAnim, {
      toValue: showReminderOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showReminderOptions]);

  const handleInputFocus = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const calculateReminderTime = () => {
    const taskDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.toString().split(' ');
    taskDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
    
    const reminderTime = new Date(taskDateTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);
    
    return reminderTime;
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      // Shake animation for empty title
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      Vibration.vibrate(100);
      Alert.alert('Missing Title', 'Please enter a title for your task');
      return;
    }

    // Calculate reminder time
  const reminderTime = reminderEnabled ? calculateReminderTime() : null;

  // Save to local storage
  const result = await taskStorage.saveTask({
    title: taskTitle,
    description: taskDescription,
    category: selectedCategory,
    priority: selectedPriority,
    date: selectedDate,
    time: selectedTime,
    reminder: {
      enabled: reminderEnabled,
      minutes: reminderMinutes,
      reminderTime: reminderTime?.toISOString(),
    },
  });

  if (result.success) {
    // Show success animation
    setShowSuccessModal(true);
    Animated.sequence([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(successRotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate back after success
    setTimeout(() => {
      setShowSuccessModal(false);
      navigation.goBack();
    }, 2000);
  } else {
    Alert.alert('Error', 'Failed to save task. Please try again.');
  }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatReminderText = () => {
    if (!reminderEnabled) return 'No reminder';
    if (reminderMinutes < 60) {
      return `${reminderMinutes} minute${reminderMinutes > 1 ? 's' : ''} before`;
    } else if (reminderMinutes === 60) {
      return '1 hour before';
    } else if (reminderMinutes === 120) {
      return '2 hours before';
    } else if (reminderMinutes === 1440) {
      return '1 day before';
    }
    return `${reminderMinutes} minutes before`;
  };

  const headerSpin = headerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const successRotation = successRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const inputBorderColor = inputFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral.border, colors.primary.main],
  });

  const reminderOptionsHeight = reminderSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color={colors.neutral.text.primary} />
            </TouchableOpacity>
            
            <Animated.View style={{ transform: [{ rotate: headerSpin }] }}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.headerIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="add-task" size={28} color={colors.neutral.white} />
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.headerTitle}>Create New Task</Text>
            <Text style={styles.headerSubtitle}>Add details to your task</Text>
          </Animated.View>

          {/* Input Fields */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Task Title Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: inputBorderColor,
                    transform: [{ scale: inputFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }) }],
                  },
                ]}
              >
                <Icon
                  name="title"
                  size={20}
                  color={taskTitle ? colors.primary.main : colors.neutral.placeholder}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter task title"
                  placeholderTextColor={colors.neutral.placeholder}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  maxLength={50}
                />
                {taskTitle.length > 0 && (
                  <Text style={styles.charCount}>{taskTitle.length}/50</Text>
                )}
              </Animated.View>
            </View>

            {/* Task Description Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Description</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Icon
                  name="description"
                  size={20}
                  color={taskDescription ? colors.primary.main : colors.neutral.placeholder}
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter task description"
                  placeholderTextColor={colors.neutral.placeholder}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
              >
                {categories.map((category, index) => {
                  const inputRange = [index - 1, index, index + 1];
                  const scale = fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.9, 1],
                  });
                  
                  return (
                    <Animated.View
                      key={category.id}
                      style={{
                        transform: [{ scale }],
                        opacity: fadeAnim,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setSelectedCategory(category.id)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            selectedCategory === category.id
                              ? [category.color, category.color + 'dd']
                              : [colors.neutral.card, colors.neutral.card]
                          }
                          style={[
                            styles.categoryItem,
                            selectedCategory === category.id && styles.selectedCategory,
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Icon
                            name={category.icon}
                            size={22}
                            color={
                              selectedCategory === category.id
                                ? colors.neutral.white
                                : category.color
                            }
                          />
                          <Text
                            style={[
                              styles.categoryLabel,
                              selectedCategory === category.id && styles.selectedCategoryLabel,
                            ]}
                          >
                            {category.label}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Priority Selection */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    onPress={() => setSelectedPriority(priority.id)}
                    activeOpacity={0.8}
                    style={styles.priorityButton}
                  >
                    <LinearGradient
                      colors={
                        selectedPriority === priority.id
                          ? [priority.color, priority.color + 'dd']
                          : [colors.neutral.card, colors.neutral.card]
                      }
                      style={[
                        styles.priorityItem,
                        selectedPriority === priority.id && styles.selectedPriority,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Icon
                        name="flag"
                        size={20}
                        color={
                          selectedPriority === priority.id
                            ? colors.neutral.white
                            : priority.color
                        }
                      />
                      <Text
                        style={[
                          styles.priorityLabel,
                          selectedPriority === priority.id && styles.selectedPriorityLabel,
                        ]}
                      >
                        {priority.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date and Time Selection */}
            <View style={styles.rowContainer}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
                style={[styles.inputWrapper, styles.halfWidth]}
              >
                <Text style={styles.inputLabel}>Due Date</Text>
                <LinearGradient
                  colors={[colors.neutral.card, colors.neutral.background]}
                  style={styles.dateTimeButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon
                    name="calendar-today"
                    size={22}
                    color={colors.primary.main}
                  />
                  <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Icon
                    name="arrow-drop-down"
                    size={24}
                    color={colors.neutral.text.secondary}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
                style={[styles.inputWrapper, styles.halfWidth]}
              >
                <Text style={styles.inputLabel}>Time</Text>
                <LinearGradient
                  colors={[colors.neutral.card, colors.neutral.background]}
                  style={styles.dateTimeButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon
                    name="access-time"
                    size={22}
                    color={colors.primary.main}
                  />
                  <Text style={styles.dateText}>{formatTime(selectedTime)}</Text>
                  <Icon
                    name="arrow-drop-down"
                    size={24}
                    color={colors.neutral.text.secondary}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Reminder Section */}
            <View style={styles.inputWrapper}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderTitleContainer}>
                  <Icon
                    name="notifications-active"
                    size={22}
                    color={colors.primary.main}
                  />
                  <Text style={styles.reminderTitle}>Reminder</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: colors.neutral.border, true: colors.primary.light }}
                  thumbColor={reminderEnabled ? colors.primary.main : colors.neutral.white}
                  ios_backgroundColor={colors.neutral.border}
                />
              </View>

              {reminderEnabled && (
                <Animated.View style={styles.reminderOptions}>
                  <TouchableOpacity
                    onPress={() => setShowReminderOptions(!showReminderOptions)}
                    activeOpacity={0.8}
                    style={styles.reminderSelector}
                  >
                    <Text style={styles.reminderSelectorText}>
                      {formatReminderText()}
                    </Text>
                    <Icon
                      name={showReminderOptions ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={colors.neutral.text.secondary}
                    />
                  </TouchableOpacity>

                  {showReminderOptions && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.reminderOptionsList}
                    >
                      {reminderOptions.map((minutes) => (
                        <TouchableOpacity
                          key={minutes}
                          onPress={() => {
                            setReminderMinutes(minutes);
                            setShowReminderOptions(false);
                          }}
                          style={[
                            styles.reminderOption,
                            reminderMinutes === minutes && styles.reminderOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.reminderOptionText,
                              reminderMinutes === minutes && styles.reminderOptionTextSelected,
                            ]}
                          >
                            {minutes < 60
                              ? `${minutes} min`
                              : minutes === 60
                              ? '1 hour'
                              : minutes === 120
                              ? '2 hours'
                              : '1 day'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.reminderInfo}>
                    <Icon name="info" size={16} color={colors.neutral.text.tertiary} />
                    <Text style={styles.reminderInfoText}>
                      You'll be notified {formatReminderText().toLowerCase()}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Create Task Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPress={() => {
                  handleButtonPress();
                  handleAddTask();
                }}
                activeOpacity={0.9}
                style={styles.createButtonWrapper}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.createButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.createButtonText}>Create Task</Text>
                  <Icon
                    name="arrow-forward"
                    size={22}
                    color={colors.neutral.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: successScale },
                    { rotate: successRotation },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.modalGradient}
              >
                <Icon name="check-circle" size={80} color={colors.neutral.white} />
                <Text style={styles.modalTitle}>Task Created!</Text>
                <Text style={styles.modalSubtitle}>
                  Reminder set for {formatReminderText().toLowerCase()}
                </Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.layout.screenPadding,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.layout.screenPadding,
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: spacing.elevation.sm,
      },
    }),
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: spacing.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.presets.headline3,
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
  },
  formContainer: {
    paddingHorizontal: spacing.layout.screenPadding,
  },
  inputWrapper: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.presets.inputLabel,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: spacing.elevation.sm,
      },
    }),
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textAreaIcon: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  input: {
    ...typography.presets.inputText,
    flex: 1,
    color: colors.neutral.text.primary,
    paddingVertical: spacing.md,
  },
  textAreaContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
    marginLeft: spacing.xs,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing.sm,
    minWidth: 100,
    justifyContent: 'center',
  },
  selectedCategory: {
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.md,
      },
    }),
  },
  categoryLabel: {
    ...typography.presets.labelRegular,
    color: colors.neutral.text.primary,
  },
  selectedCategoryLabel: {
    color: colors.neutral.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing.sm,
  },
  selectedPriority: {
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.md,
      },
    }),
  },
  priorityLabel: {
    ...typography.presets.labelSmall,
    color: colors.neutral.text.primary,
  },
  selectedPriorityLabel: {
    color: colors.neutral.white,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: spacing.elevation.sm,
      },
    }),
  },
  dateText: {
    ...typography.presets.bodyRegular,
    flex: 1,
    color: colors.neutral.text.primary,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reminderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderTitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
    fontWeight: '600',
  },
  reminderOptions: {
    marginTop: spacing.sm,
  },
  reminderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  reminderSelectorText: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
  },
  reminderOptionsList: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    maxHeight: 100,
  },
  reminderOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.card,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing.sm,
  },
  reminderOptionSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  reminderOptionText: {
    ...typography.presets.labelSmall,
    color: colors.neutral.text.primary,
  },
  reminderOptionTextSelected: {
    color: colors.neutral.white,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  reminderInfoText: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
  },
  createButtonWrapper: {
    marginTop: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.lg,
      },
    }),
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.presets.buttonLarge,
    color: colors.neutral.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    borderRadius: spacing.borderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.common.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.xl,
      },
    }),
  },
  modalGradient: {
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.presets.headline3,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default AddTaskScreen;