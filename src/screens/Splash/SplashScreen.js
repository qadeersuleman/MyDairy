// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Navigate after 3 seconds
    setTimeout(() => {
      // navigation.replace('Home');
    }, 3000);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowInterpolate = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={[styles.gradientBg, { opacity: fadeAnim }]}>
        <View style={styles.gradientLayer} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Your MakeAppIcon Logo with Animations */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          {/* Glow Effect */}
          <Animated.View
            style={[
              styles.iconGlow,
              {
                opacity: glowInterpolate,
                transform: [{ scale: glowInterpolate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }) }],
              },
            ]}
          />
          
          {/* Your App Icon from MakeAppIcon */}
          <Image
            source={require('../../assets/images/LOGO.png')} // Your icon here
            style={styles.appIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.appName}>My Dairy</Text>
          <Text style={styles.tagline}>Experience Excellence</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A237E',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    opacity: 0.4,
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(33, 150, 243, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    letterSpacing: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 50,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginHorizontal: 6,
  },
});

export default SplashScreen;