import React, { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

type Weight = 'regular' | 'medium' | 'bold';

interface HtmlTextProps {
  html: string;
  baseFontSize?: number;
  color?: string;
  weight?: Weight;
}

const tagsStyles: Record<string, object> = {
  p: { marginVertical: 4 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  ul: { paddingLeft: 16 },
  li: { marginVertical: 2 },
};

const FONT_FILES: Record<Weight, string> = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
};

export const HtmlText: React.FC<HtmlTextProps> = ({
  html,
  baseFontSize = 14,
  color = '#475569',
  weight = 'regular',
}) => {
  const { width } = useWindowDimensions();

  // react-native-render-html rebuilds its whole rendering engine whenever `source` or
  // `baseStyle` change identity — without memoizing these, every parent re-render (even
  // unrelated state changes) recreates them and triggers the "costly tree rerenders"
  // warning from TRenderEngineProvider.
  const source = useMemo(() => ({ html }), [html]);
  const baseStyle = useMemo(
    () => ({
      fontSize: baseFontSize,
      color,
      lineHeight: baseFontSize * 1.6,
      fontFamily: Platform.OS === 'web'
        ? `${FONT_FILES[weight]}, sans-serif`
        : FONT_FILES[weight],
    }),
    [baseFontSize, color, weight]
  );

  return (
    <RenderHtml
      contentWidth={width - 40}
      source={source}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      enableExperimentalMarginCollapsing
    />
  );
};
