import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Hls from 'hls.js';
import type { StreamCookies } from '@/types';

interface VideoPlayerProps {
  url: string;
  // Unused on web: CloudFront authorization travels as a query string on `url` instead
  // (see authQuery below), since browsers can't set cookies for a cross-origin CDN domain.
  cookies?: StreamCookies | [];
  onEnd?: () => void;
  onError?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onEnd, onError }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // `onError` is an inline function from the caller and gets a new identity on every
  // render. It's only read inside effect closures below, so keep the latest value in a
  // ref rather than putting it in the effect's dependency array — depending on it
  // directly would tear down and rebuild the whole HLS player (aborting in-flight
  // segment requests) on every unrelated re-render, which is what produced the
  // "fetch aborted" / "play not allowed" errors on seek.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // The manifest URL carries a CloudFront signed-URL query string (Policy/Signature/
    // Key-Pair-Id) scoped to the whole HLS directory via a wildcard Resource. CloudFront
    // has no notion of "cookies" here, so that same query string must be repeated on
    // every segment/key request the manifest references — the browser won't do this
    // automatically since those are separate relative-path requests.
    const authQuery = url.includes('?') ? url.slice(url.indexOf('?')) : '';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr, requestUrl) => {
          if (authQuery && !requestUrl.includes('Policy=')) {
            const separator = requestUrl.includes('?') ? '&' : '?';
            xhr.open('GET', requestUrl + separator + authQuery.slice(1), true);
          }
        },
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        // Seeking routinely aborts in-flight segment/manifest requests, which HLS.js
        // can surface as a fatal network or media error even though it's recoverable.
        // Only give up (and show the error screen) on errors these retries can't fix.
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            onErrorRef.current?.();
            break;
        }
      });
    } else {
      onErrorRef.current?.();
    }

    return () => {
      hls?.destroy();
    };
  }, [url]);

  return (
    <View style={styles.wrap}>
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', height: '100%', borderRadius: 24, backgroundColor: '#000' }}
        onEnded={onEnd}
        onError={() => onError?.()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden' },
});
