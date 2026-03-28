import type { BiologicalSex, HealthInsight, Screening } from './types';
import {
  bpStatus,
  cholesterolStatus,
  glucoseStatus,
  overallRiskFromScreening,
  spo2Status,
} from './healthUtils';

const DISCLAIMER =
  'General wellness information only — not a diagnosis. See a licensed professional for medical advice.';

function baseInsight(
  screeningId: string,
  partial: Omit<HealthInsight, 'id' | 'screeningId' | 'createdAt' | 'helpfulVotes'>
): HealthInsight {
  return {
    id: `${screeningId}-${partial.title.slice(0, 12)}-${Math.random().toString(36).slice(2, 7)}`,
    screeningId,
    createdAt: new Date().toISOString(),
    helpfulVotes: { up: 0, down: 0 },
    ...partial,
  };
}

export function buildInsightsForScreening(
  s: Screening,
  profile?: { sex: BiologicalSex; dateOfBirth: string } | null
): HealthInsight[] {
  const insights: HealthInsight[] = [];
  const age = profile?.dateOfBirth ? approximateAge(profile.dateOfBirth) : undefined;
  const bp = bpStatus(s.bloodPressure.systolic, s.bloodPressure.diastolic);
  const spo2 = spo2Status(s.spo2);
  const glu = glucoseStatus(s.estimatedGlucoseMgDl);
  const chol = cholesterolStatus(s.estimatedCholesterolMgDl);
  const risk = overallRiskFromScreening(s);

  if (bp !== 'normal') {
    insights.push(
      baseInsight(s.id, {
        title: 'Blood pressure pattern',
        body:
          bp === 'high'
            ? `Your reading was ${s.bloodPressure.systolic}/${s.bloodPressure.diastolic} mmHg, which is above common guideline targets for most adults.`
            : `Your reading was ${s.bloodPressure.systolic}/${s.bloodPressure.diastolic} mmHg — slightly higher than the usual “normal” range.`,
        whatNext:
          'Consider repeating a screening in a few weeks, track salt and activity, and share trends with a clinician if numbers stay elevated. Source: AHA blood pressure guidance.',
        sourceNote: 'American Heart Association — blood pressure categories (general reference).',
        risk: bp === 'high' ? 'high' : 'moderate',
        metricTags: ['Blood pressure'],
      })
    );
  }

  if (spo2 !== 'normal') {
    insights.push(
      baseInsight(s.id, {
        title: 'Oxygen level (SpO2)',
        body: `SpO2 was ${s.spo2}%. Readings under 95% can be worth follow-up, especially if you have symptoms.`,
        whatNext:
          'If you feel short of breath, chest pain, or confusion, seek urgent care. Otherwise, consider a repeat screening and discuss persistent low readings with a clinician. Source: CDC wellness education.',
        sourceNote: 'CDC — chronic disease and wellness education (general).',
        risk: spo2 === 'attention' ? 'high' : 'moderate',
        metricTags: ['Oxygen'],
      })
    );
  }

  if (s.irregularHeartbeat) {
    insights.push(
      baseInsight(s.id, {
        title: 'Heart rhythm flag',
        body:
          'The kiosk noted a possible irregular heartbeat pattern. This can be affected by movement, caffeine, or device placement.',
        whatNext:
          'Stay calm, avoid caffeine before a repeat screening, and follow up with a clinician if you have palpitations, dizziness, or chest discomfort.',
        sourceNote: 'Screening device manufacturer wellness messaging pattern.',
        risk: 'moderate',
        metricTags: ['Heart rate'],
      })
    );
  }

  if (glu !== 'normal') {
    insights.push(
      baseInsight(s.id, {
        title: 'Estimated glucose (not a lab test)',
        body: `Estimated value ${s.estimatedGlucoseMgDl} mg/dL. Kiosk estimates are not substitutes for fasting labs or A1c.`,
        whatNext:
          'If you have thirst, frequent urination, or a family history of diabetes, ask your clinician about proper blood sugar testing. Source: CDC diabetes prevention basics.',
        sourceNote: 'CDC — diabetes prevention (general education).',
        risk: glu === 'high' ? 'moderate' : 'low',
        metricTags: ['Glucose estimate'],
      })
    );
  }

  if (chol !== 'normal') {
    insights.push(
      baseInsight(s.id, {
        title: 'Estimated cholesterol (not a lab test)',
        body: `Estimated total cholesterol ${s.estimatedCholesterolMgDl} mg/dL. This is a wellness estimate, not a diagnostic lipid panel.`,
        whatNext:
          'Heart-healthy patterns (fiber, movement, sleep) support cardiovascular wellness. Ask your clinician for a real lipid panel if you have risk factors.',
        sourceNote: 'AHA — heart-healthy lifestyle guidance (general).',
        risk: chol === 'high' ? 'moderate' : 'low',
        metricTags: ['Cholesterol estimate'],
      })
    );
  }

  if (insights.length === 0) {
    insights.push(
      baseInsight(s.id, {
        title: 'Steady screening snapshot',
        body:
          age != null
            ? `For your approximate age (${age} yrs)${profile?.sex && profile.sex !== 'unspecified' ? `, sex at birth considered in general ranges where applicable` : ''}, your kiosk metrics look broadly within typical wellness bands.`
            : 'Your kiosk metrics look broadly within typical wellness bands for a general adult screening.',
        whatNext:
          'Keep routine movement, sleep, and preventive visits. Schedule your next kiosk check based on your reminder settings.',
        sourceNote: 'MedConnect wellness summary (non-diagnostic).',
        risk: 'low',
        metricTags: ['General'],
      })
    );
  }

  insights.push(
    baseInsight(s.id, {
      title: 'How to use this information',
      body: DISCLAIMER,
      whatNext:
        risk === 'high'
          ? 'A shorter re-screening window (about 30 days) is suggested. Tap Find to locate a kiosk.'
          : risk === 'moderate'
            ? 'Consider a follow-up in about 45 days unless your clinician advises otherwise.'
            : 'Most people in a low-risk band aim for a check about every 90 days — adjust in Settings.',
      sourceNote: 'MedConnect reminder policy (demo MVP).',
      risk,
      metricTags: ['General'],
    })
  );

  return insights.slice(0, 5);
}

function approximateAge(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 35;
  const diff = Date.now() - d.getTime();
  return Math.max(18, Math.min(90, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))));
}
