import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';
import { useMedConnect } from '@/context/MedConnectContext';
import type { BiologicalSex } from '@/lib/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const { register, enterGuest } = useMedConnect();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<BiologicalSex>('unspecified');
  const [insurance, setInsurance] = useState('');
  const [accepted, setAccepted] = useState(false);

  const gradientHero = isDark
    ? (['#060d18', '#0f1f35', '#152a45'] as const)
    : (['#0c1f3d', '#15355c', '#1a4575'] as const);

  const blobA = isDark ? 'rgba(80, 140, 255, 0.07)' : 'rgba(120, 190, 255, 0.11)';

  const onSso = (provider: string) => {
    Alert.alert(
      'Demo build',
      `${provider} sign-in is wired in production. For this MVP demo, use Create account or Guest.`
    );
  };

  const onSubmit = async () => {
    if (!accepted) {
      Alert.alert('Privacy', 'Please acknowledge the privacy notice to continue.');
      return;
    }
    if (!name.trim() || !email.trim() || !dob.trim()) {
      Alert.alert('Missing info', 'Name, email, and date of birth are required.');
      return;
    }
    await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      dateOfBirth: dob.trim(),
      sex,
      insuranceStatus: insurance.trim() || undefined,
    });
    router.replace('/(tabs)');
  };

  const onGuest = async () => {
    await enterGuest();
    router.replace('/(tabs)');
  };

  const inputSurface = isDark ? c.cardMuted : '#f6f8fd';
  const placeholderColor = isDark ? '#7d8fa8' : '#94a3b8';

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
          bounces>
          <LinearGradient
            colors={gradientHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: 20 + insets.top, paddingBottom: 32 }]}>
            <View style={[styles.blob, { backgroundColor: blobA }]} />
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <LinearGradient
                  colors={['#ffffff', '#e8f0ff']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="medical" size={26} color={c.tint} style={styles.logoIcon} />
              </View>
              <View>
                <Text style={[styles.logoWord, { fontFamily: font.extraBold }]}>MedConnect</Text>
                <Text style={[styles.logoSub, { fontFamily: font.medium }]}>Health within reach</Text>
              </View>
            </View>
            <Text style={[styles.heroTitle, { fontFamily: font.extraBold }]}>Create your account</Text>
            <Text style={[styles.heroBody, { fontFamily: font.regular }]}>
              Link kiosk screenings in seconds. No insurance required to register. You control your data
              and can delete it anytime in Settings.
            </Text>
          </LinearGradient>

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                marginTop: -20,
                shadowColor: isDark ? '#000' : '#0c1929',
              },
            ]}>
            <Text style={[styles.sheetLead, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Sign in faster
            </Text>
            <View style={styles.ssoRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.ssoBtn,
                  { borderColor: c.border, backgroundColor: isDark ? c.cardMuted : '#fff' },
                  pressed && styles.pressed,
                ]}
                onPress={() => onSso('Google')}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google">
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={[styles.ssoText, { fontFamily: font.semiBold, color: c.text }]}>Google</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.ssoBtn,
                  { borderColor: c.border, backgroundColor: isDark ? c.cardMuted : '#fff' },
                  pressed && styles.pressed,
                ]}
                onPress={() => onSso('Apple')}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple">
                <Ionicons name="logo-apple" size={22} color={isDark ? '#e2e8f0' : '#000'} />
                <Text style={[styles.ssoText, { fontFamily: font.semiBold, color: c.text }]}>Apple</Text>
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
              <Text style={[styles.dividerText, { fontFamily: font.medium, color: c.textMuted }]}>
                or with email
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            </View>

            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Full name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Alex Johnson"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  fontFamily: font.regular,
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: inputSurface,
                },
              ]}
              autoCapitalize="words"
              accessibilityLabel="Full name"
            />
            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  fontFamily: font.regular,
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: inputSurface,
                },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email"
            />
            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Phone (optional)
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(404) 555-0100"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  fontFamily: font.regular,
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: inputSurface,
                },
              ]}
              keyboardType="phone-pad"
              accessibilityLabel="Phone optional"
            />
            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Date of birth (YYYY-MM-DD)
            </Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="2000-04-15"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  fontFamily: font.regular,
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: inputSurface,
                },
              ]}
              accessibilityLabel="Date of birth"
            />
            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Biological sex (for range context)
            </Text>
            <View style={styles.chips}>
              {(['female', 'male', 'unspecified'] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSex(s)}
                  style={[
                    styles.chip,
                    { borderColor: c.border, backgroundColor: inputSurface },
                    sex === s && { borderColor: c.tint, backgroundColor: isDark ? 'rgba(59,126,237,0.12)' : '#eef4ff' },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { fontFamily: font.semiBold, color: c.textSecondary },
                      sex === s && { color: c.tint },
                    ]}>
                    {s === 'unspecified' ? 'Prefer not to say' : s[0].toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { fontFamily: font.semiBold, color: c.textSecondary }]}>
              Insurance status (optional)
            </Text>
            <TextInput
              value={insurance}
              onChangeText={setInsurance}
              placeholder="Uninsured, employer plan, etc."
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  fontFamily: font.regular,
                  color: c.text,
                  borderColor: c.border,
                  backgroundColor: inputSurface,
                },
              ]}
              accessibilityLabel="Insurance status optional"
            />

            <Pressable
              onPress={() => setAccepted(!accepted)}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: c.tint },
                  accepted && { backgroundColor: c.tint },
                ]}>
                {accepted ? (
                  <Ionicons name="checkmark" size={16} color="#fff" accessibilityElementsHidden />
                ) : null}
              </View>
              <Text style={[styles.checkText, { fontFamily: font.regular, color: c.textSecondary }]}>
                I understand how MedConnect uses my wellness screening data per the privacy notice (demo
                MVP — not legal advice).
              </Text>
            </Pressable>

            <LinearGradient
              colors={[c.tint, c.tintPressed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryWrap}>
              <Pressable
                style={({ pressed }) => [styles.primaryInner, pressed && { opacity: 0.92 }]}
                onPress={onSubmit}
                accessibilityRole="button"
                accessibilityLabel="Create account">
                <Text style={[styles.primaryText, { fontFamily: font.bold }]}>Create account</Text>
              </Pressable>
            </LinearGradient>
            <Pressable style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.8 }]} onPress={onGuest}>
              <Text style={[styles.secondaryText, { fontFamily: font.semiBold, color: c.tint }]}>
                Continue as guest (results not saved long-term)
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 999,
    top: -70,
    right: -60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    zIndex: 1,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  logoIcon: { zIndex: 1 },
  logoWord: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroTitle: {
    fontSize: 26,
    letterSpacing: -0.6,
    color: '#fff',
    marginBottom: 10,
    zIndex: 1,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.84)',
    maxWidth: 400,
    zIndex: 1,
  },
  sheet: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 2,
  },
  sheetLead: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  ssoRow: { flexDirection: 'row', gap: 10 },
  ssoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  ssoText: { fontSize: 15 },
  pressed: { opacity: 0.88 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: 6,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 12 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  checkRow: { flexDirection: 'row', gap: 12, marginTop: 18, alignItems: 'flex-start' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { flex: 1, fontSize: 13, lineHeight: 19 },
  primaryWrap: {
    marginTop: 22,
    borderRadius: 16,
    padding: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryInner: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  primaryText: { color: '#fff', fontSize: 16 },
  secondary: { paddingVertical: 16, alignItems: 'center' },
  secondaryText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
