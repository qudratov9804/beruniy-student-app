import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const EmptyProgressIllustration = ({ size = 180 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
    <Circle cx="90" cy="90" r="75" fill="#F0FDF4" />
    {/* Chart bars */}
    <Rect x="52" y="110" width="18" height="25" rx="4" fill="#6366F1" opacity="0.3" />
    <Rect x="76" y="92" width="18" height="43" rx="4" fill="#6366F1" opacity="0.5" />
    <Rect x="100" y="76" width="18" height="59" rx="4" fill="#6366F1" />
    {/* Trend line */}
    <Path d="M52 108 Q78 85 118 68" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"
      strokeDasharray="5 3" fill="none" />
    {/* Trophy */}
    <Path d="M82 52 C82 52 78 58 78 64 C78 70 82 72 90 72 C98 72 102 70 102 64 C102 58 98 52 98 52 Z"
      fill="#F59E0B" />
    <Rect x="86" y="72" width="8" height="8" rx="1" fill="#F59E0B" />
    <Rect x="82" y="80" width="16" height="4" rx="2" fill="#F59E0B" />
    <Path d="M78 58 L70 58 Q68 64 74 66" stroke="#F59E0B" strokeWidth="2.5" fill="none"
      strokeLinecap="round" />
    <Path d="M102 58 L110 58 Q112 64 106 66" stroke="#F59E0B" strokeWidth="2.5" fill="none"
      strokeLinecap="round" />
  </Svg>
);
