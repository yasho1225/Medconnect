import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { font } from '@/constants/typography';

type Point = { x: Date; y: number };

type Props = {
  title: string;
  points: Point[];
  unit: string;
  scheme: 'light' | 'dark';
  annotations?: { at: Date; label: string }[];
};

const W = 320;
const H = 160;
const PAD = 28;

export function TrendLineChart({ title, points, unit, scheme, annotations }: Props) {
  const c = Colors[scheme];
  const { polyline, dots, minY, maxY } = useMemo(() => {
    if (!points.length) {
      return { polyline: '', dots: [] as { cx: number; cy: number }[], minY: 0, maxY: 1 };
    }
    const ys = points.map((p) => p.y);
    let min = Math.min(...ys);
    let max = Math.max(...ys);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const padY = (max - min) * 0.12;
    min -= padY;
    max += padY;
    const n = points.length;
    const coords = points.map((p, i) => {
      const px = PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2);
      const py = H - PAD - ((p.y - min) / (max - min)) * (H - PAD * 2);
      return { px, py, raw: p };
    });
    const polyline = coords.map((d) => `${d.px},${d.py}`).join(' ');
    const dots = coords.map((d) => ({ cx: d.px, cy: d.py }));
    return { polyline, dots, minY: min, maxY: max };
  }, [points]);

  if (!points.length) {
    return (
      <View style={[styles.box, { borderColor: c.border, backgroundColor: c.card }]}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={{ color: c.textSecondary, fontFamily: font.regular }}>
          No data in this range yet.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.box, { borderColor: c.border, backgroundColor: c.card }]}
      accessibilityLabel={`${title} trend chart, ${points.length} points`}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} accessibilityRole="image">
        <Line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke={c.chartAxis}
          strokeWidth={1}
        />
        <Line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={c.chartAxis} strokeWidth={1} />
        <SvgText x={PAD} y={14} fill={c.textSecondary} fontSize="10">
          {`${maxY.toFixed(0)} ${unit}`}
        </SvgText>
        <SvgText x={PAD} y={H - 8} fill={c.textSecondary} fontSize="10">
          {`${minY.toFixed(0)} ${unit}`}
        </SvgText>
        <Polyline
          points={polyline}
          fill="none"
          stroke={c.tint}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {dots.map((d, i) => (
          <Circle key={i} cx={d.cx} cy={d.cy} r={4} fill={c.tint} stroke={c.card} strokeWidth={2} />
        ))}
      </Svg>
      <Text style={[styles.caption, { color: c.textSecondary }]}>
        Values shown for wellness tracking. Pattern differences (not color alone) help readability.
      </Text>
      {annotations?.length ? (
        <Text style={[styles.caption, { color: c.textMuted, marginTop: 6 }]}>
          Note: {annotations.map((a) => a.label).join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  title: { fontSize: 16, marginBottom: 8, fontFamily: font.bold },
  caption: { fontSize: 12, lineHeight: 16, marginTop: 4, fontFamily: font.regular },
});
