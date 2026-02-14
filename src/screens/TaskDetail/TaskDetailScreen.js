// TaskDetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  Platform,
  Share,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { taskStorage } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const TaskDetailScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const deleteButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadTaskDetails();
    
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
    ]).start();

    // Refresh when screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      loadTaskDetails();
    });

    return unsubscribe;
  }, [navigation, taskId]);

  const loadTaskDetails = async () => {
    setLoading(true);
    const taskData = await taskStorage.getTaskById(taskId);
    setTask(taskData);
    setIsCompleted(taskData?.completed || false);
    setLoading(false);
  };

  const handleToggleComplete = async () => {
    // Button press animation
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

    const result = await taskStorage.toggleTaskCompletion(taskId);
    if (result.success) {
      setIsCompleted(!isCompleted);
      setTask(result.task);
    }
  };

  const handleDeleteTask = () => {
    // Delete button animation
    Animated.sequence([
      Animated.spring(deleteButtonScale, {
        toValue: 0.95,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(deleteButtonScale, {
        toValue: 1,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    
    const result = await taskStorage.deleteTask(taskId);
    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = () => {
    navigation.navigate('AddTask', { taskId, task });
  };

  const handleShareTask = async () => {
    try {
      await Share.share({
        message: `Task: ${task.title}\nDescription: ${task.description || 'No description'}\nPriority: ${task.priority}\nCategory: ${task.category}\nDate: ${new Date(task.date).toLocaleDateString()}\nTime: ${formatTime(task.time)}`,
        title: 'Task Details',
      });
    } catch (error) {
      console.error('Error sharing task:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Not set';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return colors.status.error;
      case 'medium': return colors.status.warning;
      case 'low': return colors.status.success;
      default: return colors.neutral.text.secondary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-circle-outline';
      case 'low': return 'checkmark-circle-outline';
      default: return 'flag-outline';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'work': return 'briefcase-outline';
      case 'personal': return 'person-outline';
      case 'shopping': return 'cart-outline';
      case 'health': return 'fitness-outline';
      case 'education': return 'school-outline';
      default: return 'ellipse-outline';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'work': return colors.primary.main;
      case 'personal': return colors.secondary.main;
      case 'shopping': return colors.accent.teal;
      case 'health': return colors.accent.orange;
      case 'education': return colors.accent.purple;
      default: return colors.neutral.text.secondary;
    }
  };

  const formatReminderText = () => {
    if (!task?.reminder?.enabled) return 'No reminder set';
    
    const minutes = task.reminder.minutes;
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} before`;
    } else if (minutes === 60) {
      return '1 hour before';
    } else if (minutes === 120) {
      return '2 hours before';
    } else if (minutes === 1440) {
      return '1 day before';
    }
    return `${minutes} minutes before`;
  };

  if (loading || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.background} />
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon name="hourglass-outline" size={60} color={colors.primary.main} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.background} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
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
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShareTask}
              style={styles.headerAction}
              activeOpacity={0.7}
            >
              <Icon name="share-outline" size={22} color={colors.neutral.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEditTask}
              style={styles.headerAction}
              activeOpacity={0.7}
            >
              <Icon name="create-outline" size={22} color={colors.neutral.text.secondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Task Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, isCompleted && styles.statusCompleted]}>
              <Icon 
                name={isCompleted ? 'checkmark-circle' : 'time-outline'} 
                size={16} 
                color={isCompleted ? colors.status.success : colors.status.warning} 
              />
              <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{task.title}</Text>

          {/* Description */}
          {task.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          ) : null}

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Category */}
            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.detailCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.detailIconContainer, { backgroundColor: getCategoryColor(task.category) + '20' }]}>
                <Icon name={getCategoryIcon(task.category)} size={24} color={getCategoryColor(task.category)} />
              </View>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{task.category}</Text>
            </LinearGradient>

            {/* Priority */}
            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.detailCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.detailIconContainer, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                <Icon name={getPriorityIcon(task.priority)} size={24} color={getPriorityColor(task.priority)} />
              </View>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text style={[styles.detailValue, { color: getPriorityColor(task.priority) }]}>
                {task.priority}
              </Text>
            </LinearGradient>
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.dateTimeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="calendar-outline" size={20} color={colors.primary.main} />
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Due Date</Text>
                <Text style={styles.dateTimeValue}>{formatDate(task.date)}</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.dateTimeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="time-outline" size={20} color={colors.primary.main} />
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <Text style={styles.dateTimeValue}>{formatTime(task.time)}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Reminder */}
          <LinearGradient
            colors={[colors.neutral.card, colors.neutral.background]}
            style={styles.reminderCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitleContainer}>
                <Icon 
                  name={task.reminder?.enabled ? 'notifications' : 'notifications-off-outline'} 
                  size={22} 
                  color={task.reminder?.enabled ? colors.primary.main : colors.neutral.text.tertiary} 
                />
                <Text style={[styles.reminderTitle, !task.reminder?.enabled && styles.reminderDisabled]}>
                  Reminder
                </Text>
              </View>
              {task.reminder?.enabled && (
                <View style={styles.reminderBadge}>
                  <Text style={styles.reminderBadgeText}>{formatReminderText()}</Text>
                </View>
              )}
            </View>
            
            {task.reminder?.enabled && task.reminder.reminderTime && (
              <Text style={styles.reminderTime}>
                You'll be notified at {new Date(task.reminder.reminderTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            )}
          </LinearGradient>

          {/* Created At */}
          <Text style={styles.createdAt}>
            Created on {new Date(task.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View 
        style={[
          styles.actionButtons,
          {
            transform: [{ scale: buttonScale }],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggleComplete}
          style={styles.actionButtonWrapper}
        >
          <LinearGradient
            colors={isCompleted ? colors.gradients.secondary : colors.gradients.primary}
            style={styles.actionButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon 
              name={isCompleted ? 'refresh-outline' : 'checkmark-outline'} 
              size={22} 
              color={colors.neutral.white} 
            />
            <Text style={styles.actionButtonText}>
              {isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: deleteButtonScale }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDeleteTask}
            style={styles.deleteButton}
          >
            <Icon name="trash-outline" size={22} color={colors.status.error} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.modalGradient}
            >
              <View style={styles.modalIconContainer}>
                <Icon name="warning-outline" size={60} color={colors.status.error} />
              </View>
              
              <Text style={styles.modalTitle}>Delete Task</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmDelete}
                  style={styles.modalDeleteButton}
                >
                  <LinearGradient
                    colors={[colors.status.error, colors.status.error + 'dd']}
                    style={styles.modalDeleteGradient}
                  >
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.layout.screenPadding,
  },
  statusContainer: {
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.status.warning + '20',
    borderRadius: spacing.borderRadius.full,
  },
  statusCompleted: {
    backgroundColor: colors.status.success + '20',
  },
  statusText: {
    ...typography.presets.labelSmall,
    color: colors.status.warning,
  },
  statusTextCompleted: {
    color: colors.status.success,
  },
  title: {
    ...typography.presets.headline2,
    color: colors.neutral.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.presets.labelLarge,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  detailCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: spacing.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
  },
  detailValue: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateTimeContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dateTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
    marginBottom: spacing.xs,
  },
  dateTimeValue: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
  },
  reminderCard: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.xl,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  reminderDisabled: {
    color: colors.neutral.text.tertiary,
  },
  reminderBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.main + '20',
    borderRadius: spacing.borderRadius.full,
  },
  reminderBadgeText: {
    ...typography.presets.caption,
    color: colors.primary.main,
  },
  reminderTime: {
    ...typography.presets.caption,
    color: colors.neutral.text.secondary,
  },
  createdAt: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral.background,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  actionButtonWrapper: {
    flex: 1,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.presets.buttonRegular,
    color: colors.neutral.white,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.error + '30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
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
  },
  modalIconContainer: {
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.presets.title2,
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  modalCancelText: {
    ...typography.presets.buttonRegular,
    color: colors.neutral.text.secondary,
  },
  modalDeleteButton: {
    flex: 1,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  modalDeleteGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  modalDeleteText: {
    ...typography.presets.buttonRegular,
    color: colors.neutral.white,
  },
});

export default TaskDetailScreen;