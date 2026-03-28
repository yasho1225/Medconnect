import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';

function TabIcon(name: keyof typeof Ionicons.glyphMap) {
  return function TabBarIcon({
    color,
    focused,
    size: _size,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) {
    const size = Platform.OS === 'web' ? 22 : 23;
    return (
      <View style={styles.iconWrap}>
        {focused ? (
          <View style={[styles.activePill, { backgroundColor: `${color}18` }]}>
            <Ionicons name={name} size={size} color={color} />
          </View>
        ) : (
          <Ionicons name={name} size={size} color={color} />
        )}
      </View>
    );
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  const tabBarWeb =
    Platform.OS === 'web'
      ? {
          height: 76,
          paddingTop: 6,
          paddingBottom: 14,
          backgroundColor:
            colorScheme === 'dark' ? 'rgba(20, 30, 46, 0.78)' : 'rgba(255, 255, 255, 0.82)',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: c.border,
          backdropFilter: 'blur(24px) saturate(180%)',
        }
      : {};

  const tabBarNative = {
    backgroundColor: c.tabBarBg,
    borderTopColor: c.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: {
          ...tabBarNative,
          ...tabBarWeb,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: font.semiBold,
          marginBottom: Platform.OS === 'ios' ? 2 : 0,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: { paddingTop: 4 },
        tabBarHideOnKeyboard: true,
        headerShown: true,
        headerStyle: {
          backgroundColor: c.header,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(255,255,255,0.12)',
        },
        headerTintColor: c.onHeader,
        headerTitleStyle: {
          color: c.onHeader,
          fontFamily: font.bold,
          fontSize: Platform.OS === 'web' ? 16 : 17,
          letterSpacing: -0.2,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: TabIcon('home'),
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          headerShown: false,
          tabBarIcon: TabIcon('qr-code'),
          tabBarAccessibilityLabel: 'Scan kiosk',
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          headerTitle: 'Your health summary',
          tabBarIcon: TabIcon('clipboard'),
          tabBarAccessibilityLabel: 'Health results',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: TabIcon('person-circle'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  activePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
