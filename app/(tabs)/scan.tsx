import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';
import { useMedConnect } from '@/context/MedConnectContext';

const GRADIENT = ['#0a1a32', '#0f2847', '#15355c'] as const;

export default function ScanTabScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { linkKioskSession } = useMedConnect();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const scannedRef = useRef(false);

  const goResults = () => router.push('/(tabs)/results');

  const simulateSync = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await linkKioskSession();
      Alert.alert('Linked', 'Open your health summary to review metrics.', [
        { text: 'View results', onPress: goResults },
        { text: 'Stay here', style: 'cancel' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const inner = (
    <>
      <Text style={[styles.title, { fontFamily: font.extraBold }]}>Scan kiosk QR</Text>
      <Text style={[styles.body, { fontFamily: font.regular }]}>
        Point your camera at the code on the kiosk. Any successful scan in this demo adds a sample
        session to your results.
      </Text>
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (busy || scannedRef.current) return;
            if (!data) return;
            scannedRef.current = true;
            void (async () => {
              setBusy(true);
              try {
                await linkKioskSession();
                Alert.alert('Linked', 'Screening received.', [
                  { text: 'View results', onPress: goResults },
                  { text: 'OK', style: 'cancel' },
                ]);
              } finally {
                setBusy(false);
              }
            })();
          }}
        />
      </View>
      <Pressable style={styles.secondary} disabled={busy} onPress={() => void simulateSync()}>
        <Text style={[styles.secondaryText, { fontFamily: font.semiBold }]}>
          {busy ? 'Syncing…' : 'Demo: sync sample session'}
        </Text>
      </Pressable>
    </>
  );

  if (!permission) {
    return (
      <LinearGradient colors={GRADIENT} style={styles.gradient}>
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={[styles.muted, { fontFamily: font.medium }]}>Checking camera permission…</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={GRADIENT} style={styles.gradient}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Text style={[styles.title, { fontFamily: font.extraBold }]}>Camera access</Text>
          <Text style={[styles.body, { fontFamily: font.regular }]}>
            We use your camera only to scan the QR code on the kiosk after your screening.
          </Text>
          <Pressable style={styles.primary} onPress={requestPermission}>
            <Text style={[styles.primaryText, { fontFamily: font.bold }]}>Allow camera</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => void simulateSync()} disabled={busy}>
            <Text style={[styles.secondaryText, { fontFamily: font.semiBold }]}>
              Demo: sync without scanning
            </Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENT} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {inner}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, padding: 22 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, color: '#fff', marginBottom: 10, letterSpacing: -0.5 },
  body: { fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 24, marginBottom: 18 },
  muted: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  cameraBox: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
    minHeight: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  primary: {
    backgroundColor: '#fff',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryText: { color: '#0f2847', fontSize: 16 },
  secondary: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { color: 'rgba(255,255,255,0.92)', fontSize: 15 },
});
