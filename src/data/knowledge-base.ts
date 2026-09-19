export type KnowledgeDocument = { id: string; title: string; content: string; sourceUrl: string; sourceLabel: string }

export const campusKnowledgeBase: KnowledgeDocument[] = [
  {
    id: 'gist-home',
    title: 'GIST official homepage and notice board',
    content: 'Geethanjali Institute of Science and Technology is an autonomous institution with NAAC A Grade accreditation and NBA accreditation for ECE, EEE and Mechanical. It is approved by AICTE, affiliated with JNTUA, and its official homepage notice board lists current examination notifications, timetables, results declarations and RC-CV circulars.',
    sourceUrl: 'https://gist.edu.in/gist/gist-home/',
    sourceLabel: 'GIST Homepage',
  },
  {
    id: 'gist-results',
    title: 'B.Tech Regular and Supplementary April-May 2026 Examinations - Results',
    content: 'The GIST notice board links an official PDF titled B.Tech Regular and Supplementary April-May 2026 Examinations - Results. The result notice is published on the GIST website; individual student marks must be checked through the official results portal using the student hall-ticket details.',
    sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/06/B.Tech-Regular-and-Supplementary-April-May-2026-Examinations-Results.pdf',
    sourceLabel: 'Official Results PDF',
  },
  {
    id: 'gist-results-portal',
    title: 'GIST examination results portals',
    content: 'The GIST Examination Section says external examination results are available through gisteb.com. It also links the CMS portal for internal and external marks at webprosindia.com/gist/. CampusOS cannot retrieve private student marks or infer a result without an official hall-ticket lookup.',
    sourceUrl: 'https://gist.edu.in/gist/examinations/',
    sourceLabel: 'Examination Section',
  },
  {
    id: 'gist-exams',
    title: 'GIST Examination Cell',
    content: 'The GIST Examination Cell coordinates midterm, end, practical and university examinations, prepares consolidated results, guides students on examination matters, handles examination grievances, and maintains marks and examination records. The page states that two notice boards in the quadrangle display circulars, timetables and room allotments.',
    sourceUrl: 'https://gist.edu.in/gist/examinations/',
    sourceLabel: 'Examination Section',
  },
  {
    id: 'gist-mtech-timetable',
    title: 'M.Tech August 2026 examination timetables',
    content: 'The GIST notice board links the official M.Tech I and II Semester PRG25 Regular and Supplementary Examinations August 2026 Time Tables PDF.',
    sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/08/M.Tech-I-II-Semester-PRG25-Regular-and-Supplementary-Examinations-Aug-2026-Time-Tables.pdf',
    sourceLabel: 'Official Timetable PDF',
  },
  {
    id: 'gist-mooc-notice',
    title: 'B.Tech August 2026 supplementary MOOCs notification',
    content: 'The official August 2026 notification covers B.Tech III-I, III-II and IV-I supplementary MOOC examinations for listed regular and lateral-entry batches. It states a minimum 40% internal-marks eligibility condition for MOOC courses, a registration deadline without late fee of 18 August 2026, and examination-related fees shown in the notification.',
    sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/08/Notifications-for-B.Tech-III-I-III-II-IV-I-Supple-MOOCs-Conventional-mode-August-2026-Exams.pdf',
    sourceLabel: 'Official Examination Notification',
  },
  {
    id: 'gist-btech-results-notification',
    title: 'I B.Tech May 2026 results declaration notification',
    content: 'The GIST notice board links the official I B.Tech I and II Semester RG23 Regular and Supplementary Examinations May 2026 Results Declaration PDF.',
    sourceUrl: 'https://gist.edu.in/gist/wp-content/uploads/2026/07/I-B.Tech-I-II-Semester-RG23-Regular-and-Supplementary-Examinations-May-2026-Results-Declaration.pdf',
    sourceLabel: 'Official Results Notification',
  },
  {
    id: 'gist-programmes',
    title: 'GIST programmes offered 2025-26',
    content: 'For 2025-26, GIST lists seven B.Tech disciplines: Computer Science and Engineering, CSE (Artificial Intelligence and Machine Learning), Artificial Intelligence and Data Science, Electronics and Communication Engineering, Electrical and Electronics Engineering, Mechanical Engineering, and Civil Engineering. It also lists two M.Tech disciplines and five diploma disciplines on the official programmes page.',
    sourceUrl: 'https://gist.edu.in/gist/programmes-offered/',
    sourceLabel: 'Programmes Offered',
  },
  {
    id: 'gist-calendar',
    title: 'GIST academic calendar',
    content: 'The official academic calendar page links B.Tech Academic Calendar 2026-27 and 2025-26, plus the M.Tech 2025-26 academic calendar.',
    sourceUrl: 'https://gist.edu.in/gist/academic-calendar/',
    sourceLabel: 'Academic Calendar',
  },
  {
    id: 'gist-campus',
    title: 'GIST campus and recognition',
    content: 'GIST was established in 2008. The official homepage says the campus is about 500 metres from the NH5 Nellore-Mumbai State Highway and the nearest railway station is 5 km away. It is approved by AICTE, affiliated to JNTUA, accredited by NBA and NAAC A Grade, and has autonomous status under Section 2(f) and 12(B) of the UGC Act for 2022-23 to 2031-32.',
    sourceUrl: 'https://gist.edu.in/gist/gist-home/',
    sourceLabel: 'GIST Homepage',
  },
  {
    id: 'gist-contact',
    title: 'GIST contact details',
    content: 'The official contact page lists the address as 3rd Mile, Nellore-Bombay Highway, Gangavaram (V), Kovur (M), S.P.S.R Nellore District, Andhra Pradesh, India - 524137. It lists principal@gist.edu.in and phone numbers 9912566220 and 9912445846.',
    sourceUrl: 'https://gist.edu.in/gist/contact-us/',
    sourceLabel: 'GIST Contact',
  },
]

export function retrieveCampusKnowledge(question: string) {
  const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 2)
  return campusKnowledgeBase.map((doc) => ({ doc, score: terms.reduce((score, term) => score + ((doc.title + ' ' + doc.content).toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score).filter(({ score }) => score > 0).slice(0, 3).map(({ doc }) => doc)
}
