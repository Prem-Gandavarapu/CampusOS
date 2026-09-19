export type Course = {
  id: string
  code: string
  title: string
  faculty: string
  color: string
  progress: number
  attendance: number
  assignments: { done: number; total: number }
  modules: string[]
  syllabus: string[]
  materials: { title: string; kind: 'Slides' | 'Reading' | 'Video'; duration: string }[]
  nextClass: string
}

export type Opportunity = {
  id: string
  kind: 'Hackathon' | 'Internship' | 'Placement' | 'Workshop'
  title: string
  organization: string
  deadline: string
  eligibility: string
  skills: string[]
  match: number
  reason: string
  accent: string
}

export type Complaint = {
  id: string
  title: string
  description?: string
  category: string
  priority: 'Low' | 'Medium' | 'High'
  department: string
  authority: string
  sla: string
  status: 'Received' | 'In review' | 'Resolved'
  submittedOn: string
  location: string
  impact: number
  confidence: number
}

export type CampusBuilding = {
  id: string
  name: string
  shortName: string
  occupancy: number
  energy: string
  issues: number
  rooms: number
  insight: string
  color: string
  position: string
}

export const student = {
  name: 'Priya Sharma',
  initials: 'PS',
  program: 'B.Tech · Computer Science',
  semester: 'Semester 6',
  id: 'CS-2023-184',
}

export const dashboardMetrics = [
  { label: 'Attendance', value: '86.4%', detail: '+2.1% this month', trend: 'up', tone: 'success' },
  { label: 'Current GPA', value: '8.7', detail: 'Top 12% of cohort', trend: 'up', tone: 'brand' },
  { label: 'Learning progress', value: '68%', detail: '3 milestones this week', trend: 'up', tone: 'warning' },
  { label: 'Skill score', value: '92', detail: 'AI & product strengths', trend: 'up', tone: 'brand' },
]

export const courses: Course[] = [
  {
    id: 'machine-learning', code: 'CS401', title: 'Machine Learning', faculty: 'Dr. Arjun Mehta', color: 'from-violet-500 to-indigo-600', progress: 74, attendance: 91, assignments: { done: 4, total: 5 }, modules: ['Supervised learning', 'Neural networks', 'Model evaluation', 'Ethics in AI'], syllabus: ['Foundations & data preparation', 'Regression and classification', 'Unsupervised learning', 'Deep learning foundations', 'Responsible AI'], materials: [{ title: 'Week 8 · Neural networks', kind: 'Slides', duration: '18 pages' }, { title: 'Bias–variance tradeoff', kind: 'Reading', duration: '12 min' }, { title: 'Backpropagation walkthrough', kind: 'Video', duration: '16 min' }], nextClass: 'Today · 10:30 AM',
  },
  {
    id: 'distributed-systems', code: 'CS422', title: 'Distributed Systems', faculty: 'Prof. Nisha Rao', color: 'from-sky-500 to-cyan-500', progress: 61, attendance: 84, assignments: { done: 2, total: 4 }, modules: ['System models', 'Consensus', 'Replication', 'Fault tolerance'], syllabus: ['System architecture', 'Time and ordering', 'Replication', 'Consensus algorithms', 'Distributed transactions'], materials: [{ title: 'Raft consensus notes', kind: 'Reading', duration: '20 min' }, { title: 'Week 7 · Replication', kind: 'Slides', duration: '24 pages' }, { title: 'Consensus visualized', kind: 'Video', duration: '11 min' }], nextClass: 'Tomorrow · 2:00 PM',
  },
  {
    id: 'product-design', code: 'HU318', title: 'Product Design Studio', faculty: 'Ms. Kavya Iyer', color: 'from-amber-400 to-orange-500', progress: 79, attendance: 88, assignments: { done: 5, total: 5 }, modules: ['Problem framing', 'User research', 'Interface systems', 'Prototyping'], syllabus: ['Research & synthesis', 'Information architecture', 'Interaction design', 'Design systems', 'Portfolio narrative'], materials: [{ title: 'Design critique framework', kind: 'Reading', duration: '8 min' }, { title: 'Studio 5 · Systems', kind: 'Slides', duration: '16 pages' }, { title: 'Testing a prototype', kind: 'Video', duration: '9 min' }], nextClass: 'Fri · 11:15 AM',
  },
]

export const upcomingClasses = [
  { time: '10:30', meridiem: 'AM', title: 'Machine Learning', room: 'Academic Block · A-204', color: 'bg-violet-500' },
  { time: '2:00', meridiem: 'PM', title: 'Distributed Systems', room: 'Innovation Hub · I-12', color: 'bg-sky-500' },
  { time: '4:30', meridiem: 'PM', title: 'Product Design Studio', room: 'Design Lab · D-08', color: 'bg-amber-500' },
]

export const pendingAssignments = [
  { course: 'Machine Learning', title: 'Classifier performance analysis', due: 'Due tomorrow', priority: 'High' },
  { course: 'Distributed Systems', title: 'Replication design note', due: 'Due in 3 days', priority: 'Medium' },
  { course: 'Machine Learning', title: 'Model fairness reflection', due: 'Due this Sunday', priority: 'Low' },
]

export const opportunities: Opportunity[] = [
  { id: 'build-for-india', kind: 'Hackathon', title: 'Build for India 2026', organization: 'Google Developer Groups', deadline: '18 Sep · 3 days left', eligibility: '2nd–4th year engineering students', skills: ['React', 'AI/ML', 'Product'], match: 96, reason: 'Your ML coursework and recent product studio work are a strong fit.', accent: 'from-violet-500 to-fuchsia-500' },
  { id: 'atlas-intern', kind: 'Internship', title: 'Applied AI Intern', organization: 'Atlas Labs', deadline: '25 Sep · 10 days left', eligibility: 'CS students with Python foundations', skills: ['Python', 'LLMs', 'Data'], match: 91, reason: 'You have completed the core ML pathway and are ahead on AI modules.', accent: 'from-sky-500 to-cyan-500' },
  { id: 'orbit-placement', kind: 'Placement', title: 'Graduate Product Engineer', organization: 'Orbit Systems', deadline: '30 Sep · 15 days left', eligibility: 'Graduating 2027 batch', skills: ['React', 'Systems', 'UX'], match: 87, reason: 'Your systems and product-design combination maps to the role profile.', accent: 'from-emerald-500 to-teal-500' },
  { id: 'design-sprint', kind: 'Workshop', title: 'Designing AI-native products', organization: 'Figma Community', deadline: '22 Sep · 7 days left', eligibility: 'Open to all students', skills: ['UX', 'AI', 'Research'], match: 84, reason: 'A concise way to strengthen the product-thinking skill on your roadmap.', accent: 'from-amber-400 to-orange-500' },
]

export const announcements = [
  { id: 'ann-1', title: 'Innovation Hub extended hours this week', audience: 'Computer Science · Semester 6', priority: 'Useful', date: 'Today · 9:10 AM', summary: 'The Innovation Hub will remain open until 10 PM through Friday for Build for India preparation.', tone: 'brand' },
  { id: 'ann-2', title: 'Machine Learning project checkpoint', audience: 'CS401 students', priority: 'Action needed', date: 'Yesterday', summary: 'Upload your experiment log before Friday. Your current project is on track; focus on evaluation notes.', tone: 'warning' },
  { id: 'ann-3', title: 'Campus placement readiness session', audience: '2027 graduating batch', priority: 'Recommended', date: '16 Sep', summary: 'A curated session on interview narratives and portfolios, aligned with your product engineer target.', tone: 'success' },
]

export type CampusIntelItem = {
  id: string
  category: 'Examination Results' | 'Examination Timetable' | 'Academic Notification' | 'Circular'
  title: string
  date: string
  isNew?: boolean
  sourceUrl: string
}

export const campusIntelItems: CampusIntelItem[] = [
  { id: 'gist-results', category: 'Examination Results', title: 'B.Tech Regular & Supplementary Examinations - April/May 2026 Results', date: 'June 2026', isNew: true, sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/06/B.Tech-Regular-and-Supplementary-April-May-2026-Examinations-Results.pdf' },
  { id: 'gist-timetable', category: 'Examination Timetable', title: 'M.Tech I & II Semester PRG25 Regular and Supplementary Examinations - August 2026 Time Tables', date: 'August 2026', isNew: true, sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/08/M.Tech-I-II-Semester-PRG25-Regular-and-Supplementary-Examinations-Aug-2026-Time-Tables.pdf' },
  { id: 'gist-notification', category: 'Academic Notification', title: 'I B.Tech I & II Semester RG23 Regular and Supplementary Examinations - May 2026 Results Declaration', date: 'July 2026', isNew: true, sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/07/I-B.Tech-I-II-Semester-RG23-Regular-and-Supplementary-Examinations-May-2026-Results-Declaration.pdf' },
  { id: 'gist-circular', category: 'Circular', title: 'B.Tech Regular and Supplementary April-May 2026 Examinations - RC-CV Circular', date: 'June 2026', isNew: true, sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/06/B.Tech-Regular-and-Supplementary-April-May-2026-Examinations-RC-CV-Circular.pdf' },
]
export const initialComplaints: Complaint[] = [
  { id: 'CMP-2087', title: 'Projector not working in CSE Lab', category: 'Infrastructure', priority: 'High', department: 'Academic Services', authority: 'CSE Infrastructure Coordinator', sla: '2 hours', status: 'In review', submittedOn: 'Today · 9:18 AM', location: 'CSE Lab 204', impact: 42, confidence: 96 },
  { id: 'CMP-2084', title: 'Wi‑Fi unavailable in Block B', category: 'Network & IT', priority: 'Medium', department: 'Campus IT', authority: 'Network Operations', sla: '24 hours', status: 'In review', submittedOn: '17 Sep · 2:24 PM', location: 'Block B · 2nd floor', impact: 18, confidence: 91 },
  { id: 'CMP-2076', title: 'Hostel water supply interruption', category: 'Utilities', priority: 'High', department: 'Hostel Operations', authority: 'Residence Coordinator', sla: '4 hours', status: 'Received', submittedOn: '17 Sep · 8:42 AM', location: 'North Hostel', impact: 126, confidence: 94 },
  { id: 'CMP-2019', title: 'Classroom AC malfunction', category: 'Infrastructure', priority: 'Medium', department: 'Facilities', authority: 'Facilities Desk', sla: '48 hours', status: 'Resolved', submittedOn: '12 Sep · 11:03 AM', location: 'Academic Block · A-204', impact: 34, confidence: 88 },
  { id: 'CMP-1988', title: 'Library printer not functioning', category: 'Library Services', priority: 'Low', department: 'Library Services', authority: 'Library Desk', sla: '72 hours', status: 'Resolved', submittedOn: '08 Sep · 4:18 PM', location: 'Central Library · 1F', impact: 9, confidence: 97 },
]

export const careerProfile = {
  target: 'AI Product Engineer',
  readiness: 72,
  summary: 'You are building a rare blend of technical depth and product judgment. Your next step is to turn it into evidence.',
  strengths: ['Machine learning foundations', 'Interface systems', 'Structured problem solving'],
  gaps: ['Production LLM patterns', 'Experiment design', 'Public portfolio narrative'],
  roadmap: [
    { period: 'Now · Sep', title: 'Ship a concise AI case study', detail: 'Turn your ML project into a polished, explainable narrative.' },
    { period: 'Next · Oct', title: 'Build one end-to-end prototype', detail: 'Practice retrieval, evaluation, and a thoughtful product surface.' },
    { period: 'Then · Nov', title: 'Prepare your opportunity story', detail: 'Connect your systems, ML, and design choices in interviews.' },
  ],
}

export const adminStats = [
  { label: 'Active students', value: '8,426', change: '+4.2%', icon: 'users' },
  { label: 'Faculty', value: '412', change: '98% active', icon: 'graduation' },
  { label: 'Open complaints', value: '126', change: '18 need review', icon: 'messages' },
  { label: 'High priority', value: '14', change: '↓ 22% this week', icon: 'alert' },
]

export const engagementData = [
  { day: 'Mon', engagement: 62, active: 4200 }, { day: 'Tue', engagement: 68, active: 4950 }, { day: 'Wed', engagement: 74, active: 5420 }, { day: 'Thu', engagement: 71, active: 5180 }, { day: 'Fri', engagement: 82, active: 6030 }, { day: 'Sat', engagement: 47, active: 3250 }, { day: 'Sun', engagement: 35, active: 2460 },
]

export const utilizationData = [
  { name: 'Academic', value: 82, color: '#7c3aed' }, { name: 'Innovation', value: 76, color: '#0ea5e9' }, { name: 'Library', value: 68, color: '#10b981' }, { name: 'Labs', value: 91, color: '#f59e0b' }, { name: 'Hostel', value: 88, color: '#f97316' },
]

export const complaintDistribution = [
  { name: 'Low', value: 48, color: '#10b981' }, { name: 'Medium', value: 64, color: '#f59e0b' }, { name: 'High', value: 14, color: '#ef4444' },
]

export const campusBuildings: CampusBuilding[] = [
  { id: 'academic', name: 'Academic Block', shortName: 'AB', occupancy: 82, energy: 'Normal', issues: 2, rooms: 11, insight: 'Peak movement is expected near A-204 at 10:30 AM. Two seminar rooms are still available.', color: 'from-violet-500 to-indigo-600', position: 'left-[7%] top-[25%]' },
  { id: 'innovation', name: 'Innovation Hub', shortName: 'IH', occupancy: 64, energy: 'Efficient', issues: 1, rooms: 6, insight: 'A productive, lower-density window is open now. Lab I-12 has 18 seats available.', color: 'from-sky-500 to-cyan-500', position: 'left-[39%] top-[15%]' },
  { id: 'library', name: 'Central Library', shortName: 'LB', occupancy: 58, energy: 'Optimal', issues: 0, rooms: 8, insight: 'Quiet zones are 42% occupied. This is your best focus location before noon.', color: 'from-emerald-500 to-teal-500', position: 'right-[8%] top-[27%]' },
  { id: 'labs', name: 'Research Labs', shortName: 'RL', occupancy: 91, energy: 'High', issues: 3, rooms: 2, insight: 'High utilization. Reserve one of the remaining rooms before heading over.', color: 'from-amber-400 to-orange-500', position: 'bottom-[11%] left-[19%]' },
  { id: 'hostel', name: 'Student Hostel', shortName: 'SH', occupancy: 88, energy: 'Normal', issues: 2, rooms: 4, insight: 'Maintenance requests are within SLA. South lounge has availability after 6 PM.', color: 'from-rose-500 to-pink-500', position: 'bottom-[8%] right-[20%]' },
]

export const aiInsights = [
  { title: 'Your best focus window is now', detail: 'Machine Learning is next, and you are one review session away from closing this week’s assignment.', action: 'Plan my 45 minutes' },
  { title: 'Attendance is healthy, with one watchpoint', detail: 'Distributed Systems is at 84%. Attend the next two sessions to stay comfortably above your target.', action: 'See attendance' },
]

export const suggestedPrompts = [
  'What should I focus on today?',
  'Find opportunities for me',
  'Explain my attendance',
  'What courses should I study?',
  'Find a free lab',
]

export function getCopilotResponse(question: string) {
  const normalized = question.toLowerCase()
  if (normalized.includes('opportun')) return 'Your strongest match is Build for India 2026 at 96%. Lead with your Machine Learning project and product studio work. I also found the Atlas Labs Applied AI internship, which aligns with your completed ML pathway.'
  if (normalized.includes('attendance')) return 'Your overall attendance is 86.4%, which is healthy. Machine Learning is excellent at 91%, while Distributed Systems is at 84%. Attend the next two Distributed Systems sessions and you will be back in your comfort zone.'
  if (normalized.includes('course') || normalized.includes('study')) return 'Focus on Machine Learning first: the classifier analysis is due tomorrow and you are 74% through the course. Then spend 25 minutes on Distributed Systems replication notes—the topic is the largest gap before your next class.'
  if (normalized.includes('lab') || normalized.includes('free')) return 'Innovation Hub Lab I-12 is the best option right now: it has 18 seats available, low current occupancy, and your Distributed Systems class is nearby. Research Labs are at 91% capacity, so I would skip those for now.'
  return 'Start with a focused 45-minute Machine Learning session for your classifier analysis. Your highest-value next move is to finish the evaluation section before your 10:30 AM class. I have also surfaced two opportunities that fit your AI Product Engineer path.'
}
