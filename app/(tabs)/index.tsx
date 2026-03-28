import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';
import { useMedConnect } from '@/context/MedConnectContext';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastScreening, screenings } = useMedConnect();
  const hasData = screenings.length > 0;

  const gradientHero = isDark
    ? (['#060d18', '#0f1f35', '#152a45'] as const)
    : (['#0c1f3d', '#15355c', '#1a4575'] as const);

  const blobA = isDark ? 'rgba(80, 140, 255, 0.07)' : 'rgba(120, 190, 255, 0.11)';
  const blobB = isDark ? 'rgba(59, 126, 237, 0.09)' : 'rgba(255, 255, 255, 0.07)';

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 108 + insets.bottom }]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      bounces>
      <LinearGradient
        colors={gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroGradient, { paddingTop: 16 + insets.top }]}>
        <View style={[styles.blob, styles.blob1, { backgroundColor: blobA }]} />
        <View style={[styles.blob, styles.blob2, { backgroundColor: blobB }]} />

        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <LinearGradient
              colors={['#ffffff', '#e8f0ff']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="medical" size={28} color={c.tint} style={styles.logoIcon} />
          </View>
          <View>
            <Text style={[styles.logoWord, { fontFamily: font.extraBold }]}>MedConnect</Text>
            <Text style={[styles.logoSub, { fontFamily: font.medium }]}>Health within reach</Text>
          </View>
        </View>

        <Text style={[styles.welcome, { fontFamily: font.extraBold, color: '#fff' }]}>
          Welcome back
        </Text>
        <Text style={[styles.tagline, { fontFamily: font.regular, color: 'rgba(255,255,255,0.82)' }]}>
          AI-guided preventive screening that fits your day — gym, campus, work, or community.
        </Text>

        <LinearGradient
          colors={[c.tint, c.tintPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}>
          <Pressable
            style={({ pressed }) => [styles.startBtnInner, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/(tabs)/scan')}
            accessibilityRole="button"
            accessibilityLabel="Start screening">
            <Text style={[styles.startBtnText, { fontFamily: font.bold }]}>Start screening</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </LinearGradient>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryTap,
            !hasData ? { opacity: 0.5 } : { opacity: pressed ? 0.75 : 1 },
          ]}
          disabled={!hasData}
          onPress={() => router.push('/(tabs)/results')}
          accessibilityRole="button">
          <Text style={[styles.secondaryTapText, { fontFamily: font.semiBold }]}>
            {hasData ? 'View health summary' : 'Sync a kiosk to see results'}
          </Text>
          {hasData ? <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.9)" /> : null}
        </Pressable>
      </LinearGradient>

      <View style={[styles.floatCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.floatIcon, { backgroundColor: isDark ? c.cardMuted : '#eef4ff' }]}>
          <Ionicons name="pulse" size={22} color={c.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.floatTitle, { fontFamily: font.bold, color: c.text }]}>Latest activity</Text>
          <Text style={[styles.floatBody, { fontFamily: font.regular, color: c.textSecondary }]}>
            {lastScreening
              ? `${new Date(lastScreening.syncedAt).toLocaleDateString()} · ${lastScreening.location.name}`
              : 'Complete a kiosk visit, then use the Scan tab to link your session in seconds.'}
          </Text>
        </View>
      </View>

      <View style={[styles.featureRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.featureItem}>
          <View style={[styles.featureDot, { backgroundColor: `${c.tint}22` }]}>
            <Ionicons name="flash-outline" size={20} color={c.tint} />
          </View>
          <Text style={[styles.featureLabel, { fontFamily: font.semiBold, color: c.text }]}>Under 5 min</Text>
          <Text style={[styles.featureHint, { fontFamily: font.regular, color: c.textMuted }]}>
            Quick kiosk screening
          </Text>
        </View>
        <View style={[styles.featureDivider, { backgroundColor: c.border }]} />
        <View style={styles.featureItem}>
          <View style={[styles.featureDot, { backgroundColor: `${c.tint}22` }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={c.tint} />
          </View>
          <Text style={[styles.featureLabel, { fontFamily: font.semiBold, color: c.text }]}>Your data</Text>
          <Text style={[styles.featureHint, { fontFamily: font.regular, color: c.textMuted }]}>
            Delete anytime in Profile
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  heroGradient: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 220,
    height: 220,
    top: -60,
    right: -80,
  },
  blob2: {
    width: 160,
    height: 160,
    bottom: 40,
    left: -50,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    zIndex: 1,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  logoIcon: { zIndex: 1 },
  logoWord: {
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  welcome: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    zIndex: 1,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 340,
    zIndex: 1,
  },
  ctaGradient: {
    marginTop: 28,
    borderRadius: 18,
    padding: 2,
    zIndex: 1,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  startBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  secondaryTap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 18,
    paddingVertical: 10,
    zIndex: 1,
  },
  secondaryTapText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
  },
  floatCard: {
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 2,
    shadowColor: '#0c1929',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  floatIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  floatBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  featureRow: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  featureDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  featureHint: {
    fontSize: 12,
    textAlign: 'center',
  },
});
