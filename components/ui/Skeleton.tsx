import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps, type DimensionValue } from 'react-native';

interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#E2E8F0', opacity }]}
      className={className}
      {...(props as object)}
    />
  );
};

export const CourseCardSkeleton: React.FC = () => (
  <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm shadow-slate-100">
    <Skeleton height={160} borderRadius={16} className="mb-4" />
    <Skeleton width="70%" height={18} className="mb-2" />
    <Skeleton width="50%" height={14} className="mb-3" />
    <View className="flex-row justify-between">
      <Skeleton width="40%" height={12} />
      <Skeleton width="30%" height={12} />
    </View>
  </View>
);
