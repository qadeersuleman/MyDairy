import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Easing,
  I18nManager
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({
  title = "Screen Title",
  showBackButton = true,
  onBack,
  rightElement,
  variant = "default",
  backgroundColor = "#FFFFFF",
  titleColor = "#1F2937",
  showShadow = true,
  backButtonColor = "#4F46E5",
  customBackIcon,
  customBackAction,
  headerHeight = Platform.OS === 'ios' ? 100 : 80,
  centerTitle = false,
}) => {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));
  const [rotateValue] = useState(new Animated.Value(0));
  
  const isRTL = I18nManager.isRTL;

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
    } else if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const animateButton = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation for creative variant
    if (variant === 'creative') {
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        rotateValue.setValue(0);
      });
    }
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Back button designs based on variant
  const renderBackButton = () => {
    if (!showBackButton) return null;

    const animatedStyle = {
      transform: [{ scale: scaleValue }, { rotate: rotateInterpolate }],
    };

    switch (variant) {
      case 'minimal':
        return (
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={[styles.backButton, styles.minimalButton]}
              onPress={() => {
                animateButton();
                handleBack();
              }}
              activeOpacity={0.7}
            >
              <Icon
                name={isRTL ? "chevron-right" : "chevron-left"}
                size={24}
                color={backButtonColor}
              />
            </TouchableOpacity>
          </Animated.View>
        );

      case 'creative':
        return (
          <Animated.View style={[animatedStyle, styles.creativeButtonContainer]}>
            <TouchableOpacity
              style={[styles.backButton, styles.creativeButton]}
              onPress={() => {
                animateButton();
                handleBack();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.creativeButtonInner}>
                <Icon
                  name="arrow-left"
                  size={20}
                  color="#FFFFFF"
                  style={isRTL && { transform: [{ scaleX: -1 }] }}
                />
                <View style={styles.waveContainer}>
                  <View style={[styles.wave, styles.wave1]} />
                  <View style={[styles.wave, styles.wave2]} />
                  <View style={[styles.wave, styles.wave3]} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'modern':
        return (
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={[styles.backButton, styles.modernButton]}
              onPress={() => {
                animateButton();
                handleBack();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.modernButtonInner}>
                <Icon
                  name="arrow-left"
                  size={18}
                  color={backButtonColor}
                  style={isRTL && { transform: [{ scaleX: -1 }] }}
                />
              </View>
              <Text style={[styles.modernButtonText, { color: backButtonColor }]}>
                Back
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'floating':
        return (
          <Animated.View style={[animatedStyle, styles.floatingButtonContainer]}>
            <TouchableOpacity
              style={[styles.backButton, styles.floatingButton]}
              onPress={() => {
                animateButton();
                handleBack();
              }}
              activeOpacity={0.9}
            >
              <Icon
                name="arrow-u-left-top"
                size={22}
                color="#FFFFFF"
                style={isRTL && { transform: [{ scaleX: -1 }] }}
              />
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return (
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={[styles.backButton, styles.defaultButton]}
              onPress={() => {
                animateButton();
                handleBack();
              }}
              activeOpacity={0.7}
            >
              <Icon
                name={isRTL ? "chevron-right" : "chevron-left"}
                size={28}
                color={backButtonColor}
              />
              <Text style={[styles.defaultButtonText, { color: backButtonColor }]}>
                Back
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor }}>
      <StatusBar
        barStyle={backgroundColor === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor,
            height: headerHeight,
            ...(showShadow && styles.shadow),
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {renderBackButton()}
          </View>

          <View style={[
            styles.titleContainer,
            centerTitle && styles.centerTitle
          ]}>
            <Text
              style={[
                styles.title,
                { color: titleColor },
                centerTitle && styles.centerTitleText
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>

          <View style={styles.rightSection}>
            {rightElement && rightElement}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 15 : 10,
    paddingHorizontal: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerTitleText: {
    textAlign: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  minimalButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modernButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modernButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  modernButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  creativeButtonContainer: {
    position: 'relative',
  },
  creativeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  creativeButtonInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4F46E5',
    opacity: 0,
  },
  wave1: {
    width: 60,
    height: 60,
    borderWidth: 1,
  },
  wave2: {
    width: 70,
    height: 70,
    borderWidth: 0.8,
  },
  wave3: {
    width: 80,
    height: 80,
    borderWidth: 0.6,
  },
  floatingButtonContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default Header;