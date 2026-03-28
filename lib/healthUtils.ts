import type { Screening } from './types';

export type MetricStatus = 'normal' | 'elevated' | 'high' | 'low' | 'attention';

export function bpStatus(systolic: number, diastolic: number): MetricStatus {
  if (systolic < 120 && diastolic < 80) return 'normal';
  if (systolic < 130 && diastolic < 80) return 'elevated';
  return 'high';
}

export function hrStatus(bpm: number, age?: number): MetricStatus {
  const max = age && age > 0 ? Math.round(220 - age) : 180;
  if (bpm < 50) return 'low';
  if (bpm > max * 0.85) return 'elevated';
  if (bpm >= 60 && bpm <= 100) return 'normal';
  return 'elevated';
}

export function bmiStatus(bmi: number): MetricStatus {
  if (bmi < 18.5) return 'low';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'elevated';
  return 'high';
}

export function spo2Status(spo2: number): MetricStatus {
  if (spo2 >= 95) return 'normal';
  if (spo2 >= 90) return 'elevated';
  return 'attention';
}

export function glucoseStatus(mgDl: number): MetricStatus {
  if (mgDl < 100) return 'normal';
  if (mgDl < 126) return 'elevated';
  return 'high';
}

export function cholesterolStatus(mgDl: number): MetricStatus {
  if (mgDl < 200) return 'normal';
  if (mgDl < 240) return 'elevated';
  return 'high';
}

export const STATUS_LABEL: Record<MetricStatus, string> = {
  normal: 'In a typical range',
  elevated: 'Slightly outside typical range',
  high: 'Above typical range',
  low: 'Below typical range',
  attention: 'Worth discussing with a clinician',
};

export const STATUS_COLOR: Record<MetricStatus, string> = {
  normal: '#0d9f6e',
  elevated: '#e8912d',
  high: '#e54666',
  low: '#4f8ff7',
  attention: '#c93d5a',
};

export function overallRiskFromScreening(s: Screening): 'low' | 'moderate' | 'high' {
  const bp = bpStatus(s.bloodPressure.systolic, s.bloodPressure.diastolic);
  const spo2 = spo2Status(s.spo2);
  const glu = glucoseStatus(s.estimatedGlucoseMgDl);
  const chol = cholesterolStatus(s.estimatedCholesterolMgDl);
  let score = 0;
  if (bp === 'high') score += 2;
  else if (bp === 'elevated') score += 1;
  if (spo2 === 'attention' || spo2 === 'elevated') score += 2;
  if (s.irregularHeartbeat) score += 2;
  if (glu === 'high') score += 1;
  if (chol === 'high') score += 1;
  if (score >= 4) return 'high';
  if (score >= 2) return 'moderate';
  return 'low';
}

export function reminderDaysForRisk(risk: 'low' | 'moderate' | 'high'): 30 | 45 | 90 {
  if (risk === 'high') return 30;
  if (risk === 'moderate') return 45;
  return 90;
}

export function percentChange(prev: number, next: number): number | null {
  if (prev === 0) return null;
  return Math.round(((next - prev) / prev) * 100);
}
