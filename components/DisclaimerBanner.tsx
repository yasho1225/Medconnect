import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';

export function DisclaimerBanner({ scheme }: { scheme: 'light' | 'dark' }) {
  const c = Colors[scheme];
  return (
    <View style={[styles.wrap, { backgroundColor: c.cardMuted, borderColor: c.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${c.tint}18` }]}>
        <Ionicons name="information-circle" size={22} color={c.tint} />
      </View>
      <Text style={[styles.text, { color: c.textSecondary, fontFamily: font.regular }]}>
        This screening is for general wellness only. Results include estimates and do not replace a
        medical diagnosis. Always consult a licensed professional for medical advice, diagnosis, or
        treatment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
