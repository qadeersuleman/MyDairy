// colors.js - A modern, eye-catching color palette for your React Native app

export default {
  // Primary Colors - Modern and versatile
  primary: {
    main: '#4F46E5', // Deep indigo/purple, aligned with logo's darker tones
    light: '#6366F1', // Lighter purple
    dark: '#3A30C8', // Even darker purple for depth
    gradient: ['#4F46E5', '#6366F1'], // Gradient reflecting logo's deeper purples
  },

  // Secondary Colors - Complementary accents, inspired by the logo's teal/gold
  secondary: {
    main: '#14B8A6', // Teal from the logo's leaf/ring
    light: '#2DD4BF', // Lighter teal
    dark: '#0D9488', // Darker teal
    gradient: ['#14B8A6', '#FBBF24'], // Teal to a soft gold accent
  },

  // Neutral Colors - Clean and modern, maintaining app base
  neutral: {
    white: '#FFFFFF',
    background: '#F9FAFB', // Very light gray for backgrounds
    card: '#FFFFFF',        // Pure white for cards/modals
    border: '#F3F4F6',      // Subtle border color
    placeholder: '#9CA3AF', // Placeholder text
    text: {
      primary: '#111827',   // Almost black for primary text
      secondary: '#6B7280', // Medium gray for secondary text
      tertiary: '#9CA3AF',  // Light gray for disabled text
      inverse: '#FFFFFF',   // White text for dark backgrounds
    }
  },

  // Status Colors - Clear and meaningful (kept original as they are functional)
  status: {
    success: '#10B981',     // Fresh green for success states
    warning: '#F59E0B',     // Warm amber for warnings
    error: '#EF4444',       // Clear red for errors
    info: '#3B82F6',        // Blue for information
    successLight: '#D1FAE5',// Light green background
    warningLight: '#FEF3C7',// Light amber background
    errorLight: '#FEE2E2',  // Light red background
    infoLight: '#DBEAFE',   // Light blue background
  },

  // Accent Colors - For special elements, aligning with logo tones
  accent: {
    purple: '#6366F1',      // Primary purple tone
    teal: '#14B8A6',        // Primary teal tone
    orange: '#F97316',      // Retained for vibrancy, complements gold if used sparingly
    cyan: '#06B6D4',        // A brighter blue-green for contrast
    indigo: '#4F46E5',      // Deep indigo, primary dark tone
  },

  // Gradient Combinations - Ready to use, emphasizing logo's gradients
  gradients: {
    primary: ['#4F46E5', '#6366F1'], // Deep purple to lighter purple
    sunset: ['#FBBF24', '#F59E0B'], // Soft gold to warm amber
    ocean: ['#14B8A6', '#06B6D4'], // Teal to cyan
    forest: ['#10B981', '#14B8A6'], // Maintained for green, still harmonious
    rose: ['#EC4899', '#F472B6'], // Retained for a distinct accent if needed
    dawn: ['#6366F1', '#FBBF24'], // Purple to gold, reflecting logo's main elements
  },

  // Dark Mode Colors (optional but modern) - Adjusted for logo's primary colors
  dark: {
    background: '#111827',
    card: '#1F2937',
    border: '#374151',
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
    }
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    blur: 'rgba(255, 255, 255, 0.2)',
  },

  // Common App-Specific Colors
  common: {
    heart: '#EF4444',       // For like buttons
    star: '#FBBF24',        // For ratings - Aligned with logo's gold accent
    verified: '#10B981',    // Verified badge
    premium: '#F59E0B',     // Premium features - Warm tone, complements gold
    shadow: '#000000',      // For shadows (use with opacity)
    transparent: 'transparent',
  }
};
