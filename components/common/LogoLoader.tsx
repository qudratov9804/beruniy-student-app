import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const LOGO_ASPECT = 478 / 600;

interface LogoLoaderProps {
  size?: number;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({ size = 96 }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.1 }],
    opacity: 1 - pulse.value * 0.45,
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[{ width: size, height: size * LOGO_ASPECT }, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
