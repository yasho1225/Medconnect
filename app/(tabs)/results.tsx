import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { MetricCard } from '@/components/MetricCard';
import { RiskBar } from '@/components/RiskBar';
import { TrendLineChart } from '@/components/TrendLineChart';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';
import { useMedConnect } from '@/context/MedConnectContext';
import {
  bpStatus,
  bmiStatus,
  cholesterolStatus,
  glucoseStatus,
  hrStatus,
  percentChange,
  spo2Status,
} from '@/lib/healthUtils';
import { approximateAgeFromDob } from '@/lib/profileUtils';
import { riskBandLabel, wellnessDiabetesRiskPercent, wellnessHypertensionRiskPercent } from '@/lib/riskEstimates';
import type { InsightRisk } from '@/lib/types';

const KIOSKS = [
  { name: 'Alpharetta Community Center', city: 'Alpharetta, GA', lat: 34.0754, lng: -84.2941 },
  { name: 'LA Fitness — Roswell', city: 'Roswell, GA', lat: 34.0232, lng: -84.3616 },
  { name: 'Georgia State — Student Center', city: 'Atlanta, GA', lat: 33.7537, lng: -84.3863 },
];

const CLINICS = [
  { name: 'Fulton County Board of Health', note: 'Public health programs', url: 'https://www.fultoncountyga.gov/inside-fulton-county/fulton-county-departments/health' },
  { name: 'Grady Health System', note: 'Safety-net care', url: 'https://www.gradyhealth.org/' },
  { name: 'HRSA health centers', note: 'Federally funded centers', url: 'https://findahealthcenter.hrsa.gov/' },
];

function insightRiskCaption(risk: InsightRisk): string {
  if (risk === 'low') return 'Lower concern';
  if (risk === 'moderate') return 'Moderate attention';
  return 'Higher concern';
}

function SectionHeader({
  eyebrow,
  title,
  hint,
  scheme,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  scheme: 'light' | 'dark';
}) {
  const c = Colors[scheme];
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionEyebrow, { color: c.tint }]}>{eyebrow}</Text>
      <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
      {hint ? (
        <Text style={[styles.sectionHint, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export default function ResultsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastScreening, profile, guestMode, insights, screenings, rateInsight } = useMedConnect();
  const [explain, setExplain] = useState<string | null>(null);
  const [range, setRange] = useState<'6m' | '12m'>('6m');
  const [insightFilter, setInsightFilter] = useState<'all' | InsightRisk>('all');
  const [locSet, setLocSet] = useState(false);

  const age = profile?.dateOfBirth ? approximateAgeFromDob(profile.dateOfBirth) : undefined;

  const sorted = useMemo(
    () => [...screenings].sort((a, b) => +new Date(a.syncedAt) - +new Date(b.syncedAt)),
    [screenings]
  );

  const filtered = useMemo(() => {
    const cutoff = new Date();
    const months = range === '6m' ? 6 : 12;
    cutoff.setMonth(cutoff.getMonth() - months);
    return sorted.filter((s) => new Date(s.syncedAt) >= cutoff);
  }, [sorted, range]);

  const annotations = useMemo(() => {
    const ann: { at: Date; label: string }[] = [];
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1];
      const cur = filtered[i];
      const pSys = percentChange(prev.bloodPressure.systolic, cur.bloodPressure.systolic);
      if (pSys != null && Math.abs(pSys) >= 10) {
        ann.push({
          at: new Date(cur.syncedAt),
          label: `Systolic BP moved about ${pSys > 0 ? '+' : ''}${pSys}% vs prior visit`,
        });
      }
    }
    return ann;
  }, [filtered]);

  const toPoints = (fn: (s: (typeof sorted)[0]) => number) =>
    filtered.map((s) => ({ x: new Date(s.syncedAt), y: fn(s) }));

  const insightRows = useMemo(() => {
    const list = [...insights].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (insightFilter === 'all') return list;
    return list.filter((i) => i.risk === insightFilter);
  }, [insightFilter, insights]);

  const openMaps = (lat: number, lng: number) => {
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  const nearestClinicSearch = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Location', 'Location is optional — enable it to search near you.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setLocSet(true);
    const { latitude, longitude } = pos.coords;
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('free walk-in clinic')}&center=${latitude},${longitude}`
    );
  };

  const heroGradient = isDark
    ? (['#0a121f', '#152a45', '#1a3555'] as const)
    : (['#0f2847', '#1a3d66', '#1e4a7a'] as const);

  if (!lastScreening) {
    return (
      <ScrollView
        style={[styles.root, { backgroundColor: c.background }]}
        contentContainerStyle={[styles.emptyPad, { paddingBottom: 120 + insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.emptyIconWrap, { backgroundColor: `${c.tint}18` }]}>
          <Ionicons name="pulse-outline" size={40} color={c.tint} />
        </View>
        <Text style={[styles.emptyTitle, { color: c.text }]}>No results yet</Text>
        <Text style={[styles.emptyBody, { color: c.textSecondary }]}>
          After your kiosk screening, scan the QR code on the Scan tab to sync your metrics here.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: c.ctaFill, opacity: pressed ? 0.92 : 1 },
          ]}
          onPress={() => router.push('/(tabs)/scan')}>
          <Text style={styles.ctaText}>Go to Scan</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </ScrollView>
    );
  }

  const s = lastScreening;
  const hRisk = wellnessHypertensionRiskPercent(s);
  const dRisk = wellnessDiabetesRiskPercent(s);
  const displayName = guestMode ? 'Guest' : profile?.name?.split(' ')[0] ?? 'You';
  const locLine = [s.location.name, s.location.city].filter(Boolean).join(' · ');

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.pad, { paddingBottom: 120 + insets.bottom }]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      <LinearGradient colors={heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIdentity}>
            <View style={[styles.heroAvatar, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
            <View style={styles.heroIdentityText}>
              <Text style={[styles.heroName, { fontFamily: font.bold }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.heroMeta, { fontFamily: font.regular }]} numberOfLines={1}>
                {new Date(s.syncedAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          {guestMode ? (
            <View style={styles.guestPill}>
              <Text style={[styles.guestPillText, { fontFamily: font.semiBold }]}>Guest</Text>
            </View>
          ) : null}
        </View>
        {locLine ? (
          <View style={styles.heroLocationRow}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={[styles.heroLocation, { fontFamily: font.regular }]} numberOfLines={2}>
              {locLine}
            </Text>
          </View>
        ) : null}
        <View style={styles.quickStats}>
          <View style={[styles.quickStat, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.quickStatLabel, { fontFamily: font.medium }]}>Blood pressure</Text>
            <Text style={[styles.quickStatValue, { fontFamily: font.extraBold }]}>
              {s.bloodPressure.systolic}/{s.bloodPressure.diastolic}
            </Text>
            <Text style={[styles.quickStatUnit, { fontFamily: font.regular }]}>mmHg</Text>
          </View>
          <View style={[styles.quickStat, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.quickStatLabel, { fontFamily: font.medium }]}>Heart rate</Text>
            <Text style={[styles.quickStatValue, { fontFamily: font.extraBold }]}>{s.heartRateBpm}</Text>
            <Text style={[styles.quickStatUnit, { fontFamily: font.regular }]}>BPM</Text>
          </View>
          <View style={[styles.quickStat, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.quickStatLabel, { fontFamily: font.medium }]}>BMI</Text>
            <Text style={[styles.quickStatValue, { fontFamily: font.extraBold }]}>{s.bmi.toFixed(1)}</Text>
            <Text style={[styles.quickStatUnit, { fontFamily: font.regular }]}>index</Text>
          </View>
        </View>
      </LinearGradient>

      <DisclaimerBanner scheme={scheme} />

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: c.ctaFill, opacity: pressed ? 0.92 : 1 },
          ]}
          onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Full report</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.outlineBtn,
            { borderColor: c.tint, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="share-outline" size={20} color={c.tint} />
          <Text style={[styles.outlineBtnText, { color: c.tint }]}>Share</Text>
        </Pressable>
      </View>

      <SectionHeader
        scheme={scheme}
        eyebrow="This visit"
        title="All readings"
        hint="Kiosk snapshot — your clinician interprets results."
      />

      <MetricCard
        title="Blood pressure"
        value={`${s.bloodPressure.systolic}/${s.bloodPressure.diastolic} mmHg`}
        subtitle="Typical adult target is often under 120/80 — your clinician personalizes this."
        status={bpStatus(s.bloodPressure.systolic, s.bloodPressure.diastolic)}
        icon="pulse-outline"
        scheme={scheme}
        accessibilityLabel="Blood pressure"
        onExplain={() =>
          setExplain(
            'Blood pressure shows how hard blood pushes on artery walls. One kiosk reading is a snapshot, not a diagnosis.'
          )
        }
      />
      <MetricCard
        title="Heart rate"
        value={`${s.heartRateBpm} BPM`}
        subtitle="Many adults fall roughly between 60–100 BPM at rest."
        status={hrStatus(s.heartRateBpm, age)}
        icon="heart-outline"
        scheme={scheme}
        accessibilityLabel="Heart rate"
        onExplain={() => setExplain('Heart rate changes with stress, caffeine, and movement during screening.')}
      />
      <MetricCard
        title="BMI"
        value={s.bmi.toFixed(1)}
        subtitle="Height–weight ratio — useful for trends, not a full fitness picture."
        status={bmiStatus(s.bmi)}
        icon="body-outline"
        scheme={scheme}
        accessibilityLabel="BMI"
        onExplain={() => setExplain('BMI does not measure body fat directly.')}
      />
      <MetricCard
        title="Oxygen (SpO2)"
        value={`${s.spo2}%`}
        subtitle="Many healthy readings are 95% or higher at rest."
        status={spo2Status(s.spo2)}
        icon="water-outline"
        scheme={scheme}
        accessibilityLabel="SpO2"
        onExplain={() => setExplain('Finger sensors can be affected by cold hands or movement.')}
      />
      <MetricCard
        title="Irregular heartbeat"
        value={s.irregularHeartbeat ? 'Possible signal' : 'Not detected'}
        subtitle={s.irregularHeartbeat ? 'Repeat when calm; see a clinician if you have symptoms.' : 'No flag this session.'}
        status={s.irregularHeartbeat ? 'attention' : 'normal'}
        icon="heart-circle-outline"
        scheme={scheme}
        accessibilityLabel="Irregular heartbeat"
        onExplain={() => setExplain('Only a clinician can diagnose rhythm issues with proper tests.')}
      />
      <MetricCard
        title="Est. blood glucose"
        value={`${s.estimatedGlucoseMgDl} mg/dL (estimate)`}
        subtitle="Not a fasting lab."
        status={glucoseStatus(s.estimatedGlucoseMgDl)}
        icon="water-outline"
        scheme={scheme}
        accessibilityLabel="Estimated glucose"
        onExplain={() => setExplain('Kiosk estimates are not diabetes diagnoses.')}
      />
      <MetricCard
        title="Est. cholesterol"
        value={`${s.estimatedCholesterolMgDl} mg/dL (estimate)`}
        subtitle="Not a full lipid panel."
        status={cholesterolStatus(s.estimatedCholesterolMgDl)}
        icon="analytics-outline"
        scheme={scheme}
        accessibilityLabel="Estimated cholesterol"
        onExplain={() => setExplain('Lipid panels include HDL, LDL, and triglycerides.')}
      />
      <MetricCard
        title="Depression (demo)"
        value="You do not have depression"
        subtitle="Example line for this demo only. If you need support, reach a clinician or a crisis helpline."
        status="normal"
        icon="happy-outline"
        scheme={scheme}
        accessibilityLabel="Depression demo note"
        onExplain={() =>
          setExplain(
            'Only a qualified clinician can assess depression. This line is sample copy for the demo build.'
          )
        }
      />

      <SectionHeader
        scheme={scheme}
        eyebrow="Wellness estimates"
        title="Risk patterns"
        hint="AI-guided from screening data — not a diagnosis."
      />

      <View
        style={[
          styles.riskGroup,
          { backgroundColor: c.card, borderColor: c.border },
          Platform.select({
            ios: {
              shadowColor: '#0c1929',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.07,
              shadowRadius: 16,
            },
            android: { elevation: 4 },
            default: {},
          }),
        ]}>
        <RiskBar
          title="Hypertension-oriented pattern"
          percent={hRisk}
          label={riskBandLabel(hRisk)}
          scheme={scheme}
          inGroup
        />
        <View style={[styles.riskDivider, { backgroundColor: c.border }]} />
        <RiskBar
          title="Diabetes-oriented pattern"
          percent={dRisk}
          label={riskBandLabel(dRisk)}
          scheme={scheme}
          inGroup
        />
      </View>

      <SectionHeader
        scheme={scheme}
        eyebrow="Guidance"
        title="Insights"
        hint="Plain-language tips from your screening. Not a diagnosis."
      />

      <View style={[styles.segHost, { backgroundColor: c.cardMuted }]}>
        {(['all', 'low', 'moderate', 'high'] as const).map((k) => {
          const active = insightFilter === k;
          const label =
            k === 'all' ? 'All' : k === 'low' ? 'Low' : k === 'moderate' ? 'Medium' : 'High';
          return (
            <Pressable
              key={k}
              onPress={() => setInsightFilter(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.segOpt,
                active && { backgroundColor: c.card },
                active &&
                  Platform.select({
                    ios: {
                      shadowColor: '#0c1929',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 6,
                    },
                    android: { elevation: 2 },
                    default: {
                      boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)',
                    },
                  }),
              ]}>
              <Text
                style={[
                  styles.segItem,
                  {
                    color: active ? c.tint : c.textMuted,
                    fontFamily: active ? font.bold : font.medium,
                  },
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {insightRows.length === 0 ? (
        <View style={[styles.insightEmpty, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={c.textMuted} />
          <Text style={[styles.insightEmptyTitle, { color: c.text, fontFamily: font.semiBold }]}>
            No tips here
          </Text>
          <Text style={[styles.insightEmptyBody, { color: c.textSecondary, fontFamily: font.regular }]}>
            Try “All” or sync another visit for new ideas.
          </Text>
        </View>
      ) : (
        insightRows.slice(0, 12).map((ins) => (
          <View
            key={ins.id}
            style={[
              styles.insightCard,
              { backgroundColor: c.card, borderColor: c.border },
              Platform.select({
                ios: {
                  shadowColor: '#0c1929',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                },
                android: { elevation: 2 },
                default: {},
              }),
            ]}>
            <Text style={[styles.insightCardTitle, { color: c.text, fontFamily: font.semiBold }]}>
              {ins.title}
            </Text>
            <Text style={[styles.insightRiskCaption, { color: c.textMuted, fontFamily: font.regular }]}>
              {insightRiskCaption(ins.risk)}
            </Text>
            <Text style={[styles.insightCardBody, { color: c.textSecondary, fontFamily: font.regular }]}>
              {ins.body}
            </Text>
            <View style={[styles.insightNextBlock, { borderTopColor: c.border }]}>
              <Text style={[styles.insightNextLabel, { color: c.textMuted, fontFamily: font.semiBold }]}>
                Next step
              </Text>
              <Text style={[styles.insightNextCopy, { color: c.text, fontFamily: font.regular }]}>
                {ins.whatNext}
              </Text>
            </View>
            <View style={styles.insightCardActions}>
              <Pressable
                onPress={() => rateInsight(ins.id, 'up')}
                hitSlop={12}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                accessibilityLabel="Helpful">
                <Ionicons name="thumbs-up-outline" size={21} color={c.tint} />
              </Pressable>
              <Pressable
                onPress={() => rateInsight(ins.id, 'down')}
                hitSlop={12}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                accessibilityLabel="Not helpful">
                <Ionicons name="thumbs-down-outline" size={21} color={c.textMuted} />
              </Pressable>
            </View>
          </View>
        ))
      )}

      <SectionHeader scheme={scheme} eyebrow="History" title="Trends" hint={`Based on visits in the last ${range === '6m' ? '6' : '12'} months.`} />

      <View style={[styles.segHost, { backgroundColor: c.cardMuted }]}>
        {(['6m', '12m'] as const).map((k) => {
          const active = range === k;
          return (
            <Pressable
              key={k}
              onPress={() => setRange(k)}
              accessibilityRole="button"
              style={[
                styles.segOpt,
                active && { backgroundColor: c.card },
                active &&
                  Platform.select({
                    ios: {
                      shadowColor: '#0c1929',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 6,
                    },
                    android: { elevation: 2 },
                    default: {
                      boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)',
                    },
                  }),
              ]}>
              <Text
                style={[
                  styles.segItem,
                  {
                    color: active ? c.tint : c.textMuted,
                    fontFamily: active ? font.bold : font.medium,
                  },
                ]}>
                {k === '6m' ? '6 mo' : '12 mo'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TrendLineChart
        title="Systolic blood pressure"
        unit="mmHg"
        scheme={scheme}
        points={toPoints((x) => x.bloodPressure.systolic)}
        annotations={annotations}
      />
      <TrendLineChart title="Heart rate" unit="BPM" scheme={scheme} points={toPoints((x) => x.heartRateBpm)} />
      <TrendLineChart title="Est. glucose" unit="mg/dL" scheme={scheme} points={toPoints((x) => x.estimatedGlucoseMgDl)} />

      <SectionHeader
        scheme={scheme}
        eyebrow="Care"
        title="Find care"
        hint="Metro Atlanta pilot. Links open in your browser."
      />

      <Text style={[styles.subsectionLabel, { color: c.textSecondary, fontFamily: font.semiBold }]}>
        Screening kiosks
      </Text>
      {KIOSKS.map((k) => (
        <Pressable
          key={k.name}
          onPress={() => openMaps(k.lat, k.lng)}
          style={({ pressed }) => [
            styles.findCard,
            { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
          ]}>
          <View style={[styles.findIcon, { backgroundColor: `${c.tint}14` }]}>
            <Ionicons name="navigate" size={20} color={c.tint} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.findName, { color: c.text }]}>{k.name}</Text>
            <Text style={[styles.findCity, { color: c.textSecondary }]}>{k.city}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
        </Pressable>
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.locBtn,
          { backgroundColor: c.tint, opacity: pressed ? 0.92 : 1 },
        ]}
        onPress={() => void nearestClinicSearch()}>
        <Ionicons name="location-outline" size={20} color="#fff" />
        <Text style={styles.locBtnText}>{locSet ? 'Search clinics again' : 'Nearby clinics (location)'}</Text>
      </Pressable>

      <Text style={[styles.subsectionLabel, { color: c.textSecondary, fontFamily: font.semiBold, marginTop: 8 }]}>
        Resources
      </Text>
      {CLINICS.map((x) => (
        <Pressable
          key={x.name}
          onPress={() => void Linking.openURL(x.url)}
          style={({ pressed }) => [
            styles.findCard,
            { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
          ]}>
          <View style={[styles.findIcon, { backgroundColor: `${c.tint}14` }]}>
            <Ionicons name="open-outline" size={20} color={c.tint} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.findName, { color: c.text }]}>{x.name}</Text>
            <Text style={[styles.findCity, { color: c.textSecondary }]}>{x.note}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
        </Pressable>
      ))}

      <Link href={{ pathname: '/screening/[id]', params: { id: s.id } }} asChild>
        <Pressable style={StyleSheet.flatten([styles.secondaryBtn, { borderColor: c.border }])}>
          <Ionicons name="list-outline" size={20} color={c.tint} />
          <Text style={[styles.secondaryBtnText, { color: c.tint }]}>Screening details</Text>
        </Pressable>
      </Link>

      <Text style={[styles.footerNote, { color: c.textMuted }]}>
        {screenings.length} screening{screenings.length === 1 ? '' : 's'} on this device (demo).
      </Text>

      {explain ? (
        <View style={[styles.modal, { backgroundColor: 'rgba(12, 22, 41, 0.5)' }]}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text, fontFamily: font.bold }]}>About this metric</Text>
              <Pressable onPress={() => setExplain(null)} hitSlop={12} accessibilityLabel="Close">
                <Ionicons name="close-circle" size={28} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.modalText, { color: c.text }]}>{explain}</Text>
            <Pressable
              style={[styles.cta, { backgroundColor: c.ctaFill, marginTop: 20 }]}
              onPress={() => setExplain(null)}>
              <Text style={styles.ctaText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 },
  emptyPad: { flexGrow: 1, padding: 28, justifyContent: 'center', alignItems: 'center', paddingBottom: 120 },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionHeader: { marginTop: 24, marginBottom: 14 },
  sectionEyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: font.bold,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: font.extraBold,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  sectionHint: { fontSize: 13, lineHeight: 19, marginTop: 6, fontFamily: font.regular },
  hero: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIdentityText: { flex: 1, minWidth: 0 },
  heroName: { color: '#fff', fontSize: 20, letterSpacing: -0.3 },
  heroMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  guestPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  guestPillText: { color: '#fff', fontSize: 12 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  heroLocation: { color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 20, flex: 1 },
  quickStats: { flexDirection: 'row', gap: 10 },
  quickStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minWidth: 0,
  },
  quickStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  quickStatValue: { color: '#fff', fontSize: 20, letterSpacing: -0.5, marginTop: 6 },
  quickStatUnit: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontFamily: font.bold },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  outlineBtnText: { fontSize: 15, fontFamily: font.bold },
  riskGroup: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  riskDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 4 },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  insightCardTitle: { fontSize: 17, lineHeight: 23, letterSpacing: -0.3, marginBottom: 4 },
  insightRiskCaption: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  insightCardBody: { fontSize: 15, lineHeight: 22 },
  insightNextBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  insightNextLabel: { fontSize: 12, marginBottom: 6, letterSpacing: 0.2 },
  insightNextCopy: { fontSize: 15, lineHeight: 22 },
  insightCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 14,
  },
  insightEmpty: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  insightEmptyTitle: { marginTop: 14, fontSize: 17, textAlign: 'center' },
  insightEmptyBody: { marginTop: 8, textAlign: 'center', fontSize: 15, lineHeight: 22, maxWidth: 280 },
  segHost: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  segOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItem: { fontSize: 14 },
  subsectionLabel: { fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  findCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  findIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findName: { fontSize: 15, fontFamily: font.semiBold },
  findCity: { fontSize: 13, marginTop: 2, fontFamily: font.regular },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 12,
  },
  locBtnText: { color: '#fff', fontFamily: font.bold, fontSize: 15 },
  secondaryBtn: {
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { fontFamily: font.bold, fontSize: 15 },
  footerNote: { fontSize: 12, textAlign: 'center', marginTop: 20, fontFamily: font.regular },
  emptyTitle: { fontSize: 24, marginBottom: 8, fontFamily: font.extraBold, letterSpacing: -0.5, textAlign: 'center' },
  emptyBody: { fontSize: 15, lineHeight: 23, marginBottom: 24, fontFamily: font.regular, textAlign: 'center', maxWidth: 320 },
  cta: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { color: '#fff', fontSize: 16, fontFamily: font.bold },
  modal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { borderRadius: 22, padding: 22 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, flex: 1 },
  modalText: { fontSize: 16, lineHeight: 24, fontFamily: font.regular },
});
