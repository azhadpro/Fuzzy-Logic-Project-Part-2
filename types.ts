export interface Student {
  Student_ID: string;
  Name: string;
  CGPA: number;
  Field: string;
  Skill_Match_Percent: number;
}

export interface Internship {
  Internship_ID: string;
  Company: string;
  Role: string;
  Field: string;
  Location: string;
  Min_CGPA: number;
}

export interface RecommendationResult {
  Internship_ID: string;
  Company: string;
  Role: string;
  Field: string;
  Location: string;
  Fuzzy_Score: number;
  Baseline_Score: number;
  Field_Alignment_Label: 'Match' | 'Related' | 'No Match';
}

export interface FuzzyFeatures {
  cgpa: number;
  skill: number;
  field: number; // 0, 0.5, or 1
}

export enum FieldType {
  Software = 'software',
  Data = 'data',
  Networks = 'networks',
}