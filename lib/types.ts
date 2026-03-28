export type BiologicalSex = 'female' | 'male' | 'unspecified';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  sex: BiologicalSex;
  insuranceStatus?: string;
  acceptedPrivacyAt: string;
}

export interface ScreeningLocation {
  name: string;
  address?: string;
  city?: string;
}

export interface Screening {
  id: string;
  userId: string | 'guest';
  syncedAt: string;
  location: ScreeningLocation;
  bloodPressure: { systolic: number; diastolic: number };
  heartRateBpm: number;
  bmi: number;
  spo2: number;
  irregularHeartbeat: boolean;
  estimatedGlucoseMgDl: number;
  estimatedCholesterolMgDl: number;
}

export type InsightRisk = 'low' | 'moderate' | 'high';

export interface HealthInsight {
  id: string;
  screeningId: string;
  createdAt: string;
  title: string;
  body: string;
  whatNext: string;
  sourceNote: string;
  risk: InsightRisk;
  metricTags: string[];
  helpfulVotes?: { up: number; down: number };
}

export type ReminderCadenceDays = 30 | 45 | 90;
