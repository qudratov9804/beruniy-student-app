import React from 'react';
import Svg, { Rect, Circle, Path, G, Ellipse } from 'react-native-svg';

export const EmptyCoursesIllustration = ({ size = 180 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
    {/* Background circle */}
    <Circle cx="90" cy="90" r="75" fill="#EEF2FF" />
    {/* Stack of books */}
    <Rect x="45" y="105" width="90" height="14" rx="4" fill="#6366F1" opacity="0.3" />
    <Rect x="50" y="92" width="80" height="15" rx="4" fill="#6366F1" opacity="0.5" />
    <Rect x="48" y="68" width="84" height="26" rx="6" fill="#6366F1" />
    {/* Book spine line */}
    <Rect x="60" y="68" width="4" height="26" rx="2" fill="#fff" opacity="0.4" />
    {/* Book pages */}
    <Path d="M64 68 Q90 62 116 68" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
    {/* Star */}
    <Path d="M130 48 L132 54 L138 54 L133 58 L135 64 L130 60 L125 64 L127 58 L122 54 L128 54 Z"
      fill="#F59E0B" />
    {/* Plus icon */}
    <Circle cx="52" cy="52" r="12" fill="#fff" />
    <Path d="M52 46 L52 58 M46 52 L58 52" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
