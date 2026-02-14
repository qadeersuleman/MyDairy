// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  TASKS: '@tasks',
  USER_PREFERENCES: '@user_preferences',
  LAST_SYNC: '@last_sync',
  APP_SETTINGS: '@app_settings',
};

// Task Model
export const createTaskObject = (taskData) => ({
  id: Date.now().toString(),
  title: taskData.title || '',
  description: taskData.description || '',
  category: taskData.category || 'work',
  priority: taskData.priority || 'medium',
  date: taskData.date || new Date().toISOString(),
  time: taskData.time || new Date().toTimeString(),
  reminder: {
    enabled: taskData.reminder?.enabled ?? true,
    minutes: taskData.reminder?.minutes || 10,
    reminderTime: taskData.reminder?.reminderTime || null,
  },
  completed: taskData.completed || false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: taskData.tags || [],
  attachments: taskData.attachments || [],
  notes: taskData.notes || '',
});

// Task Storage Functions
export const taskStorage = {
  // Get all tasks
  getTasks: async () => {
    try {
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  // Save a new task
  saveTask: async (taskData) => {
    try {
      const tasks = await taskStorage.getTasks();
      const newTask = createTaskObject(taskData);
      tasks.push(newTask);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, task: newTask };
    } catch (error) {
      console.error('Error saving task:', error);
      return { success: false, error: error.message };
    }
  },

  // Update an existing task
  updateTask: async (taskId, updatedData) => {
    try {
      const tasks = await taskStorage.getTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, error: 'Task not found' };
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, task: tasks[taskIndex] };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const tasks = await taskStorage.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  },

  // Get a single task by ID
  getTaskById: async (taskId) => {
    try {
      const tasks = await taskStorage.getTasks();
      return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      return null;
    }
  },

  // Toggle task completion
  toggleTaskCompletion: async (taskId) => {
    try {
      const tasks = await taskStorage.getTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, error: 'Task not found' };
      }

      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      tasks[taskIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, task: tasks[taskIndex] };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { success: false, error: error.message };
    }
  },

  // Get tasks by category
  getTasksByCategory: async (category) => {
    try {
      const tasks = await taskStorage.getTasks();
      return tasks.filter(task => task.category === category);
    } catch (error) {
      console.error('Error getting tasks by category:', error);
      return [];
    }
  },

  // Get tasks by priority
  getTasksByPriority: async (priority) => {
    try {
      const tasks = await taskStorage.getTasks();
      return tasks.filter(task => task.priority === priority);
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return [];
    }
  },

  // Get tasks for today
  getTodayTasks: async () => {
    try {
      const tasks = await taskStorage.getTasks();
      const today = new Date().toDateString();
      
      return tasks.filter(task => {
        const taskDate = new Date(task.date).toDateString();
        return taskDate === today && !task.completed;
      });
    } catch (error) {
      console.error('Error getting today\'s tasks:', error);
      return [];
    }
  },

  // Get upcoming tasks
  getUpcomingTasks: async (days = 7) => {
    try {
      const tasks = await taskStorage.getTasks();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate <= futureDate && !task.completed;
      });
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      return [];
    }
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    try {
      const tasks = await taskStorage.getTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today && !task.completed;
      });
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return [];
    }
  },

  // Search tasks
  searchTasks: async (searchTerm) => {
    try {
      const tasks = await taskStorage.getTasks();
      const term = searchTerm.toLowerCase();
      
      return tasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.tags.some(tag => tag.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  },

  // Clear all tasks
  clearAllTasks: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TASKS);
      return { success: true };
    } catch (error) {
      console.error('Error clearing tasks:', error);
      return { success: false, error: error.message };
    }
  },

  // Get task statistics
  getTaskStats: async () => {
    try {
      const tasks = await taskStorage.getTasks();
      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.filter(task => !task.completed).length;
      const overdue = (await taskStorage.getOverdueTasks()).length;
      const today = (await taskStorage.getTodayTasks()).length;

      // Priority breakdown
      const highPriority = tasks.filter(task => task.priority === 'high' && !task.completed).length;
      const mediumPriority = tasks.filter(task => task.priority === 'medium' && !task.completed).length;
      const lowPriority = tasks.filter(task => task.priority === 'low' && !task.completed).length;

      // Category breakdown
      const categoryStats = {};
      tasks.forEach(task => {
        if (!task.completed) {
          categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
        }
      });

      return {
        total: tasks.length,
        completed,
        pending,
        overdue,
        today,
        priorityBreakdown: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        categoryBreakdown: categoryStats,
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return null;
    }
  },
};

// User Preferences Storage
export const preferencesStorage = {
  // Get user preferences
  getPreferences: async () => {
    try {
      const prefsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return prefsJson ? JSON.parse(prefsJson) : {
        theme: 'light',
        notifications: true,
        defaultReminder: 10,
        sortBy: 'date',
        viewMode: 'list',
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  },

  // Save user preferences
  savePreferences: async (preferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return { success: true };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Update specific preference
  updatePreference: async (key, value) => {
    try {
      const preferences = await preferencesStorage.getPreferences();
      preferences[key] = value;
      return await preferencesStorage.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating preference:', error);
      return { success: false, error: error.message };
    }
  },
};

// App Settings Storage
export const appSettings = {
  // Get app settings
  getSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : {
        firstLaunch: true,
        lastVersion: '1.0.0',
        language: 'en',
      };
    } catch (error) {
      console.error('Error getting app settings:', error);
      return null;
    }
  },

  // Save app settings
  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      console.error('Error saving app settings:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark app as launched
  setLaunched: async () => {
    try {
      const settings = await appSettings.getSettings();
      settings.firstLaunch = false;
      return await appSettings.saveSettings(settings);
    } catch (error) {
      console.error('Error setting launched:', error);
      return { success: false, error: error.message };
    }
  },
};

// Clear all storage (for debugging)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    return { success: true };
  } catch (error) {
    console.error('Error clearing storage:', error);
    return { success: false, error: error.message };
  }
};

// Export all storage functions
export default {
  tasks: taskStorage,
  preferences: preferencesStorage,
  settings: appSettings,
  clearAll: clearAllStorage,
  keys: STORAGE_KEYS,
};