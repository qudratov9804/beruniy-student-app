import React from 'react';
import Svg, { Circle, Path, Rect, Text as SvgText, G } from 'react-native-svg';

export const NotFoundIllustration = ({ size = 180 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
    <Circle cx="90" cy="90" r="75" fill="#EEF2FF" />
    {/* 404 text background */}
    <Rect x="30" y="65" width="120" height="55" rx="12" fill="#fff" />
    {/* 4 */}
    <SvgText x="38" y="108" fontSize="46" fontWeight="800" fill="#6366F1">4</SvgText>
    {/* 0 (circle) */}
    <Circle cx="90" cy="90" r="22" fill="none" stroke="#6366F1" strokeWidth="8" />
    {/* 4 */}
    <SvgText x="108" y="108" fontSize="46" fontWeight="800" fill="#6366F1">4</SvgText>
    {/* Sad face on the 0 */}
    <Circle cx="84" cy="86" r="2.5" fill="#6366F1" />
    <Circle cx="96" cy="86" r="2.5" fill="#6366F1" />
    <Path d="M84 96 Q90 92 96 96" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Stars */}
    <Circle cx="48" cy="52" r="4" fill="#F59E0B" opacity="0.5" />
    <Circle cx="136" cy="48" r="5" fill="#6366F1" opacity="0.3" />
    <Circle cx="140" cy="135" r="4" fill="#F59E0B" opacity="0.4" />
    <Circle cx="44" cy="140" r="3" fill="#6366F1" opacity="0.3" />
  </Svg>
);
