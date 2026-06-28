import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const ErrorIllustration = ({ size = 180 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
    <Circle cx="90" cy="90" r="75" fill="#FFF1F2" />
    {/* Warning triangle */}
    <Path d="M90 52 L130 118 L50 118 Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="4"
      strokeLinejoin="round" />
    {/* Exclamation line */}
    <Rect x="87" y="72" width="6" height="26" rx="3" fill="#EF4444" />
    {/* Exclamation dot */}
    <Circle cx="90" cy="107" r="4" fill="#EF4444" />
    {/* Decorative elements */}
    <Circle cx="48" cy="55" r="5" fill="#EF4444" opacity="0.2" />
    <Circle cx="138" cy="55" r="7" fill="#EF4444" opacity="0.15" />
    <Path d="M42 130 Q50 120 58 130" stroke="#EF4444" strokeWidth="2.5" fill="none"
      strokeLinecap="round" opacity="0.4" />
    <Path d="M122 130 Q130 120 138 130" stroke="#EF4444" strokeWidth="2.5" fill="none"
      strokeLinecap="round" opacity="0.4" />
  </Svg>
);
