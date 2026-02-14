// HomeScreen.js
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
  FlatList,
  Animated,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { taskStorage } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [userName] = useState('Qadeer'); // You can get this from user preferences

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHomeData();
    setGreeting(getGreeting());
    
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
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Refresh data when screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      loadHomeData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadHomeData = async () => {
    try {
      const today = await taskStorage.getTodayTasks();
      const taskStats = await taskStorage.getTaskStats();
      
      setTodayTasks(today);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  const getProgressPercentage = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const formatTime = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'No time';
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

  const renderTaskItem = ({ item, index }) => {
    const inputRange = [index - 1, index, index + 1];
    const scale = fadeAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.9, 1],
    });

    return (
      <Animated.View
        style={[
          styles.taskItemContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          style={styles.taskItem}
        >
          <LinearGradient
            colors={[colors.neutral.card, colors.neutral.background]}
            style={styles.taskGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.taskHeader}>
              <View style={styles.taskCategoryContainer}>
                <View style={[styles.categoryDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                <Icon name={getCategoryIcon(item.category)} size={16} color={colors.primary.main} />
                <Text style={styles.taskCategory}>{item.category}</Text>
              </View>
              <Text style={styles.taskTime}>{formatTime(item.date, item.time)}</Text>
            </View>

            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>

            {item.description ? (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.taskFooter}>
              <View style={styles.priorityBadge}>
                <Icon 
                  name="flag-outline" 
                  size={12} 
                  color={getPriorityColor(item.priority)} 
                />
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority}
                </Text>
              </View>

              {item.reminder?.enabled && (
                <View style={styles.reminderBadge}>
                  <Icon name="notifications-outline" size={12} color={colors.primary.main} />
                  <Text style={styles.reminderText}>
                    {item.reminder.minutes}m before
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Icon name="checkbox-outline" size={80} color={colors.neutral.text.tertiary} />
      <Text style={styles.emptyTitle}>No Tasks for Today</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! Tap the + button to add a new task.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.background} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{userName}! 👋</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.profileGradient}
              >
                <Text style={styles.profileInitial}>{userName[0]}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>

        {/* Stats Cards */}
        {stats && (
          <Animated.View 
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: statsAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.pending || 0}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.completed || 0}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total || 0}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{getProgressPercentage()}% Complete</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Today's Tasks Section */}
        <Animated.View
          style={[
            styles.tasksSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="today-outline" size={24} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AllTasks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {todayTasks.length > 0 ? (
            <FlatList
              data={todayTasks.slice(0, 3)} // Show only first 3 tasks
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.tasksList}
            />
          ) : (
            <EmptyState />
          )}
        </Animated.View>

        {/* Priority Breakdown */}
        {stats && stats.pending > 0 && (
          <Animated.View 
            style={[
              styles.prioritySection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="flag-outline" size={24} color={colors.primary.main} />
                <Text style={styles.sectionTitle}>Priority Breakdown</Text>
              </View>
            </View>

            <View style={styles.priorityBreakdown}>
              {stats.priorityBreakdown?.high > 0 && (
                <View style={styles.priorityBreakdownItem}>
                  <View style={styles.priorityBreakdownHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: colors.status.error }]} />
                    <Text style={styles.priorityBreakdownLabel}>High</Text>
                  </View>
                  <Text style={styles.priorityBreakdownValue}>
                    {stats.priorityBreakdown.high}
                  </Text>
                </View>
              )}
              
              {stats.priorityBreakdown?.medium > 0 && (
                <View style={styles.priorityBreakdownItem}>
                  <View style={styles.priorityBreakdownHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: colors.status.warning }]} />
                    <Text style={styles.priorityBreakdownLabel}>Medium</Text>
                  </View>
                  <Text style={styles.priorityBreakdownValue}>
                    {stats.priorityBreakdown.medium}
                  </Text>
                </View>
              )}
              
              {stats.priorityBreakdown?.low > 0 && (
                <View style={styles.priorityBreakdownItem}>
                  <View style={styles.priorityBreakdownHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: colors.status.success }]} />
                    <Text style={styles.priorityBreakdownLabel}>Low</Text>
                  </View>
                  <Text style={styles.priorityBreakdownValue}>
                    {stats.priorityBreakdown.low}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddTask')}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.fabGradient}
          >
            <Icon name="add" size={30} color={colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.layout.screenPadding,
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
  },
  userName: {
    ...typography.presets.headline4,
    color: colors.neutral.text.primary,
    marginTop: spacing.xs,
  },
  date: {
    ...typography.presets.bodySmall,
    color: colors.neutral.text.tertiary,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.md,
      },
    }),
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    ...typography.presets.headline4,
    color: colors.neutral.white,
    textTransform: 'uppercase',
  },
  statsContainer: {
    paddingHorizontal: spacing.layout.screenPadding,
    marginBottom: spacing.xl,
  },
  statsCard: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.presets.headline2,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.neutral.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral.white,
    opacity: 0.3,
  },
  progressContainer: {
    gap: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: spacing.borderRadius.full,
  },
  progressText: {
    ...typography.presets.caption,
    color: colors.neutral.white,
    textAlign: 'right',
  },
  tasksSection: {
    paddingHorizontal: spacing.layout.screenPadding,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.presets.title3,
    color: colors.neutral.text.primary,
  },
  seeAllText: {
    ...typography.presets.labelSmall,
    color: colors.primary.main,
  },
  tasksList: {
    gap: spacing.md,
  },
  taskItemContainer: {
    marginBottom: spacing.sm,
  },
  taskItem: {
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
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
  taskGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  taskCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: spacing.borderRadius.full,
  },
  taskCategory: {
    ...typography.presets.caption,
    color: colors.neutral.text.secondary,
    textTransform: 'capitalize',
  },
  taskTime: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
  },
  taskTitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    ...typography.presets.caption,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: spacing.borderRadius.full,
  },
  priorityText: {
    ...typography.presets.caption,
    textTransform: 'capitalize',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: spacing.borderRadius.full,
  },
  reminderText: {
    ...typography.presets.caption,
    color: colors.neutral.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    ...typography.presets.title3,
    color: colors.neutral.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  prioritySection: {
    paddingHorizontal: spacing.layout.screenPadding,
  },
  priorityBreakdown: {
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing.md,
  },
  priorityBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: spacing.borderRadius.full,
  },
  priorityBreakdownLabel: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
  },
  priorityBreakdownValue: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.layout.screenPadding,
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
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: spacing.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;