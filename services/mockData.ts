import { Student, Internship } from '../types';

export const STUDENTS: Student[] = [
  { Student_ID: 'S001', Name: 'Alice Chen', CGPA: 3.8, Field: 'software', Skill_Match_Percent: 95 },
  { Student_ID: 'S002', Name: 'Bob Smith', CGPA: 2.9, Field: 'data', Skill_Match_Percent: 60 },
  { Student_ID: 'S003', Name: 'Charlie Kim', CGPA: 3.4, Field: 'networks', Skill_Match_Percent: 85 },
  { Student_ID: 'S004', Name: 'Diana Prince', CGPA: 3.9, Field: 'data', Skill_Match_Percent: 90 },
  { Student_ID: 'S005', Name: 'Ethan Hunt', CGPA: 2.2, Field: 'software', Skill_Match_Percent: 40 },
];

export const INTERNSHIPS: Internship[] = [
  { Internship_ID: 'I001', Company: 'TechCorp', Role: 'Frontend Dev', Field: 'software', Location: 'San Francisco', Min_CGPA: 3.0 },
  { Internship_ID: 'I002', Company: 'DataGenix', Role: 'Data Analyst', Field: 'data', Location: 'New York', Min_CGPA: 3.2 },
  { Internship_ID: 'I003', Company: 'NetSystems', Role: 'Network Engineer', Field: 'networks', Location: 'Austin', Min_CGPA: 2.8 },
  { Internship_ID: 'I004', Company: 'SoftSolutions', Role: 'Backend Intern', Field: 'software', Location: 'Remote', Min_CGPA: 3.0 },
  { Internship_ID: 'I005', Company: 'CloudNine', Role: 'DevOps Engineer', Field: 'networks', Location: 'Seattle', Min_CGPA: 3.5 },
  { Internship_ID: 'I006', Company: 'AlphaAI', Role: 'ML Engineer', Field: 'data', Location: 'Boston', Min_CGPA: 3.7 },
  { Internship_ID: 'I007', Company: 'StartUp Inc', Role: 'Full Stack', Field: 'software', Location: 'Denver', Min_CGPA: 2.5 },
  { Internship_ID: 'I008', Company: 'CyberSecure', Role: 'Security Analyst', Field: 'networks', Location: 'Chicago', Min_CGPA: 3.0 },
];