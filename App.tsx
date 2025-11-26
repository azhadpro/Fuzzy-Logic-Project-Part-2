
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { generateRecommendations } from './services/fuzzyService';
import { RecommendationResult, Student, Internship, FieldType } from './types';
import { Card } from './components/Card';
import { parseCSV } from './utils/csvHelper';
import { Search, Award, TrendingUp, MapPin, Briefcase, Upload, FileText, User, CheckCircle, AlertCircle } from 'lucide-react';

// --- UI Constants ---
const PASTEL_PALETTE = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];

// Default empty states
const DEFAULT_MANUAL_STUDENT: Student = {
  Student_ID: 'MANUAL_001',
  Name: 'Current User',
  CGPA: 3.0,
  Field: 'software',
  Skill_Match_Percent: 75
};

const App: React.FC = () => {
  // --- State ---
  const [internships, setInternships] = useState<Internship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Student Selection Mode: 'manual' or 'csv'
  const [studentMode, setStudentMode] = useState<'manual' | 'csv'>('manual');
  const [manualStudent, setManualStudent] = useState<Student>(DEFAULT_MANUAL_STUDENT);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Inputs Refs
  const internshipFileRef = useRef<HTMLInputElement>(null);
  const studentFileRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'internships' | 'students'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        
        if (type === 'internships') {
          // Basic validation check
          if (data.length > 0 && 'Company' in (data[0] as any)) {
            setInternships(data as Internship[]);
            setError(null);
          } else {
            setError("Invalid Internship CSV format. Missing required columns.");
          }
        } else {
          if (data.length > 0 && 'CGPA' in (data[0] as any)) {
            setStudents(data as Student[]);
            if (data.length > 0) setSelectedStudentId((data[0] as Student).Student_ID);
            setStudentMode('csv');
            setError(null);
          } else {
            setError("Invalid Student CSV format. Missing required columns.");
          }
        }
      } catch (err) {
        setError(`Failed to parse CSV: ${err}`);
      }
    };
    reader.readAsText(file);
  };

  const handleGetRecommendations = () => {
    setError(null);
    if (internships.length === 0) {
      setError("Please upload Internship data first.");
      return;
    }

    let targetStudent: Student | undefined;

    if (studentMode === 'manual') {
      targetStudent = manualStudent;
    } else {
      targetStudent = students.find(s => s.Student_ID === selectedStudentId);
    }

    if (!targetStudent) {
      setError("No student selected or configured.");
      return;
    }

    setLoading(true);
    // Simulate delay for UX
    setTimeout(() => {
      try {
        const results = generateRecommendations(targetStudent!, internships);
        setRecommendations(results);
      } catch (e) {
        setError("Error generating recommendations. Please check your data values.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#1c1c1e] to-[#000000] text-white font-sans p-4 md:p-8 selection:bg-ios-blue selection:text-white pb-20">
      
      {/* --- Header --- */}
      <header className="max-w-7xl mx-auto mb-12 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Internship Recommender
            </h1>
            <p className="text-ios-gray text-lg">Intelligent Fuzzy Logic Recommendation Engine</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-ios-gray bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Award size={16} className="text-yellow-500" />
            <span>Ranked by Fuzzy & Baseline Scores</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Controls Section (Left) --- */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* 1. Internship Data Upload */}
          <Card title="Internship Database">
            <div className="space-y-4">
              <p className="text-sm text-ios-gray">Upload CSV containing internship opportunities.</p>
              
              <div 
                onClick={() => internshipFileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all 
                  ${internships.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-ios-blue/50 hover:bg-white/5'}`}
              >
                <input 
                  type="file" 
                  ref={internshipFileRef}
                  onChange={(e) => handleFileUpload(e, 'internships')}
                  accept=".csv"
                  className="hidden"
                />
                {internships.length > 0 ? (
                  <>
                    <CheckCircle className="text-green-500 mb-2" size={32} />
                    <span className="text-green-400 font-medium">{internships.length} Internships Loaded</span>
                    <span className="text-xs text-ios-gray mt-1">Click to replace</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-ios-blue mb-2" size={32} />
                    <span className="font-medium">Upload Internship CSV</span>
                    <span className="text-xs text-ios-gray mt-1">.csv files only</span>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* 2. Student Profile Config */}
          <Card title="Student Profile">
            <div className="space-y-6">
              
              {/* Toggle */}
              <div className="flex bg-black/30 p-1 rounded-lg">
                <button 
                  onClick={() => setStudentMode('manual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${studentMode === 'manual' ? 'bg-ios-card shadow text-white' : 'text-ios-gray hover:text-white'}`}
                >
                  Manual Entry
                </button>
                <button 
                  onClick={() => setStudentMode('csv')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${studentMode === 'csv' ? 'bg-ios-card shadow text-white' : 'text-ios-gray hover:text-white'}`}
                >
                  Upload CSV
                </button>
              </div>

              {studentMode === 'manual' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                   <div>
                    <label className="block text-xs font-medium text-ios-gray mb-1.5">Field of Study</label>
                    <select 
                      value={manualStudent.Field}
                      onChange={(e) => setManualStudent({...manualStudent, Field: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-ios-blue text-white"
                    >
                      <option value="software">Software Engineering</option>
                      <option value="data">Data Science / Analytics</option>
                      <option value="networks">Networking / Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ios-gray mb-1.5">CGPA (0.0 - 4.0)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="4" 
                      step="0.01"
                      value={manualStudent.CGPA}
                      onChange={(e) => setManualStudent({...manualStudent, CGPA: parseFloat(e.target.value)})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ios-blue text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ios-gray mb-1.5">Skill Match ({manualStudent.Skill_Match_Percent}%)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={manualStudent.Skill_Match_Percent}
                      onChange={(e) => setManualStudent({...manualStudent, Skill_Match_Percent: parseInt(e.target.value)})}
                      className="w-full accent-ios-blue h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                   <div 
                    onClick={() => studentFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all 
                      ${students.length > 0 ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'}`}
                  >
                    <input 
                      type="file" 
                      ref={studentFileRef}
                      onChange={(e) => handleFileUpload(e, 'students')}
                      accept=".csv"
                      className="hidden"
                    />
                    {students.length > 0 ? (
                      <>
                        <FileText className="text-purple-500 mb-1" size={24} />
                        <span className="text-purple-400 text-sm font-medium">{students.length} Profiles Loaded</span>
                      </>
                    ) : (
                      <>
                        <User className="text-purple-400 mb-1" size={24} />
                        <span className="text-sm font-medium">Upload Student CSV</span>
                      </>
                    )}
                  </div>

                  {students.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-ios-gray mb-1.5">Select Student</label>
                      <div className="relative">
                        <select 
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-ios-blue text-white"
                        >
                          {students.map(s => (
                            <option key={s.Student_ID} value={s.Student_ID} className="bg-gray-900">
                              {s.Name} ({s.Student_ID})
                            </option>
                          ))}
                        </select>
                        <Search size={16} className="absolute right-4 top-3.5 text-ios-gray pointer-events-none" />
                      </div>
                      
                      {/* Mini preview of selected student from CSV */}
                      {students.find(s => s.Student_ID === selectedStudentId) && (
                         <div className="mt-3 p-3 bg-white/5 rounded-lg text-xs text-ios-gray flex justify-between">
                            <span>CGPA: <span className="text-white">{students.find(s => s.Student_ID === selectedStudentId)?.CGPA}</span></span>
                            <span>Field: <span className="text-white capitalize">{students.find(s => s.Student_ID === selectedStudentId)?.Field}</span></span>
                            <span>Skill: <span className="text-white">{students.find(s => s.Student_ID === selectedStudentId)?.Skill_Match_Percent}%</span></span>
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-400 shrink-0" size={18} />
                  <p className="text-xs text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={handleGetRecommendations}
                disabled={loading || internships.length === 0}
                className="w-full bg-ios-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Running Fuzzy Inference...</span>
                ) : (
                  <>
                    <TrendingUp size={20} />
                    Get Recommendations
                  </>
                )}
              </button>
            </div>
          </Card>
        </section>

        {/* --- Results Section (Right) --- */}
        <section className="lg:col-span-8 space-y-8">
          {recommendations.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Table Card */}
              <Card title="Top 5 Recommended Internships">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-ios-gray text-sm border-b border-white/10">
                        <th className="py-3 px-4 font-medium">Rank</th>
                        <th className="py-3 px-4 font-medium">Company / Role</th>
                        <th className="py-3 px-4 font-medium">Details</th>
                        <th className="py-3 px-4 font-medium text-right">Fuzzy Score</th>
                        <th className="py-3 px-4 font-medium text-right">Baseline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.map((rec, idx) => (
                        <tr 
                          key={rec.Internship_ID} 
                          className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <td className="py-4 px-4 align-top">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white border border-white/10">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-white text-lg">{rec.Company}</div>
                            <div className="text-sm text-ios-gray flex items-center gap-1 mt-1">
                              <Briefcase size={12} /> {rec.Role}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top space-y-1">
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                               <MapPin size={12} /> {rec.Location}
                             </div>
                             <div className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider 
                               ${rec.Field_Alignment_Label === 'Match' ? 'bg-green-500/20 text-green-400' : 
                                 rec.Field_Alignment_Label === 'Related' ? 'bg-yellow-500/20 text-yellow-400' : 
                                 'bg-red-500/20 text-red-400'}`}>
                               {rec.Field_Alignment_Label}
                             </div>
                          </td>
                          <td className="py-4 px-4 text-right align-middle">
                            <span className="text-xl font-bold text-blue-400">{rec.Fuzzy_Score}</span>
                          </td>
                          <td className="py-4 px-4 text-right align-middle">
                            <span className="text-lg font-medium text-gray-500">{rec.Baseline_Score}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Fuzzy Score Analysis">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recommendations} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis 
                          type="category" 
                          dataKey="Company" 
                          tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          width={100} 
                          interval={0}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="Fuzzy_Score" name="Fuzzy Score" radius={[0, 4, 4, 0]} barSize={20}>
                          {recommendations.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PASTEL_PALETTE[index % PASTEL_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Baseline Score Analysis">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recommendations} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis 
                          type="category" 
                          dataKey="Company" 
                          tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          width={100} 
                          interval={0}
                        />
                        <Tooltip 
                           cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                           contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#333', borderRadius: '8px' }}
                           itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="Baseline_Score" name="Baseline Score" radius={[0, 4, 4, 0]} barSize={20}>
                           {recommendations.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PASTEL_PALETTE[(index + 2) % PASTEL_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-ios-gray opacity-60 py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
              <Award size={64} className="mb-4 text-white/20" />
              <p className="text-lg font-medium">Ready to Match</p>
              <p className="text-sm max-w-md text-center mt-2">
                1. Upload an internship CSV<br/>
                2. Enter student details or upload a student CSV<br/>
                3. Click "Get Recommendations"
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-ios-gray text-sm">
        <p>&copy; 2024 Internship Matcher Pro. Designed with precision.</p>
      </footer>
    </div>
  );
};

export default App;
