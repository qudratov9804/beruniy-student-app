import React, { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#2563EB',
  backgroundColor = '#E2E8F0',
  showLabel = false,
  animated = true,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedWidth]);

  return (
    <View>
      {showLabel && (
        <Text className="text-xs text-slate-500 mb-1 text-right">
          {Math.round(clampedProgress)}%
        </Text>
      )}
      <View className="w-full overflow-hidden rounded-full" style={{ height, backgroundColor }}>
        <Animated.View
          style={{
            height,
            backgroundColor: color,
            borderRadius: height,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
};
