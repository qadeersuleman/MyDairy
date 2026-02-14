// spacing.js - A systematic spacing scale for consistent and responsive layouts

export default {
  // Base spacing unit (4px) - Following the 4-point grid system
  // This is the foundation for all spacing values
  base: 4,

  // Spacing scale - Multiples of the base unit
  // Use these for consistent margins, paddings, and gaps
  xs: 4,      // Extra small - 4px
  sm: 8,      // Small - 8px
  md: 12,     // Medium - 12px
  base: 16,   // Base - 16px (most common)
  lg: 20,     // Large - 20px
  xl: 24,     // Extra large - 24px
  '2xl': 32,  // 2x Large - 32px
  '3xl': 40,  // 3x Large - 40px
  '4xl': 48,  // 4x Large - 48px
  '5xl': 56,  // 5x Large - 56px
  '6xl': 64,  // 6x Large - 64px
  '7xl': 72,  // 7x Large - 72px
  '8xl': 80,  // 8x Large - 80px

  // Common layout spacings
  layout: {
    screenPadding: 16,      // Standard screen padding
    screenPaddingSm: 12,    // Smaller screen padding
    screenPaddingLg: 24,    // Larger screen padding
    containerMaxWidth: 1200, // Max width for large screens
    gridGutter: 16,         // Gap between grid items
  },

  // Component-specific spacings
  components: {
    // Button spacings
    button: {
      paddingVertical: 12,    // Button vertical padding
      paddingHorizontal: 16,  // Button horizontal padding
      paddingVerticalSm: 8,   // Small button vertical padding
      paddingHorizontalSm: 12, // Small button horizontal padding
      paddingVerticalLg: 16,  // Large button vertical padding
      paddingHorizontalLg: 24, // Large button horizontal padding
      gap: 8,                 // Space between icon and text
      borderRadius: 8,        // Button border radius
      borderRadiusSm: 4,      // Small button border radius
      borderRadiusLg: 12,     // Large button border radius
    },

    // Card spacings
    card: {
      padding: 16,            // Card inner padding
      paddingSm: 12,          // Small card padding
      paddingLg: 24,          // Large card padding
      borderRadius: 12,       // Card border radius
      gap: 12,                // Gap between card elements
      marginBottom: 16,       // Margin between cards
    },

    // Input field spacings
    input: {
      paddingVertical: 12,    // Input vertical padding
      paddingHorizontal: 16,  // Input horizontal padding
      borderRadius: 8,        // Input border radius
      gap: 8,                 // Space between label and input
    },

    // Avatar sizes
    avatar: {
      xs: 24,     // Extra small avatar
      sm: 32,     // Small avatar
      md: 40,     // Medium avatar
      lg: 48,     // Large avatar
      xl: 56,     // Extra large avatar
      '2xl': 64,  // 2x Large avatar
    },

    // Icon sizes
    icon: {
      xs: 16,     // Extra small icon
      sm: 20,     // Small icon
      md: 24,     // Medium icon (most common)
      lg: 28,     // Large icon
      xl: 32,     // Extra large icon
      '2xl': 40,  // 2x Large icon
    },
  },

  // Typography-related spacings
  typography: {
    lineHeight: {
      tight: 1.2,     // Tight line height for headings
      normal: 1.5,    // Normal line height for body text
      relaxed: 1.75,  // Relaxed line height for readability
    },
    letterSpacing: {
      tight: -0.5,    // Tight letter spacing for headings
      normal: 0,      // Normal letter spacing
      wide: 0.5,      // Wide letter spacing for emphasis
    },
    paragraphSpacing: 16,  // Space between paragraphs
    headingMarginBottom: 8, // Margin below headings
  },

  // Border radii
  borderRadius: {
    none: 0,
    sm: 4,      // Small border radius
    md: 8,      // Medium border radius (most common)
    lg: 12,     // Large border radius
    xl: 16,     // Extra large border radius
    '2xl': 24,  // 2x Large border radius
    full: 9999, // Full rounded (for pills and circles)
  },

  // Gap/spacing between elements
  gaps: {
    xs: 4,      // Extra small gap
    sm: 8,      // Small gap
    md: 12,     // Medium gap
    base: 16,   // Base gap
    lg: 20,     // Large gap
    xl: 24,     // Extra large gap
    '2xl': 32,  // 2x Large gap
    '3xl': 40,  // 3x Large gap
  },

  // Margin and padding shortcuts (following Tailwind-like naming)
  margin: {
    auto: 'auto',
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
  },

  padding: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
  },

  // Responsive breakpoints (for responsive design)
  breakpoints: {
    xs: 375,    // iPhone SE / small phones
    sm: 640,    // Larger phones
    md: 768,    // Tablets
    lg: 1024,   // Small tablets / landscape
    xl: 1280,   // Desktop
    '2xl': 1536, // Large desktop
  },

  // Device-specific insets (for safe areas)
  insets: {
    statusBar: 44,      // Status bar height (iOS)
    statusBarAndroid: 24, // Status bar height (Android)
    bottomBar: 49,      // Bottom tab bar height
    navigationBar: 44,   // Navigation bar height
    homeIndicator: 34,   // Home indicator height (iPhone X+)
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 10,
    sticky: 100,
    overlay: 200,
    modal: 300,
    popover: 400,
    toast: 500,
    tooltip: 600,
  },

  // Shadow/elevation levels (for Android elevation and iOS shadow)
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
    '2xl': 24,
  },

  // Duration for animations (in milliseconds)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 500,
  },
};