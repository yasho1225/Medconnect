import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';

type Scheme = 'light' | 'dark';

type Props = {
  title: string;
  percent: number;
  label: string;
  scheme: Scheme;
  /** Nested inside a parent card — no outer border/shadow. */
  inGroup?: boolean;
};

export function RiskBar({ title, percent, label, scheme, inGroup }: Props) {
  const c = Colors[scheme];
  const w = Math.min(100, Math.max(5, percent));

  return (
    <View
      style={[
        styles.wrap,
        inGroup ? styles.wrapInGroup : null,
        !inGroup && { backgroundColor: c.card, borderColor: c.border },
      ]}>
      <View style={styles.top}>
        <Text style={[styles.title, { color: c.text, fontFamily: font.semiBold }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.pct, { color: c.tint, fontFamily: font.extraBold }]}>{percent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.cardMuted }]}>
        <LinearGradient
          colors={[c.tint, c.tintPressed]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${w}%` }]}
        />
      </View>
      <Text style={[styles.band, { color: c.textSecondary, fontFamily: font.medium }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0c1929',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  wrapInGroup: {
    borderWidth: 0,
    marginBottom: 0,
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 0 },
      default: {},
    }),
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  title: { fontSize: 14, flex: 1, lineHeight: 20 },
  pct: { fontSize: 17, letterSpacing: -0.3 },
  track: { height: 12, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  band: { fontSize: 12, marginTop: 10, letterSpacing: 0.2, textTransform: 'uppercase' },
});
