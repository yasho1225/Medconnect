import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';
import type { MetricStatus } from '@/lib/healthUtils';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/healthUtils';

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  status: MetricStatus;
  icon: keyof typeof Ionicons.glyphMap;
  scheme: 'light' | 'dark';
  onExplain?: () => void;
  accessibilityLabel: string;
};

export function MetricCard({
  title,
  value,
  subtitle,
  status,
  icon,
  scheme,
  onExplain,
  accessibilityLabel,
}: Props) {
  const c = Colors[scheme];
  const color = STATUS_COLOR[status];
  const label = STATUS_LABEL[status];
  const tintBg = `${color}1a`;

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      accessibilityRole="none"
      accessibilityLabel={`${accessibilityLabel}. ${value}. ${label}.`}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
          <Ionicons name={icon} size={23} color={color} accessibilityElementsHidden />
        </View>
        <View style={styles.main}>
          <Text style={[styles.title, { color: c.textMuted, fontFamily: font.semiBold }]}>{title}</Text>
          <Text style={[styles.value, { color: c.text, fontFamily: font.extraBold }]}>{value}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: color }]} accessibilityLabel="" />
            <Text style={[styles.statusText, { color: c.textSecondary, fontFamily: font.medium }]}>
              {label}
            </Text>
          </View>
          {subtitle ? (
            <Text style={[styles.sub, { color: c.textSecondary, fontFamily: font.regular }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {onExplain ? (
        <Pressable
          onPress={onExplain}
          style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.65 }]}
          accessibilityRole="button"
          accessibilityLabel={`What does ${title} mean?`}>
          <Text style={[styles.link, { color: c.tint, fontFamily: font.semiBold }]}>Learn more</Text>
          <Ionicons name="chevron-forward" size={17} color={c.tint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0c1929',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  row: { flexDirection: 'row', gap: 14 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, minWidth: 0 },
  title: { fontSize: 12, marginBottom: 4, letterSpacing: 0.4, textTransform: 'uppercase' },
  value: { fontSize: 24, letterSpacing: -0.5, lineHeight: 30 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, flex: 1, lineHeight: 18 },
  sub: { fontSize: 13, marginTop: 8, lineHeight: 19 },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
    gap: 4,
  },
  link: { fontSize: 14 },
});
