import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { StreamCookies, VideoPlayerHandle } from '@/types';

interface VideoPlayerProps {
  url: string;
  cookies?: StreamCookies | [];
  onEnd?: () => void;
  onError?: () => void;
  onTimeUpdate?: (seconds: number) => void;
}

// CloudFront authorizes HLS playback via signed cookies rather than a signed URL
// (a single query-string signature can't cover the manifest plus every .ts segment
// it references). expo-video forwards custom headers to every request it makes for
// the asset, including segment fetches, so sending the cookie values as a literal
// `Cookie` header achieves the same effect natively without needing a real cookie jar.
const buildCookieHeader = (cookies?: StreamCookies | []): string | undefined => {
  if (!cookies || Array.isArray(cookies)) return undefined;
  return `CloudFront-Policy=${cookies['CloudFront-Policy']}; CloudFront-Signature=${cookies['CloudFront-Signature']}; CloudFront-Key-Pair-Id=${cookies['CloudFront-Key-Pair-Id']}`;
};

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ url, cookies, onEnd, onError, onTimeUpdate }, ref) => {
    const cookieHeader = buildCookieHeader(cookies);
    const player = useVideoPlayer(
      cookieHeader ? { uri: url, headers: { Cookie: cookieHeader } } : url,
      (p) => {
        p.timeUpdateEventInterval = 1;
        p.play();
      }
    );

    useImperativeHandle(
      ref,
      () => ({
        seekTo: (seconds: number) => {
          player.currentTime = seconds;
        },
      }),
      [player]
    );

    useEffect(() => {
      const endSub = player.addListener('playToEnd', () => onEnd?.());
      const statusSub = player.addListener('statusChange', ({ status }) => {
        if (status === 'error') onError?.();
      });
      const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
        onTimeUpdate?.(currentTime);
      });
      return () => {
        endSub.remove();
        statusSub.remove();
        timeSub.remove();
      };
    }, [player, onEnd, onError, onTimeUpdate]);

    return <VideoView style={styles.video} player={player} nativeControls />;
  }
);
VideoPlayer.displayName = 'VideoPlayer';

const styles = StyleSheet.create({
  video: { width: '100%', height: 220, borderRadius: 24, backgroundColor: '#000' },
});
