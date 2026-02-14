// CompletedTasksScreen.js
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
  Share,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { taskStorage } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const CompletedTasksScreen = ({ navigation }) => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Categories for filter
  const categories = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'work', label: 'Work', icon: 'briefcase-outline' },
    { id: 'personal', label: 'Personal', icon: 'person-outline' },
    { id: 'shopping', label: 'Shopping', icon: 'cart-outline' },
    { id: 'health', label: 'Health', icon: 'fitness-outline' },
    { id: 'education', label: 'Education', icon: 'school-outline' },
  ];

  useEffect(() => {
    loadCompletedTasks();
    
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
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const unsubscribe = navigation.addListener('focus', () => {
      loadCompletedTasks();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    applyFilters();
  }, [completedTasks, searchQuery, selectedTimeFilter, selectedCategory]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilters]);

  const loadCompletedTasks = async () => {
    setRefreshing(true);
    try {
      const allTasks = await taskStorage.getTasks();
      const completed = allTasks.filter(task => task.completed);
      const taskStats = await taskStorage.getTaskStats();
      
      completed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setCompletedTasks(completed);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let tasks = [...completedTasks];

    if (searchQuery) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      tasks = tasks.filter(task => task.category === selectedCategory);
    }

    if (selectedTimeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

      tasks = tasks.filter(task => {
        const completionDate = new Date(task.updatedAt);
        switch (selectedTimeFilter) {
          case 'today':
            return completionDate >= today;
          case 'week':
            return completionDate >= weekAgo;
          case 'month':
            return completionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(tasks);
  };

  const handleUncompleteTask = async (taskId) => {
    Alert.alert(
      'Mark as Pending',
      'Do you want to move this task back to pending?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const result = await taskStorage.toggleTaskCompletion(taskId);
            if (result.success) {
              loadCompletedTasks();
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}" from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await taskStorage.deleteTask(taskId);
            if (result.success) {
              loadCompletedTasks();
            }
          },
        },
      ]
    );
  };

  const handleShareTask = async (task) => {
    try {
      await Share.share({
        message: `✅ Completed Task: ${task.title}\n\nDescription: ${task.description || 'No description'}\nCategory: ${task.category}\nPriority: ${task.priority}\nCompleted on: ${new Date(task.updatedAt).toLocaleDateString()}`,
        title: 'Task Completed!',
      });
    } catch (error) {
      console.error('Error sharing task:', error);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Multiple Tasks',
      `Are you sure you want to delete ${selectedTasks.length} tasks from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const taskId of selectedTasks) {
              await taskStorage.deleteTask(taskId);
            }
            setSelectedTasks([]);
            setSelectionMode(false);
            loadCompletedTasks();
          },
        },
      ]
    );
  };

  const handleBulkUncomplete = () => {
    Alert.alert(
      'Mark Multiple as Pending',
      `Are you sure you want to move ${selectedTasks.length} tasks back to pending?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            for (const taskId of selectedTasks) {
              await taskStorage.toggleTaskCompletion(taskId);
            }
            setSelectedTasks([]);
            setSelectionMode(false);
            loadCompletedTasks();
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getCompletionStats = () => {
    const total = completedTasks.length;
    const thisWeek = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    }).length;
    
    const thisMonth = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return taskDate >= monthAgo;
    }).length;

    return { total, thisWeek, thisMonth };
  };

  const filterPanelHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const renderTaskItem = ({ item, index }) => {
    const isSelected = selectedTasks.includes(item.id);
    const categoryColor = getCategoryColor(item.category);

    return (
      <Animated.View
        style={[
          styles.taskItemContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (selectionMode) {
              toggleTaskSelection(item.id);
            } else {
              navigation.navigate('TaskDetail', { taskId: item.id });
            }
          }}
          onLongPress={() => {
            setSelectionMode(true);
            toggleTaskSelection(item.id);
          }}
          style={[
            styles.taskItem,
            isSelected && styles.taskItemSelected,
          ]}
        >
          <LinearGradient
            colors={[colors.neutral.card, colors.neutral.background]}
            style={styles.taskGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {selectionMode && (
              <View style={styles.selectionIndicator}>
                <Icon 
                  name={isSelected ? 'checkbox' : 'square-outline'} 
                  size={24} 
                  color={isSelected ? colors.primary.main : colors.neutral.text.tertiary} 
                />
              </View>
            )}

            <View style={styles.taskHeader}>
              <View style={styles.taskCategoryContainer}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                <Icon name={getCategoryIcon(item.category)} size={16} color={categoryColor} />
                <Text style={styles.taskCategory}>{item.category}</Text>
              </View>
              <View style={styles.completionBadge}>
                <Icon name="checkmark-circle" size={16} color={colors.status.success} />
                <Text style={styles.completionTime}>
                  {formatTime(item.updatedAt)}
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
                <Icon name="calendar-outline" size={14} color={colors.neutral.text.tertiary} />
                <Text style={styles.dateText}>
                  Completed {formatDate(item.updatedAt)}
                </Text>
              </View>

              <View style={styles.priorityIndicator}>
                <Icon 
                  name="flag-outline" 
                  size={14} 
                  color={
                    item.priority === 'high' ? colors.status.error :
                    item.priority === 'medium' ? colors.status.warning :
                    colors.status.success
                  } 
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {!selectionMode && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => handleUncompleteTask(item.id)}
              style={styles.taskAction}
            >
              <LinearGradient
                colors={[colors.status.warning, colors.status.warning + 'dd']}
                style={styles.actionGradient}
              >
                <Icon name="refresh-outline" size={18} color={colors.neutral.white} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShareTask(item)}
              style={styles.taskAction}
            >
              <LinearGradient
                colors={[colors.primary.main, colors.primary.light]}
                style={styles.actionGradient}
              >
                <Icon name="share-outline" size={18} color={colors.neutral.white} />
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
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => {
    const completionStats = getCompletionStats();

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Tasks</Text>
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

        {completedTasks.length > 0 && (
          <Animated.View 
            style={[
              styles.celebrationBanner,
              {
                opacity: statsAnim,
                transform: [{ scale: statsAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={colors.gradients.success || ['#10B981', '#34D399']}
              style={styles.celebrationGradient}
            >
              <Icon name="trophy-outline" size={24} color={colors.neutral.white} />
              <View style={styles.celebrationText}>
                <Text style={styles.celebrationTitle}>Great job!</Text>
                <Text style={styles.celebrationSubtitle}>
                  You've completed {completionStats.total} task{completionStats.total !== 1 ? 's' : ''} in total
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {completedTasks.length > 0 && (
          <Animated.View 
            style={[
              styles.statsContainer,
              {
                opacity: statsAnim,
                transform: [{ scale: statsAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={[colors.neutral.card, colors.neutral.background]}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completionStats.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completionStats.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completionStats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color={colors.neutral.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search completed tasks..."
            placeholderTextColor={colors.neutral.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.neutral.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

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
            <Text style={styles.filterLabel}>Time Period</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => setSelectedTimeFilter(filter.value)}
                  style={[
                    styles.filterChip,
                    selectedTimeFilter === filter.value && styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedTimeFilter === filter.value && styles.filterChipTextSelected,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipSelected,
                  ]}
                >
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    color={selectedCategory === category.id ? colors.neutral.white : getCategoryColor(category.id)} 
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {selectionMode && (
          <Animated.View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity
                onPress={handleBulkUncomplete}
                style={styles.selectionAction}
              >
                <Icon name="refresh-outline" size={20} color={colors.status.warning} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBulkDelete}
                style={styles.selectionAction}
              >
                <Icon name="trash-outline" size={20} color={colors.status.error} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedTasks([]);
                }}
                style={styles.selectionAction}
              >
                <Icon name="close-outline" size={20} color={colors.neutral.text.secondary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="checkmark-done-circle-outline" size={100} color={colors.neutral.text.tertiary} />
      <Text style={styles.emptyTitle}>No Completed Tasks</Text>
      <Text style={styles.emptySubtitle}>
        Tasks you complete will appear here. Start checking off your todos!
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('PendingTasks')}
        style={styles.emptyButton}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>View Pending Tasks</Text>
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
        onRefresh={loadCompletedTasks}
        showsVerticalScrollIndicator={false}
      />
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
  celebrationBanner: {
    marginBottom: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.status.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: spacing.elevation.md,
      },
    }),
  },
  celebrationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  celebrationText: {
    flex: 1,
  },
  celebrationTitle: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  celebrationSubtitle: {
    ...typography.presets.caption,
    color: colors.neutral.white,
    opacity: 0.9,
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
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryChipText: {
    ...typography.presets.labelSmall,
    color: colors.neutral.text.secondary,
  },
  categoryChipTextSelected: {
    color: colors.neutral.white,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '10',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
    marginBottom: spacing.md,
  },
  selectionText: {
    ...typography.presets.bodyRegular,
    color: colors.primary.main,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectionAction: {
    padding: spacing.xs,
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
  taskItemSelected: {
    transform: [{ scale: 1.02 }],
  },
  taskGradient: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
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
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.success + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  completionTime: {
    ...typography.presets.caption,
    color: colors.status.success,
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
  priorityIndicator: {
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
});

export default CompletedTasksScreen;