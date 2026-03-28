/** MedConnect — refined clinical palette (mobile app polish). */
const ink = '#0c1629';
const inkMuted = '#3d4f6f';
const accent = '#3b7eed';
const accentDeep = '#2563eb';
const sky = '#eef3fb';
const skyDeep = '#e2eaf7';
const surface = '#ffffff';
const surface2 = '#f6f8fd';

export default {
  light: {
    text: ink,
    textSecondary: inkMuted,
    textMuted: '#5c6d8a',
    background: sky,
    tint: accent,
    tintPressed: accentDeep,
    tabIconDefault: '#9aacbf',
    tabIconSelected: accent,
    card: surface,
    cardMuted: surface2,
    border: 'rgba(15, 34, 58, 0.08)',
    chartAxis: '#c8d6ea',
    header: '#0f2847',
    headerSecondary: '#153a5c',
    onHeader: '#FFFFFF',
    ctaFill: accentDeep,
    heroWash: skyDeep,
    heroGlow: 'rgba(99, 179, 237, 0.35)',
    tabBarBg: 'rgba(255,255,255,0.92)',
    overlayLight: 'rgba(255,255,255,0.14)',
  },
  dark: {
    text: '#f2f6fc',
    textSecondary: '#a8b8d0',
    textMuted: '#7d8fa8',
    background: '#0a121f',
    tint: '#6ba3ff',
    tintPressed: '#8eb7ff',
    tabIconDefault: '#5a6b82',
    tabIconSelected: '#6ba3ff',
    card: '#141e2e',
    cardMuted: '#1a2638',
    border: 'rgba(255,255,255,0.08)',
    chartAxis: '#2a3f5c',
    header: '#0a121f',
    headerSecondary: '#141e2e',
    onHeader: '#f2f6fc',
    ctaFill: '#3b7eed',
    heroWash: '#121d30',
    heroGlow: 'rgba(59, 126, 237, 0.25)',
    tabBarBg: 'rgba(20, 30, 46, 0.94)',
    overlayLight: 'rgba(255,255,255,0.08)',
  },
};
