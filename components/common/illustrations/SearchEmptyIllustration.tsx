import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

export const SearchEmptyIllustration = ({ size = 180 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
    <Circle cx="90" cy="90" r="75" fill="#F0FDF4" />
    {/* Magnifying glass */}
    <Circle cx="82" cy="82" r="32" fill="#fff" stroke="#6366F1" strokeWidth="6" />
    <Line x1="105" y1="105" x2="128" y2="128" stroke="#6366F1" strokeWidth="7" strokeLinecap="round" />
    {/* Question mark inside */}
    <Path d="M82 72 C82 72 88 72 88 78 C88 84 82 84 82 88" stroke="#6366F1" strokeWidth="4"
      strokeLinecap="round" fill="none" />
    <Circle cx="82" cy="93" r="2.5" fill="#6366F1" />
    {/* Decorative dots */}
    <Circle cx="46" cy="50" r="4" fill="#6366F1" opacity="0.3" />
    <Circle cx="136" cy="60" r="6" fill="#F59E0B" opacity="0.4" />
    <Circle cx="130" cy="130" r="4" fill="#6366F1" opacity="0.2" />
    <Circle cx="50" cy="130" r="5" fill="#F59E0B" opacity="0.3" />
  </Svg>
);
