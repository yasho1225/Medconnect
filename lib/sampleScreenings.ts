import type { Screening } from './types';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function createDemoScreenings(userId: string): Screening[] {
  const loc = (name: string, city: string): Screening['location'] => ({
    name,
    city,
    address: `${city}, GA`,
  });

  return [
    {
      id: `scr-${userId}-1`,
      userId,
      syncedAt: isoDaysAgo(0),
      location: loc('MedConnect Kiosk — Alpharetta Community Center', 'Alpharetta'),
      bloodPressure: { systolic: 128, diastolic: 82 },
      heartRateBpm: 78,
      bmi: 26.2,
      spo2: 97,
      irregularHeartbeat: false,
      estimatedGlucoseMgDl: 108,
      estimatedCholesterolMgDl: 198,
    },
    {
      id: `scr-${userId}-2`,
      userId,
      syncedAt: isoDaysAgo(32),
      location: loc('MedConnect Kiosk — LA Fitness', 'Roswell'),
      bloodPressure: { systolic: 132, diastolic: 84 },
      heartRateBpm: 82,
      bmi: 26.4,
      spo2: 96,
      irregularHeartbeat: false,
      estimatedGlucoseMgDl: 112,
      estimatedCholesterolMgDl: 205,
    },
    {
      id: `scr-${userId}-3`,
      userId,
      syncedAt: isoDaysAgo(74),
      location: loc('MedConnect Kiosk — University Student Center', 'Atlanta'),
      bloodPressure: { systolic: 118, diastolic: 76 },
      heartRateBpm: 72,
      bmi: 25.8,
      spo2: 98,
      irregularHeartbeat: false,
      estimatedGlucoseMgDl: 99,
      estimatedCholesterolMgDl: 188,
    },
    {
      id: `scr-${userId}-4`,
      userId,
      syncedAt: isoDaysAgo(120),
      location: loc('MedConnect Kiosk — Office Tower Lobby', 'Atlanta'),
      bloodPressure: { systolic: 124, diastolic: 80 },
      heartRateBpm: 88,
      bmi: 25.9,
      spo2: 97,
      irregularHeartbeat: true,
      estimatedGlucoseMgDl: 104,
      estimatedCholesterolMgDl: 192,
    },
  ];
}

export function createSyncedScreeningFromKiosk(userId: string): Screening {
  const jitter = () => Math.round((Math.random() - 0.5) * 6);
  const sys = 118 + jitter() * 2;
  const dia = 76 + jitter();
  return {
    id: `scr-${Date.now()}`,
    userId,
    syncedAt: new Date().toISOString(),
    location: {
      name: 'MedConnect Kiosk (linked via QR)',
      city: 'Metro Atlanta',
      address: 'Linked session',
    },
    bloodPressure: { systolic: sys, diastolic: dia },
    heartRateBpm: 70 + Math.round(Math.random() * 18),
    bmi: 24 + Math.random() * 4,
    spo2: 95 + Math.round(Math.random() * 4),
    irregularHeartbeat: Math.random() < 0.08,
    estimatedGlucoseMgDl: 95 + Math.round(Math.random() * 25),
    estimatedCholesterolMgDl: 175 + Math.round(Math.random() * 40),
  };
}
