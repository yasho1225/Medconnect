import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

/** Max content width on large screens — reads as a phone-width PWA, not a plastic mock device. */
const APP_MAX_W = 428;
const DESKTOP_MIN_W = 480;

/** Flat neutral chrome behind the app (no faux bezel / notch). */
const DESKTOP_CANVAS = '#c8ced9';

export function WebPhonePreview({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <View style={styles.nativeFill}>{children}</View>;
  }

  if (width < DESKTOP_MIN_W) {
    return <View style={styles.nativeFill}>{children}</View>;
  }

  const columnWidth = Math.min(APP_MAX_W, width - 32);

  return (
    <View style={[styles.webCanvas, { minHeight: '100vh' as unknown as number }]}>
      <View
        style={[
          styles.webAppColumn,
          {
            width: columnWidth,
            boxShadow: '0 2px 24px rgba(15, 23, 42, 0.06)',
          },
        ]}>
        <View style={styles.webAppColumnInner}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeFill: {
    flex: 1,
  },
  webCanvas: {
    flex: 1,
    width: '100%',
    backgroundColor: DESKTOP_CANVAS,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  webAppColumn: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webAppColumnInner: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    minWidth: 0,
  },
});
