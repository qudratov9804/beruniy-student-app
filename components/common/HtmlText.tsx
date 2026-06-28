import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

interface HtmlTextProps {
  html: string;
  baseFontSize?: number;
  color?: string;
}

const tagsStyles: Record<string, object> = {
  p: { marginVertical: 4 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  ul: { paddingLeft: 16 },
  li: { marginVertical: 2 },
};

export const HtmlText: React.FC<HtmlTextProps> = ({
  html,
  baseFontSize = 14,
  color = '#475569',
}) => {
  const { width } = useWindowDimensions();

  const baseStyle = {
    fontSize: baseFontSize,
    color,
    lineHeight: baseFontSize * 1.6,
    fontFamily: Platform.OS === 'web' ? 'Inter-Regular, sans-serif' : 'Inter-Regular',
  };

  return (
    <RenderHtml
      contentWidth={width - 40}
      source={{ html }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      enableExperimentalMarginCollapsing
    />
  );
};
