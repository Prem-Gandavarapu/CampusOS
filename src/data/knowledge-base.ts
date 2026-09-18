export type KnowledgeDocument = { id: string; title: string; content: string; sourceUrl: string; sourceLabel: string }

export const campusKnowledgeBase: KnowledgeDocument[] = [
  { id: 'gist-results', title: 'Autonomous Examination Results', content: 'GIST publishes B.Tech Regular and Supplementary April-May 2026 examination results through the official examination results portal. The official PDF is titled B.Tech Regular and Supplementary April-May 2026 Examinations Results.', sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/06/B.Tech-Regular-and-Supplementary-April-May-2026-Examinations-Results.pdf', sourceLabel: 'Examination Results' },
  { id: 'gist-exams', title: 'GIST Examination Section', content: 'The GIST Examination Cell coordinates midterm, end, practical and university examinations, prepares consolidated results, and publishes examination information. External examination results are available through the official portal linked by GIST.', sourceUrl: 'https://gist.edu.in/gist/examinations/', sourceLabel: 'Examination Section' },
  { id: 'gist-notices', title: 'GIST Notice Board', content: 'The GIST homepage notice board lists examination notifications, timetables, results declarations and RC-CV circulars, including August 2026 timetables and April-May 2026 B.Tech examination updates.', sourceUrl: 'https://gist.edu.in/gist/gist-home/', sourceLabel: 'Homepage Notice Board' },
  { id: 'gist-timetable', title: 'Examination Timetables', content: 'The public notice board includes M.Tech I and II Semester PRG25 Regular and Supplementary Examinations August 2026 time tables and B.Tech mid examination time tables.', sourceUrl: 'https://gist.edu.in/gist/gist-home/', sourceLabel: 'Examination Timetables' },
  { id: 'gist-circular', title: 'Academic Notifications and Circulars', content: 'The public notice board includes the B.Tech Regular and Supplementary April-May 2026 Examinations RC-CV Circular and result declaration notifications.', sourceUrl: 'https://gist.edu.in/gist/gist-home/', sourceLabel: 'Academic Notifications' },
  { id: 'gist-programmes', title: 'GIST Programmes', content: 'GIST lists B.Tech programmes in CSE, CSE (AI&ML), AI&DS, CSE (Data Science), CSE (Cyber Security), ECE, EEE, Mechanical and Civil, plus M.Tech and Diploma study options.', sourceUrl: 'https://gist.edu.in/gist/gist-home/', sourceLabel: 'GIST Programmes' },
  { id: 'campus', title: 'Campus information', content: 'Geethanjali Institute of Science and Technology is an autonomous engineering institution approved by AICTE, affiliated to JNTUA, and located near the NH5 Nellore-Mumbai State Highway.', sourceUrl: 'https://gist.edu.in/gist/gist-home/', sourceLabel: 'GIST Homepage' },
]

export function retrieveCampusKnowledge(question: string) {
  const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 2)
  return campusKnowledgeBase.map((doc) => ({ doc, score: terms.reduce((score, term) => score + ((doc.title + ' ' + doc.content).toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score).filter(({ score }) => score > 0).slice(0, 3).map(({ doc }) => doc)
}
