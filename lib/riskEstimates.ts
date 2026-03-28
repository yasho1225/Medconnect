import type { Screening } from './types';

/** Deterministic wellness-style risk scores for UI bars only — not clinical risk engines. */
export function wellnessHypertensionRiskPercent(s: Screening): number {
  const { systolic: sys, diastolic: dia } = s.bloodPressure;
  let base = 8;
  if (sys >= 140 || dia >= 90) base = 42;
  else if (sys >= 130 || dia >= 80) base = 30;
  else if (sys >= 120 || dia >= 80) base = 22;
  else base = 12;
  if (s.bmi >= 30) base += 8;
  if (s.bmi >= 25) base += 4;
  return Math.min(88, Math.round(base));
}

export function wellnessDiabetesRiskPercent(s: Screening): number {
  const glu = s.estimatedGlucoseMgDl;
  let base = 10;
  if (glu >= 126) base += 36;
  else if (glu >= 100) base += 20;
  if (s.bmi >= 30) base += 14;
  else if (s.bmi >= 25) base += 6;
  return Math.min(85, Math.round(base));
}

export function riskBandLabel(percent: number): 'Low' | 'Moderate' | 'Elevated' {
  if (percent < 18) return 'Low';
  if (percent < 32) return 'Moderate';
  return 'Elevated';
}
