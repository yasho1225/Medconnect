import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { MetricCard } from '@/components/MetricCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useMedConnect } from '@/context/MedConnectContext';
import {
  bpStatus,
  bmiStatus,
  cholesterolStatus,
  glucoseStatus,
  hrStatus,
  spo2Status,
} from '@/lib/healthUtils';
import { approximateAgeFromDob } from '@/lib/profileUtils';

export default function ScreeningDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { screenings, profile } = useMedConnect();
  const s = screenings.find((x) => x.id === id);
  const age = profile?.dateOfBirth ? approximateAgeFromDob(profile.dateOfBirth) : undefined;

  if (!s) {
    return (
      <View style={[styles.miss, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text }}>Screening not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: c.tint, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: c.background }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.h1, { color: c.text }]}>Screening detail</Text>
      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {new Date(s.syncedAt).toLocaleString()}
      </Text>
      <Text style={[styles.meta, { color: c.textMuted, marginBottom: 12 }]}>{s.location.name}</Text>
      <DisclaimerBanner scheme={scheme} />

      <MetricCard
        title="Blood pressure"
        value={`${s.bloodPressure.systolic}/${s.bloodPressure.diastolic} mmHg`}
        status={bpStatus(s.bloodPressure.systolic, s.bloodPressure.diastolic)}
        icon="pulse-outline"
        scheme={scheme}
        accessibilityLabel="Blood pressure"
      />
      <MetricCard
        title="Heart rate"
        value={`${s.heartRateBpm} BPM`}
        status={hrStatus(s.heartRateBpm, age)}
        icon="heart-outline"
        scheme={scheme}
        accessibilityLabel="Heart rate"
      />
      <MetricCard
        title="BMI"
        value={s.bmi.toFixed(1)}
        status={bmiStatus(s.bmi)}
        icon="body-outline"
        scheme={scheme}
        accessibilityLabel="BMI"
      />
      <MetricCard
        title="SpO2"
        value={`${s.spo2}%`}
        status={spo2Status(s.spo2)}
        icon="cloud-outline"
        scheme={scheme}
        accessibilityLabel="SpO2"
      />
      <MetricCard
        title="Irregular heartbeat"
        value={s.irregularHeartbeat ? 'Possible signal' : 'Not detected'}
        status={s.irregularHeartbeat ? 'attention' : 'normal'}
        icon="heart-circle-outline"
        scheme={scheme}
        accessibilityLabel="Irregular heartbeat"
      />
      <MetricCard
        title="Est. glucose"
        value={`${s.estimatedGlucoseMgDl} mg/dL`}
        status={glucoseStatus(s.estimatedGlucoseMgDl)}
        icon="water-outline"
        scheme={scheme}
        accessibilityLabel="Estimated glucose"
      />
      <MetricCard
        title="Est. cholesterol"
        value={`${s.estimatedCholesterolMgDl} mg/dL`}
        status={cholesterolStatus(s.estimatedCholesterolMgDl)}
        icon="analytics-outline"
        scheme={scheme}
        accessibilityLabel="Estimated cholesterol"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 20, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: '800' },
  meta: { fontSize: 14, marginTop: 4 },
  miss: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
