// AllTasksScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  TextInput,
  Alert,
  SectionList,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { taskStorage } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const AllTasks = ({ navigation }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState('list');

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

  // Priority options
  const priorities = [
    { id: 'all', label: 'All', color: colors.neutral.text.secondary },
    { id: 'high', label: 'High', color: colors.status.error },
    { id: 'medium', label: 'Medium', color: colors.status.warning },
    { id: 'low', label: 'Low', color: colors.status.success },
  ];

  useEffect(() => {
    loadAllTasks();

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
      loadAllTasks();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [
    allTasks,
    searchQuery,
    selectedFilter,
    selectedCategory,
    selectedPriority,
    selectedSort,
    viewMode,
  ]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters]);

  const loadAllTasks = async () => {
    setRefreshing(true);
    try {
      const tasks = await taskStorage.getTasks();
      const taskStats = await taskStorage.getTaskStats();

      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllTasks(tasks);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let tasks = [...allTasks];

    if (searchQuery) {
      tasks = tasks.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedFilter !== 'all') {
      tasks = tasks.filter(task =>
        selectedFilter === 'pending' ? !task.completed : task.completed,
      );
    }

    if (selectedCategory !== 'all') {
      tasks = tasks.filter(task => task.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      tasks = tasks.filter(task => task.priority === selectedPriority);
    }

    tasks.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        default:
          return 0;
      }
    });

    if (viewMode === 'section') {
      const pendingTasks = tasks.filter(task => !task.completed);
      const completedTasks = tasks.filter(task => task.completed);

      setSections([
        { title: 'Pending', data: pendingTasks, color: colors.status.warning },
        {
          title: 'Completed',
          data: completedTasks,
          color: colors.status.success,
        },
      ]);
    } else {
      setSections([
        { title: 'All Tasks', data: tasks, color: colors.primary.main },
      ]);
    }
  };

  const handleToggleComplete = async taskId => {
    const result = await taskStorage.toggleTaskCompletion(taskId);
    if (result.success) {
      loadAllTasks();
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
              loadAllTasks();
            }
          },
        },
      ],
    );
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Multiple Tasks',
      `Are you sure you want to delete ${selectedTasks.length} tasks?`,
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
            loadAllTasks();
          },
        },
      ],
    );
  };

  const handleBulkStatusChange = complete => {
    Alert.alert(
      complete ? 'Mark as Completed' : 'Mark as Pending',
      `Are you sure you want to mark ${selectedTasks.length} tasks as ${
        complete ? 'completed' : 'pending'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            for (const taskId of selectedTasks) {
              const task = allTasks.find(t => t.id === taskId);
              if (task.completed !== complete) {
                await taskStorage.toggleTaskCompletion(taskId);
              }
            }
            setSelectedTasks([]);
            setSelectionMode(false);
            loadAllTasks();
          },
        },
      ],
    );
  };

  const toggleTaskSelection = taskId => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const formatDate = dateString => {
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

  const getCategoryIcon = category => {
    switch (category) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      case 'shopping':
        return 'cart-outline';
      case 'health':
        return 'fitness-outline';
      case 'education':
        return 'school-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getCategoryColor = category => {
    switch (category) {
      case 'work':
        return colors.primary.main;
      case 'personal':
        return colors.secondary.main;
      case 'shopping':
        return colors.accent.teal;
      case 'health':
        return colors.accent.orange;
      case 'education':
        return colors.accent.purple;
      default:
        return colors.neutral.text.secondary;
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return colors.status.error;
      case 'medium':
        return colors.status.warning;
      case 'low':
        return colors.status.success;
      default:
        return colors.neutral.text.secondary;
    }
  };

  const isOverdue = task => {
    if (task.completed) return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const filterPanelHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  const renderTaskItem = ({ item }) => {
    const isSelected = selectedTasks.includes(item.id);
    const categoryColor = getCategoryColor(item.category);
    const priorityColor = getPriorityColor(item.priority);
    const overdue = isOverdue(item);

    return (
      <Animated.View
        style={[
          styles.taskItemContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            selectionMode
              ? toggleTaskSelection(item.id)
              : navigation.navigate('TaskDetail', { taskId: item.id })
          }
          onLongPress={() => {
            setSelectionMode(true);
            toggleTaskSelection(item.id);
          }}
          style={[
            styles.taskItem,
            isSelected && styles.taskItemSelected,
            overdue && styles.taskItemOverdue,
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
                  color={
                    isSelected
                      ? colors.primary.main
                      : colors.neutral.text.tertiary
                  }
                />
              </View>
            )}

            <View style={styles.taskHeader}>
              <View style={styles.taskCategoryContainer}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColor },
                  ]}
                />
                <Icon
                  name={getCategoryIcon(item.category)}
                  size={16}
                  color={categoryColor}
                />
                <Text style={styles.taskCategory}>{item.category}</Text>
              </View>

              <View style={styles.taskStatusContainer}>
                {item.completed ? (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.status.success + '20' },
                    ]}
                  >
                    <Icon
                      name="checkmark-circle"
                      size={14}
                      color={colors.status.success}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: colors.status.success },
                      ]}
                    >
                      Done
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.status.warning + '20' },
                    ]}
                  >
                    <Icon
                      name="time-outline"
                      size={14}
                      color={colors.status.warning}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: colors.status.warning },
                      ]}
                    >
                      Pending
                    </Text>
                  </View>
                )}
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
              <View style={styles.taskMetaLeft}>
                <View style={styles.dateContainer}>
                  <Icon
                    name="calendar-outline"
                    size={14}
                    color={
                      overdue
                        ? colors.status.error
                        : colors.neutral.text.tertiary
                    }
                  />
                  <Text
                    style={[styles.dateText, overdue && styles.overdueText]}
                  >
                    {formatDate(item.date)}
                    {overdue ? ' (Overdue)' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.taskMetaRight}>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: priorityColor + '20' },
                  ]}
                >
                  <Icon name="flag-outline" size={12} color={priorityColor} />
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {item.priority}
                  </Text>
                </View>

                {item.reminder?.enabled && (
                  <View style={styles.reminderIndicator}>
                    <Icon
                      name="notifications-outline"
                      size={14}
                      color={colors.primary.main}
                    />
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {!selectionMode && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => handleToggleComplete(item.id)}
              style={styles.taskAction}
            >
              <LinearGradient
                colors={
                  item.completed
                    ? colors.gradients?.secondary || ['#EC4899', '#F43F5E']
                    : colors.gradients?.primary || ['#6366F1', '#8B5CF6']
                }
                style={styles.actionGradient}
              >
                <Icon
                  name={
                    item.completed ? 'refresh-outline' : 'checkmark-outline'
                  }
                  size={18}
                  color={colors.neutral.white}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('AddTask', { task: item })}
              style={styles.taskAction}
            >
              <LinearGradient
                colors={[colors.accent.purple, colors.accent.indigo]}
                style={styles.actionGradient}
              >
                <Icon
                  name="create-outline"
                  size={18}
                  color={colors.neutral.white}
                />
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
                <Icon
                  name="trash-outline"
                  size={18}
                  color={colors.neutral.white}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section: { title, color, data } }) => (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={[color + '20', 'transparent']}
        style={styles.sectionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{data.length}</Text>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => {
    const pendingCount = stats?.pending || 0;
    const completedCount = stats?.completed || 0;
    const totalCount = stats?.total || 0;

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={colors.neutral.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Tasks</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() =>
                setViewMode(viewMode === 'list' ? 'section' : 'list')
              }
              style={styles.viewModeButton}
            >
              <Icon
                name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
                size={22}
                color={colors.neutral.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={[
                styles.filterButton,
                showFilters && styles.filterButtonActive,
              ]}
            >
              <Icon
                name="options-outline"
                size={22}
                color={
                  showFilters
                    ? colors.primary.main
                    : colors.neutral.text.secondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: statsAnim,
              transform: [{ scale: statsAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              colors.neutral?.card || '#FFFFFF',
              colors.neutral?.background || '#F9FAFB',
            ]}
            style={styles.statsCard}
          >
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                style={[
                  styles.statValue,
                  selectedFilter === 'all' && styles.statValueActive,
                ]}
              >
                {totalCount}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => setSelectedFilter('pending')}
            >
              <Text
                style={[
                  styles.statValue,
                  selectedFilter === 'pending' && styles.statValueActive,
                ]}
              >
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => setSelectedFilter('completed')}
            >
              <Text
                style={[
                  styles.statValue,
                  selectedFilter === 'completed' && styles.statValueActive,
                ]}
              >
                {completedCount}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <View style={styles.searchContainer}>
          <Icon
            name="search-outline"
            size={20}
            color={colors.neutral.text.tertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all tasks..."
            placeholderTextColor={colors.neutral.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon
                name="close-circle"
                size={20}
                color={colors.neutral.text.tertiary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Animated.View
          style={[
            styles.filterPanel,
            {
              height: filterPanelHeight,
              opacity: filterAnim,
            },
          ]}
        >
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'date', label: 'Date' },
                { value: 'priority', label: 'Priority' },
                { value: 'category', label: 'Category' },
                { value: 'status', label: 'Status' },
              ].map(sort => (
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
                      selectedSort === sort.value &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {sort.label}
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
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipSelected,
                  ]}
                >
                  <Icon
                    name={category.icon}
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? colors.neutral.white
                        : getCategoryColor(category.id)
                    }
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id &&
                        styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Priority</Text>
            <View style={styles.filterOptions}>
              {priorities.map(priority => (
                <TouchableOpacity
                  key={priority.id}
                  onPress={() => setSelectedPriority(priority.id)}
                  style={[
                    styles.filterChip,
                    selectedPriority === priority.id &&
                      styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriority === priority.id &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {selectionMode && (
          <Animated.View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}{' '}
              selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity
                onPress={() => handleBulkStatusChange(true)}
                style={styles.selectionAction}
              >
                <Icon
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.status.success}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBulkStatusChange(false)}
                style={styles.selectionAction}
              >
                <Icon
                  name="refresh-outline"
                  size={20}
                  color={colors.status.warning}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBulkDelete}
                style={styles.selectionAction}
              >
                <Icon
                  name="trash-outline"
                  size={20}
                  color={colors.status.error}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedTasks([]);
                }}
                style={styles.selectionAction}
              >
                <Icon
                  name="close-outline"
                  size={20}
                  color={colors.neutral.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="document-text-outline"
        size={100}
        color={colors.neutral.text.tertiary}
      />
      <Text style={styles.emptyTitle}>No Tasks Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ||
        selectedFilter !== 'all' ||
        selectedCategory !== 'all' ||
        selectedPriority !== 'all'
          ? 'Try adjusting your filters or search query'
          : 'Get started by creating your first task'}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTask')}
        style={styles.emptyButton}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Create New Task</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (!sections) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.neutral.background}
      />

      <SectionList
        sections={sections}
        renderItem={renderTaskItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!refreshing ? EmptyState : null}
        refreshing={refreshing}
        onRefresh={loadAllTasks}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: fadeAnim }],
            opacity: fadeAnim,
          },
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: spacing.sm,
  },
  statValue: {
    ...typography.presets.title2,
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  statValueActive: {
    color: colors.primary.main,
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
  sectionHeader: {
    paddingHorizontal: spacing.layout.screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: spacing.borderRadius.full,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.presets.title3,
    color: colors.neutral.text.primary,
    flex: 1,
  },
  sectionCount: {
    ...typography.presets.bodyRegular,
    color: colors.neutral.text.secondary,
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
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
  taskItemOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
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
  taskStatusContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  statusText: {
    ...typography.presets.caption,
    fontWeight: '600',
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
  taskMetaLeft: {
    flex: 1,
  },
  taskMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  priorityIndicator: {
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

export default AllTasks;
