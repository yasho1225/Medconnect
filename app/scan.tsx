import { Redirect } from 'expo-router';

/** Deep links / old routes → primary Scan tab (mobile-first nav). */
export default function ScanRedirect() {
  return <Redirect href="/(tabs)/scan" />;
}
