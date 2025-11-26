import { FuzzyFeatures, RecommendationResult, Student, Internship } from '../types';

// --- Helper: Membership Functions ---

// Triangular membership function with protection against division by zero
const trimf = (x: number, abc: [number, number, number]): number => {
  const [a, b, c] = abc;
  
  // Calculate left slope term
  let term1 = 0;
  if (a === b) {
    // Left shoulder: 1 if x <= b (but typically used for >= a in triangular context)
    // If a==b, we treat it as 1 at a. If x < a, it depends on context but usually 0 or 1.
    // For [0, 0, 2.5], we want 1 at 0.
    term1 = x >= a ? 1 : 0; 
  } else {
    term1 = (x - a) / (b - a);
  }

  // Calculate right slope term
  let term2 = 0;
  if (b === c) {
    // Right shoulder: 1 if x <= c (typically)
    // For [3.5, 4.0, 4.0], we want 1 at 4.0.
    term2 = x <= c ? 1 : 0;
  } else {
    term2 = (c - x) / (c - b);
  }

  return Math.max(0, Math.min(term1, term2));
};

// --- Fuzzification ---

// CGPA (0-4)
const fuzzifyCGPA = (cgpa: number) => ({
  low: trimf(cgpa, [0, 0, 2.5]),
  medium: trimf(cgpa, [2.0, 3.0, 4.0]),
  high: trimf(cgpa, [3.5, 4.0, 4.0]), // Clamped at top
});

// Skill (0-100)
const fuzzifySkill = (skill: number) => ({
  poor: trimf(skill, [0, 0, 50]),
  moderate: trimf(skill, [30, 50, 80]),
  excellent: trimf(skill, [70, 100, 100]),
});

// --- Inference Engine ---

const evaluateRules = (cgpaM: any, skillM: any, fieldVal: number) => {
  const rules = [];

  // Rule 1: high CGPA AND excellent skill AND match → strong
  if (fieldVal === 1.0) {
    rules.push({ strength: Math.min(cgpaM.high, skillM.excellent), output: 'strong' });
  }

  // Rule 2: medium CGPA AND excellent skill AND match → strong
  if (fieldVal === 1.0) {
    rules.push({ strength: Math.min(cgpaM.medium, skillM.excellent), output: 'strong' });
  }

  // Rule 3: high CGPA AND moderate skill AND match → strong
  if (fieldVal === 1.0) {
    rules.push({ strength: Math.min(cgpaM.high, skillM.moderate), output: 'strong' });
  }

  // Rule 4: medium CGPA AND moderate skill AND partial → fair
  if (fieldVal === 0.5) {
    rules.push({ strength: Math.min(cgpaM.medium, skillM.moderate), output: 'fair' });
  }

  // Rule 5: low CGPA AND poor skill → weak
  rules.push({ strength: Math.min(cgpaM.low, skillM.poor), output: 'weak' });

  // Rule 6: field notmatch → weak
  if (fieldVal === 0.0) {
    rules.push({ strength: 1.0, output: 'weak' });
  }

  // Rule 7: excellent skill AND partial → fair
  if (fieldVal === 0.5) {
    rules.push({ strength: skillM.excellent, output: 'fair' });
  }

  // Rule 8: high CGPA AND partial → fair
  if (fieldVal === 0.5) {
    rules.push({ strength: cgpaM.high, output: 'fair' });
  }

  // Rule 9: moderate skill AND match → fair
  if (fieldVal === 1.0) {
    rules.push({ strength: skillM.moderate, output: 'fair' });
  }

  return rules;
};

// --- Defuzzification (Centroid) ---

const defuzzify = (rules: { strength: number; output: string }[]): number => {
  // Aggregation: Find max activation for each output linguistic variable
  let weakMax = 0;
  let fairMax = 0;
  let strongMax = 0;

  rules.forEach((r) => {
    if (r.output === 'weak') weakMax = Math.max(weakMax, r.strength);
    if (r.output === 'fair') fairMax = Math.max(fairMax, r.strength);
    if (r.output === 'strong') strongMax = Math.max(strongMax, r.strength);
  });

  // Output membership functions for Weak, Fair, Strong
  // Weak: trimf(x, [0, 0, 50])
  // Fair: trimf(x, [30, 50, 80])
  // Strong: trimf(x, [70, 100, 100])

  // Discrete Centroid Calculation
  // Sample the domain 0-100 at intervals
  const samples = 50;
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * 100;
    
    const muWeak = trimf(x, [0, 0, 50]);
    const muFair = trimf(x, [30, 50, 80]);
    const muStrong = trimf(x, [70, 100, 100]);

    // Aggregate using MAX (standard Mamdani)
    // Clip each membership function by the rule activation (strength)
    const valWeak = Math.min(muWeak, weakMax);
    const valFair = Math.min(muFair, fairMax);
    const valStrong = Math.min(muStrong, strongMax);

    const aggregatedY = Math.max(valWeak, valFair, valStrong);

    numerator += x * aggregatedY;
    denominator += aggregatedY;
  }

  if (denominator === 0) return 0;
  return numerator / denominator;
};

// --- Main Calculation Functions ---

const getFieldAlignment = (studentField: string, internshipField: string): number => {
  const s = studentField.toLowerCase();
  const i = internshipField.toLowerCase();

  if (s === i) return 1.0;

  const relatedMap: Record<string, string[]> = {
    software: ['data', 'networks'],
    data: ['software', 'networks'],
    networks: ['software', 'data'],
  };

  if (relatedMap[s] && relatedMap[s].includes(i)) return 0.5;

  return 0.0;
};

const calculateBaselineScore = (
  cgpa: number,
  minCgpa: number,
  skill: number,
  fieldAlign: number
): number => {
  // Formula:
  // cgpa_fit = 1.0 if cgpa >= min_cgpa else (cgpa / min_cgpa) * 0.5
  // skill_norm = skill / 100
  // field_norm = field_alignment
  // baseline = (0.5 * cgpa_fit) + (0.3 * skill_norm) + (0.2 * field_norm)

  const cgpaFit = cgpa >= minCgpa ? 1.0 : (cgpa / minCgpa) * 0.5;
  const skillNorm = skill / 100;
  
  const baseline = (0.5 * cgpaFit) + (0.3 * skillNorm) + (0.2 * fieldAlign);
  return parseFloat((baseline * 100).toFixed(2));
};

export const generateRecommendations = (
  student: Student,
  internships: Internship[]
): RecommendationResult[] => {
  const results: RecommendationResult[] = internships.map((internship) => {
    // 1. Compute Features
    const fieldAlign = getFieldAlignment(student.Field, internship.Field);
    
    // 2. Fuzzy Score
    const cgpaM = fuzzifyCGPA(student.CGPA);
    const skillM = fuzzifySkill(student.Skill_Match_Percent);
    const rules = evaluateRules(cgpaM, skillM, fieldAlign);
    const fuzzyRaw = defuzzify(rules);
    const fuzzyScore = parseFloat(fuzzyRaw.toFixed(2));

    // 3. Baseline Score
    const baselineScore = calculateBaselineScore(
      student.CGPA,
      internship.Min_CGPA,
      student.Skill_Match_Percent,
      fieldAlign
    );

    let alignLabel: 'Match' | 'Related' | 'No Match' = 'No Match';
    if (fieldAlign === 1.0) alignLabel = 'Match';
    else if (fieldAlign === 0.5) alignLabel = 'Related';

    return {
      Internship_ID: internship.Internship_ID,
      Company: internship.Company,
      Role: internship.Role,
      Field: internship.Field,
      Location: internship.Location,
      Fuzzy_Score: fuzzyScore,
      Baseline_Score: baselineScore,
      Field_Alignment_Label: alignLabel,
    };
  });

  // Sort: Highest Fuzzy Score, then Highest Baseline Score
  results.sort((a, b) => {
    if (b.Fuzzy_Score !== a.Fuzzy_Score) {
      return b.Fuzzy_Score - a.Fuzzy_Score;
    }
    return b.Baseline_Score - a.Baseline_Score;
  });

  return results.slice(0, 5); // Top 5
};
