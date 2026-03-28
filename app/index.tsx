import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useMedConnect } from '@/context/MedConnectContext';

export default function Index() {
  const { ready, profile, guestMode } = useMedConnect();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B2F52" />
      </View>
    );
  }

  if (!profile && !guestMode) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3EEF8' },
});
