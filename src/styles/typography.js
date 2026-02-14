// typography.js - A comprehensive typography system for modern React Native apps

export default {
  // Font Families
  // Update these with your actual font names after linking fonts
  fonts: {
    primary: {
      regular: 'Inter-Regular',      // Primary font - replace with your font
      medium: 'Inter-Medium',        // Medium weight
      semiBold: 'Inter-SemiBold',    // Semi-bold weight
      bold: 'Inter-Bold',            // Bold weight
      light: 'Inter-Light',          // Light weight
      extraLight: 'Inter-ExtraLight', // Extra light weight
      black: 'Inter-Black',          // Black weight
    },
    secondary: {
      regular: 'SF-Pro-Text-Regular',  // Secondary font (iOS SF Pro as fallback)
      medium: 'SF-Pro-Text-Medium',
      semiBold: 'SF-Pro-Text-Semibold',
      bold: 'SF-Pro-Text-Bold',
    },
    monospace: {
      regular: 'SpaceMono-Regular',   // For code or technical content
      bold: 'SpaceMono-Bold',
    },
  },

  // Font Sizes - Based on a modular scale (1.25 ratio)
  sizes: {
    // Display sizes (for large headers)
    display: {
      xl: 48,    // 48px - Hero sections
      lg: 40,    // 40px - Large headers
      md: 32,    // 32px - Medium headers
      sm: 28,    // 28px - Small headers
      xs: 24,    // 24px - Extra small headers
    },
    
    // Heading sizes
    h1: 32,      // 32px - Main headings
    h2: 28,      // 28px - Section headings
    h3: 24,      // 24px - Subsection headings
    h4: 20,      // 20px - Card headings
    h5: 18,      // 18px - Small headings
    h6: 16,      // 16px - Mini headings
    
    // Body text sizes
    body: {
      xl: 18,     // 18px - Large body text
      lg: 16,     // 16px - Regular body text (most common)
      md: 14,     // 14px - Small body text
      sm: 12,     // 12px - Extra small body text
      xs: 10,     // 10px - Captions
    },
    
    // Special text sizes
    caption: 12,   // Captions and footnotes
    overline: 10,  // Overline text
    button: 16,    // Button text
    label: 14,     // Form labels
    helper: 12,    // Helper text
    badge: 11,     // Badge text
  },

  // Line Heights - For better readability
  lineHeights: {
    // Tight line heights for headings
    tight: {
      xs: 1.1,    // For very large text
      sm: 1.15,   // For large text
      md: 1.2,    // For medium headings
      lg: 1.25,   // For small headings
    },
    
    // Normal line heights for body text
    normal: {
      xs: 1.4,    // For very small text
      sm: 1.45,   // For small text
      md: 1.5,    // For regular text (most common)
      lg: 1.55,   // For larger text
      xl: 1.6,    // For very large text
    },
    
    // Relaxed line heights for readability
    relaxed: {
      sm: 1.6,    // Relaxed for small text
      md: 1.7,    // Relaxed for regular text
      lg: 1.8,    // Relaxed for large text
    },
    
    // Exact pixel values (calculated from font size * line height)
    computed: (fontSize, multiplier = 1.5) => fontSize * multiplier,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.8,  // Very tight (for headlines)
    tight: -0.4,    // Tight (for headings)
    normal: 0,      // Normal (most text)
    wide: 0.4,      // Wide (for emphasis)
    wider: 0.8,     // Wider (for uppercase)
    widest: 1.2,    // Widest (for special effects)
    
    // Presets for specific use cases
    presets: {
      headline: -0.5,
      title: -0.3,
      subtitle: -0.2,
      body: 0,
      button: 0.5,
      caption: 0.2,
      uppercase: 1,
    },
  },

  // Font Weights (for custom fonts or system fonts)
  weights: {
    thin: '100',
    extraLight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Text Transformations
  transform: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    none: 'none',
  },

  // Text Decoration
  decoration: {
    none: 'none',
    underline: 'underline',
    lineThrough: 'line-through',
  },

  // Predefined Text Styles
  presets: {
    // Headline styles
    headline1: {
      fontSize: 48,
      lineHeight: 52.8,  // 1.1 * 48
      fontFamily: 'Inter-Bold',
      letterSpacing: -0.8,
      fontWeight: '700',
    },
    headline2: {
      fontSize: 40,
      lineHeight: 46,    // 1.15 * 40
      fontFamily: 'Inter-Bold',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    headline3: {
      fontSize: 32,
      lineHeight: 38.4,  // 1.2 * 32
      fontFamily: 'Inter-SemiBold',
      letterSpacing: -0.3,
      fontWeight: '600',
    },
    
    // Title styles
    title1: {
      fontSize: 28,
      lineHeight: 33.6,  // 1.2 * 28
      fontFamily: 'Inter-SemiBold',
      letterSpacing: -0.3,
      fontWeight: '600',
    },
    title2: {
      fontSize: 24,
      lineHeight: 30,    // 1.25 * 24
      fontFamily: 'Inter-SemiBold',
      letterSpacing: -0.2,
      fontWeight: '600',
    },
    title3: {
      fontSize: 20,
      lineHeight: 26,    // 1.3 * 20
      fontFamily: 'Inter-Medium',
      letterSpacing: -0.2,
      fontWeight: '500',
    },
    
    // Body styles
    bodyLarge: {
      fontSize: 18,
      lineHeight: 27,    // 1.5 * 18
      fontFamily: 'Inter-Regular',
      letterSpacing: 0,
      fontWeight: '400',
    },
    bodyRegular: {
      fontSize: 16,
      lineHeight: 24,    // 1.5 * 16
      fontFamily: 'Inter-Regular',
      letterSpacing: 0,
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21,    // 1.5 * 14
      fontFamily: 'Inter-Regular',
      letterSpacing: 0.1,
      fontWeight: '400',
    },
    
    // Label styles
    labelLarge: {
      fontSize: 16,
      lineHeight: 20,    // 1.25 * 16
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    labelRegular: {
      fontSize: 14,
      lineHeight: 18,    // 1.3 * 14
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    labelSmall: {
      fontSize: 12,
      lineHeight: 16,    // 1.33 * 12
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.2,
      fontWeight: '500',
    },
    
    // Caption styles
    caption: {
      fontSize: 12,
      lineHeight: 16,    // 1.33 * 12
      fontFamily: 'Inter-Regular',
      letterSpacing: 0.2,
      fontWeight: '400',
    },
    overline: {
      fontSize: 10,
      lineHeight: 14,    // 1.4 * 10
      fontFamily: 'Inter-Medium',
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontWeight: '500',
    },
    
    // Button styles
    buttonLarge: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: 'Inter-SemiBold',
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    buttonRegular: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'Inter-SemiBold',
      letterSpacing: 0.3,
      fontWeight: '600',
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.2,
      fontWeight: '500',
    },
    
    // Input styles
    inputLabel: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    inputText: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'Inter-Regular',
      letterSpacing: 0,
      fontWeight: '400',
    },
    inputPlaceholder: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'Inter-Regular',
      letterSpacing: 0,
      fontWeight: '400',
      opacity: 0.6,
    },
    helperText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Inter-Regular',
      letterSpacing: 0,
      fontWeight: '400',
    },
    
    // Badge styles
    badge: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.3,
      fontWeight: '500',
    },
    
    // Navigation styles
    tabBarLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Inter-Medium',
      letterSpacing: 0.2,
      fontWeight: '500',
    },
    headerTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: 'Inter-SemiBold',
      letterSpacing: -0.2,
      fontWeight: '600',
    },
  },

  // Responsive Typography
  responsive: (size, screenWidth) => {
    // Scale font size based on screen width
    if (screenWidth < 375) {
      return size * 0.9; // Smaller screens
    } else if (screenWidth >= 768) {
      return size * 1.2; // Tablets
    }
    return size; // Default
  },

  // Utility functions
  utils: {
    // Create a custom text style
    createStyle: (fontSize, weight = 'regular', family = 'primary', options = {}) => {
      const fontFamily = typography.fonts[family][weight] || typography.fonts.primary.regular;
      const lineHeight = options.lineHeight || fontSize * 1.5;
      const letterSpacing = options.letterSpacing || 0;
      
      return {
        fontSize,
        fontFamily,
        lineHeight,
        letterSpacing,
        ...options,
      };
    },
    
    // Get font family with weight
    getFont: (weight = 'regular', family = 'primary') => {
      return typography.fonts[family][weight] || typography.fonts.primary.regular;
    },
    
    // Calculate responsive font size
    responsiveSize: (size, screenWidth, minSize = 12, maxSize = 48) => {
      let responsiveSize = size;
      if (screenWidth < 375) {
        responsiveSize = Math.max(size * 0.9, minSize);
      } else if (screenWidth >= 768) {
        responsiveSize = Math.min(size * 1.2, maxSize);
      }
      return responsiveSize;
    },
  },
};