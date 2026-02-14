// PendingTasksScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { taskStorage } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const PendingTasksScreen = ({ navigation }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, high, medium, low
  const [selectedSort, setSelectedSort] = useState('date'); // date, priority, category
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPendingTasks();
    
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
    ]).start();

    // Refresh when screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingTasks();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Animate search bar
    Animated.timing(searchBarAnim, {
      toValue: searchQuery ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [searchQuery]);

  useEffect(() => {
    // Animate filter panel
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilters]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [pendingTasks, searchQuery, selectedFilter, selectedSort]);

  const loadPendingTasks = async () => {
    setRefreshing(true);
    try {
      const allTasks = await taskStorage.getTasks();
      const pending = allTasks.filter(task => !task.completed);
      const taskStats = await taskStorage.getTaskStats();
      
      setPendingTasks(pending);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let tasks = [...pendingTasks];

    // Apply search filter
    if (searchQuery) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply priority filter
    if (selectedFilter !== 'all') {
      tasks = tasks.filter(task => task.priority === selectedFilter);
    }

    // Apply sorting
    tasks.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'priority':
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredTasks(tasks);
  };

  const handleToggleComplete = async (taskId) => {
    const result = await taskStorage.toggleTaskCompletion(taskId);
    if (result.success) {
      loadPendingTasks();
    }
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await taskStorage.deleteTask(taskId);
            if (result.success) {
              loadPendingTasks();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
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

  const isOverdue = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const filterPanelHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const renderTaskItem = ({ item, index }) => {
    const inputRange = [index - 1, index, index + 1];
    const scale = fadeAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.9, 1],
    });
    
    const overdue = isOverdue(item.date);

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
            style={[styles.taskGradient, overdue && styles.overdueTask]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.taskHeader}>
              <View style={styles.taskCategoryContainer}>
                <Icon 
                  name={getCategoryIcon(item.category)} 
                  size={16} 
                  color={colors.primary.main} 
                />
                <Text style={styles.taskCategory}>{item.category}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                <Icon 
                  name="flag-outline" 
                  size={12} 
                  color={getPriorityColor(item.priority)} 
                />
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority}
                </Text>
              </View>
            </View>

            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {item.description ? (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.taskFooter}>
              <View style={styles.dateContainer}>
                <Icon 
                  name="calendar-outline" 
                  size={14} 
                  color={overdue ? colors.status.error : colors.neutral.text.tertiary} 
                />
                <Text style={[styles.dateText, overdue && styles.overdueText]}>
                  {formatDate(item.date)}
                  {overdue ? ' (Overdue)' : ''}
                </Text>
              </View>

              {item.reminder?.enabled && (
                <View style={styles.reminderIndicator}>
                  <Icon name="notifications-outline" size={14} color={colors.primary.main} />
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.taskActions}>
          <TouchableOpacity
            onPress={() => handleToggleComplete(item.id)}
            style={styles.taskAction}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.actionGradient}
            >
              <Icon name="checkmark-outline" size={18} color={colors.neutral.white} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteTask(item.id, item.title)}
            style={styles.taskAction}
          >
            <LinearGradient
              colors={[colors.status.error, colors.status.error + 'dd']}
              style={styles.actionGradient}
            >
              <Icon name="trash-outline" size={18} color={colors.neutral.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.neutral.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Tasks</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          >
            <Icon 
              name="options-outline" 
              size={22} 
              color={showFilters ? colors.primary.main : colors.neutral.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      {stats && (
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[colors.neutral.card, colors.neutral.background]}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.overdue || 0}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredTasks.length}</Text>
              <Text style={styles.statLabel}>Showing</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            transform: [{
              scale: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02],
              }),
            }],
          }
        ]}
      >
        <Icon name="search-outline" size={20} color={colors.neutral.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pending tasks..."
          placeholderTextColor={colors.neutral.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.neutral.text.tertiary} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {/* Filter Panel */}
      <Animated.View 
        style={[
          styles.filterPanel,
          {
            height: filterPanelHeight,
            opacity: filterAnim,
          }
        ]}
      >
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Priority</Text>
          <View style={styles.filterOptions}>
            {['all', 'high', 'medium', 'low'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextSelected,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort by</Text>
          <View style={styles.filterOptions}>
            {[
              { value: 'date', label: 'Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'category', label: 'Category' },
            ].map((sort) => (
              <TouchableOpacity
                key={sort.value}
                onPress={() => setSelectedSort(sort.value)}
                style={[
                  styles.filterChip,
                  selectedSort === sort.value && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSort === sort.value && styles.filterChipTextSelected,
                  ]}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="checkbox-outline" size={80} color={colors.neutral.text.tertiary} />
      <Text style={styles.emptyTitle}>No Pending Tasks</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any pending tasks. Great job!
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTask')}
        style={styles.emptyButton}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Add New Task</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.background} />
      
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!refreshing ? EmptyState : null}
        refreshing={refreshing}
        onRefresh={loadPendingTasks}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [{ scale: fadeAnim }],
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
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  headerTitle: {
    ...typography.presets.title2,
    color: colors.neutral.text.primary,
  },
  headerRight: {
    width: 40,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main + '20',
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.presets.title2,
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : undefined,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  searchInput: {
    ...typography.presets.bodyRegular,
    flex: 1,
    color: colors.neutral.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterPanel: {
    overflow: 'hidden',
    backgroundColor: colors.neutral.card,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  filterSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  filterLabel: {
    ...typography.presets.labelSmall,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    ...typography.presets.labelSmall,
    color: colors.neutral.text.secondary,
  },
  filterChipTextSelected: {
    color: colors.neutral.white,
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    marginBottom: spacing.md,
  },
  taskItem: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskGradient: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  overdueTask: {
    borderColor: colors.status.error + '40',
    backgroundColor: colors.status.error + '05',
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
  taskCategory: {
    ...typography.presets.caption,
    color: colors.neutral.text.secondary,
    textTransform: 'capitalize',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  priorityText: {
    ...typography.presets.caption,
    textTransform: 'capitalize',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.presets.caption,
    color: colors.neutral.text.tertiary,
  },
  overdueText: {
    color: colors.status.error,
  },
  reminderIndicator: {
    padding: spacing.xs,
  },
  taskActions: {
    gap: spacing.xs,
  },
  taskAction: {
    borderRadius: spacing.borderRadius.full,
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
  actionGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
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
    marginBottom: spacing.xl,
  },
  emptyButton: {
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
  emptyButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  emptyButtonText: {
    ...typography.presets.buttonRegular,
    color: colors.neutral.white,
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

export default PendingTasksScreen;