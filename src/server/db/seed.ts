import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { hashPassword } from '../auth/crypto'
import { addisDateOffset, currentReportTerm, TIMETABLE_PERIODS } from '~/lib/utils'
import { db } from './index'
import {
  absenceRequests,
  announcements,
  applications,
  assignments,
  attendance,
  behaviourIncidents,
  classes,
  downloads,
  events,
  feeInvoices,
  galleryItems,
  gradeLevels,
  gradeRecords,
  guardians,
  jobs,
  messages,
  newsPosts,
  settings,
  staffProfiles,
  students,
  subjects,
  timetableSlots,
  users,
} from './schema'

const YEAR = '2026-27'

const EXTRA_SUBJECTS = [
  { id: 'sub-phy10', classId: 'class-g10', teacherId: 'user-teacher', nameEn: 'Physics', nameAm: 'ፊዚክስ', nameOm: 'Fiiziksii' },
  { id: 'sub-pe10', classId: 'class-g10', teacherId: 'user-teacher-2', nameEn: 'PE', nameAm: 'የሰውነት ማጎልመሻ', nameOm: 'Ispoortii' },
  { id: 'sub-amh6', classId: 'class-g6', teacherId: 'user-teacher-2', nameEn: 'Amharic', nameAm: 'አማርኛ', nameOm: 'Amaariffaa' },
  { id: 'sub-pe6', classId: 'class-g6', teacherId: 'user-teacher-3', nameEn: 'PE', nameAm: 'የሰውነት ማጎልመሻ', nameOm: 'Ispoortii' },
]

function rotate<T>(items: T[], offset: number, count: number) {
  return Array.from({ length: count }, (_, i) => items[(i + offset) % items.length])
}

function weekFor(classKey: string, classId: string, days: string[][], rooms: Record<string, string>) {
  return days.flatMap((subjects, day) =>
    subjects.map((subjectId, period) => ({
      id: `tt-${classKey}-${day}-${period}`,
      classId,
      subjectId,
      dayOfWeek: day,
      startTime: TIMETABLE_PERIODS[period].startTime,
      endTime: TIMETABLE_PERIODS[period].endTime,
      room: rooms[subjectId] ?? 'Room',
    })),
  )
}

function weekTimetableSlots() {
  const g10 = ['sub-bio', 'sub-chem', 'sub-math10', 'sub-eng10', 'sub-phy10', 'sub-pe10']
  const g6 = ['sub-eng6', 'sub-math6', 'sub-sci6', 'sub-ss6', 'sub-amh6', 'sub-pe6']
  const g1 = ['sub-lit1', 'sub-num1']
  const kg = ['sub-play']
  return [
    ...weekFor(
      'g10',
      'class-g10',
      [0, 1, 2, 3, 4].map((day) => rotate(g10, day, 6)),
      { 'sub-bio': 'Lab 1', 'sub-chem': 'Lab 2', 'sub-math10': 'B12', 'sub-eng10': 'B12', 'sub-phy10': 'Lab 1', 'sub-pe10': 'Gym' },
    ),
    ...weekFor(
      'g6',
      'class-g6',
      [0, 1, 2, 3, 4].map((day) => rotate(g6, day, 6)),
      { 'sub-eng6': 'A6', 'sub-math6': 'A6', 'sub-sci6': 'A6', 'sub-ss6': 'A6', 'sub-amh6': 'A6', 'sub-pe6': 'Gym' },
    ),
    ...weekFor(
      'g1',
      'class-g1',
      [0, 1, 2, 3, 4].map((day) => rotate(g1, day, 6)),
      { 'sub-lit1': 'A1', 'sub-num1': 'A1' },
    ),
    ...weekFor(
      'kg',
      'class-kg',
      [0, 1, 2, 3, 4].map((day) => rotate(kg, day, 6)),
      { 'sub-play': 'KG' },
    ),
  ]
}

const GALLERY_SEED = [
  { id: 'gal-1', titleEn: 'Science fair', titleAm: 'የሳይንስ ኤግዚቢሽን', titleOm: 'Agarsiisa saayinsii', category: 'Academics', imageUrl: '/media/lab.jpg' },
  { id: 'gal-2', titleEn: 'Library garden', titleAm: 'የቤተ መጻሕፍት የአትክልት ስፍራ', titleOm: 'Giddugalee mana kitaabaa', category: 'Campus', imageUrl: '/media/books.jpg' },
  { id: 'gal-3', titleEn: 'Football cup', titleAm: 'የእግር ኳስ ዋንጫ', titleOm: 'Kooppii kubbaa miilaa', category: 'Sports', imageUrl: '/media/sports.jpg' },
  { id: 'gal-4', titleEn: 'Music rehearsal', titleAm: 'የሙዚቃ ልምምድ', titleOm: 'Shaakala muuziqaa', category: 'Arts', imageUrl: '/media/music.jpg' },
  { id: 'gal-5', titleEn: 'Early years play', titleAm: 'የመጀመሪያ ዓመታት ጨዋታ', titleOm: 'Taphii ijoollee xiqqoo', category: 'Early years', imageUrl: '/media/storytime.jpg' },
  { id: 'gal-6', titleEn: 'Morning assembly', titleAm: 'የጠዋት ስብሰባ', titleOm: 'Walgahii ganamaa', category: 'Campus', imageUrl: '/media/assembly.jpg' },
  { id: 'gal-7', titleEn: 'Classroom', titleAm: 'ክፍል', titleOm: 'Kutaa barnootaa', category: 'Academics', imageUrl: '/media/classroom.jpg' },
  { id: 'gal-8', titleEn: 'Sports day', titleAm: 'የስፖርት ቀን', titleOm: 'Guyyaa ispportii', category: 'Sports', imageUrl: '/media/pitch.jpg' },
  { id: 'gal-9', titleEn: 'Art studio', titleAm: 'የጥበብ ስቱዲዮ', titleOm: 'Istuudiyoo aartii', category: 'Arts', imageUrl: '/media/arts.jpg' },
  { id: 'gal-10', titleEn: 'Courtyard', titleAm: 'የውስጥ ግቢ', titleOm: 'Dirree kampasii', category: 'Campus', imageUrl: '/media/campus.jpg' },
  { id: 'gal-11', titleEn: 'Graduation', titleAm: 'ምረቃ', titleOm: 'Eebbifannaa', category: 'Campus', imageUrl: '/media/courtyard.jpg' },
  { id: 'gal-12', titleEn: 'Quiet library', titleAm: 'ጸጥ ያለ ቤተ መጻሕፍት', titleOm: 'Mana kitaabaa calii', category: 'Academics', imageUrl: '/media/library.jpg' },
  { id: 'gal-13', titleEn: 'Campus walk', titleAm: 'የግቢ ጉዞ', titleOm: 'Deemsa kampasii', category: 'Campus', imageUrl: '/media/care.jpg' },
  { id: 'gal-14', titleEn: 'Faculty', titleAm: 'መምህራን', titleOm: 'Barsiisotni', category: 'Campus', imageUrl: '/media/principal.jpg' },
]

export async function ensureSeed() {
  const existing = await db.select({ id: settings.id }).from(settings).limit(1)
  if (existing.length) {
    await remapLocalImages()
    return
  }

  await db.insert(settings).values({
    id: 'school',
    alertEnabled: false,
    alertEn: '',
    alertAm: '',
    alertOm: '',
    phone: '011 416 2200',
    email: 'hello@eis.school',
    addressEn: 'Bole Road, Addis Ababa, Ethiopia',
    addressAm: 'ቦሌ መንገድ፣ አዲስ አበባ፣ ኢትዮጵያ',
    addressOm: 'Daandii Boolee, Finfinnee, Itoophiyaa',
  })

  const levels = [
    { id: 'kg', code: 'KG', nameEn: 'Kindergarten', nameAm: 'መዋለ ሕጻናት', nameOm: 'Kutaa daa’immanii', band: 'early', sortOrder: 0 },
    { id: 'g1', code: 'G1', nameEn: 'Grade 1', nameAm: '1ኛ ክፍል', nameOm: 'Kutaa 1ffaa', band: 'elementary', sortOrder: 1 },
    { id: 'g2', code: 'G2', nameEn: 'Grade 2', nameAm: '2ኛ ክፍል', nameOm: 'Kutaa 2ffaa', band: 'elementary', sortOrder: 2 },
    { id: 'g3', code: 'G3', nameEn: 'Grade 3', nameAm: '3ኛ ክፍል', nameOm: 'Kutaa 3ffaa', band: 'elementary', sortOrder: 3 },
    { id: 'g4', code: 'G4', nameEn: 'Grade 4', nameAm: '4ኛ ክፍል', nameOm: 'Kutaa 4ffaa', band: 'elementary', sortOrder: 4 },
    { id: 'g5', code: 'G5', nameEn: 'Grade 5', nameAm: '5ኛ ክፍል', nameOm: 'Kutaa 5ffaa', band: 'elementary', sortOrder: 5 },
    { id: 'g6', code: 'G6', nameEn: 'Grade 6', nameAm: '6ኛ ክፍል', nameOm: 'Kutaa 6ffaa', band: 'middle', sortOrder: 6 },
    { id: 'g7', code: 'G7', nameEn: 'Grade 7', nameAm: '7ኛ ክፍል', nameOm: 'Kutaa 7ffaa', band: 'middle', sortOrder: 7 },
    { id: 'g8', code: 'G8', nameEn: 'Grade 8', nameAm: '8ኛ ክፍል', nameOm: 'Kutaa 8ffaa', band: 'middle', sortOrder: 8 },
    { id: 'g9', code: 'G9', nameEn: 'Grade 9', nameAm: '9ኛ ክፍል', nameOm: 'Kutaa 9ffaa', band: 'high', sortOrder: 9 },
    { id: 'g10', code: 'G10', nameEn: 'Grade 10', nameAm: '10ኛ ክፍል', nameOm: 'Kutaa 10ffaa', band: 'high', sortOrder: 10 },
    { id: 'g11', code: 'G11', nameEn: 'Grade 11', nameAm: '11ኛ ክፍል', nameOm: 'Kutaa 11ffaa', band: 'high', sortOrder: 11 },
    { id: 'g12', code: 'G12', nameEn: 'Grade 12', nameAm: '12ኛ ክፍል', nameOm: 'Kutaa 12ffaa', band: 'high', sortOrder: 12 },
  ]
  await db.insert(gradeLevels).values(levels)

  const adminHash = hashPassword('admin123')
  const teacherHash = hashPassword('teacher123')
  const parentHash = hashPassword('parent123')
  const studentHash = hashPassword('student123')

  await db.insert(users).values([
    { id: 'user-admin', email: 'admin@eis.school', passwordHash: adminHash, fullName: 'Liya Tesfaye', phone: '0911223344', role: 'admin' },
    { id: 'user-teacher', email: 'teacher@eis.school', passwordHash: teacherHash, fullName: 'Dawit Bekele', phone: '0911556677', role: 'teacher' },
    { id: 'user-teacher-2', email: 'hanna@eis.school', passwordHash: teacherHash, fullName: 'Hanna Mekonnen', phone: '0911889900', role: 'teacher' },
    { id: 'user-teacher-3', email: 'math@eis.school', passwordHash: teacherHash, fullName: 'Solomon Abebe', phone: '0911447788', role: 'teacher' },
    { id: 'user-parent', email: 'parent@eis.school', passwordHash: parentHash, fullName: 'Sara Hailu', phone: '0922113344', role: 'parent' },
    { id: 'user-student', email: 'student@eis.school', passwordHash: studentHash, fullName: 'Yonas Sara', phone: '0933445566', role: 'student' },
  ])

  await db.insert(staffProfiles).values([
    {
      id: 'staff-liya',
      userId: 'user-admin',
      titleEn: 'Principal',
      titleAm: 'ርዕሰ መምህር',
      titleOm: 'Itti gaafatamaa mana barumsaa',
      department: 'Leadership',
      bioEn: 'Leads Ethiopia International School with a focus on Cambridge-aligned learning and student wellbeing.',
      bioAm: 'ሆራይዘን አካዳሚን በሁለት ቋንቋ ትምህርት እና በተማሪ ደህንነት ያተኩራል።',
      bioOm: 'Akademii Horizon barnoota afaan lamaanii fi nageenya barattootaa irratti xiyyeeffachuun hooggantee.',
      featured: true,
    },
    {
      id: 'staff-dawit',
      userId: 'user-teacher',
      titleEn: 'Head of Sciences · Grade 10 homeroom',
      titleAm: 'የሳይንስ ክፍል ኃላፊ · 10ኛ ክፍል መምህር',
      titleOm: 'Itti gaafatamaa saayinsii · barsiisaa kutaa 10',
      department: 'Sciences',
      bioEn: 'Teaches biology and chemistry, and coaches the science club.',
      bioAm: 'ባዮሎጂ እና ኬሚስትሪ ያስተምራል፣ የሳይንስ ክለብ አሰልጣኝም ነው።',
      bioOm: 'Baayoloojii fi keemistirii barsiisa; garee saayinsii leenjisa.',
      featured: true,
    },
    {
      id: 'staff-hanna',
      userId: 'user-teacher-2',
      titleEn: 'Grade 6 homeroom · English',
      titleAm: '6ኛ ክፍል መምህር · እንግሊዝኛ',
      titleOm: 'Barsiisaa kutaa 6 · Ingiliffaa',
      department: 'Languages',
      bioEn: 'Builds confident readers and writers from middle school through debate club.',
      bioAm: 'ከመካከለኛ ደረጃ ጀምሮ በንባብ፣ ጽሑፍ እና ክርክር ክለብ ተማሪዎችን ታበረታታለች።',
      bioOm: 'Dubbistoota fi barreessitoota ofitti amanan ijaarti; garee marii hooggantee.',
      featured: true,
    },
    {
      id: 'staff-solomon',
      userId: 'user-teacher-3',
      titleEn: 'Mathematics · Grades 6 and 10',
      titleAm: 'ሒሳብ · 6ኛ እና 10ኛ ክፍል',
      titleOm: 'Herrega · kutaa 6 fi 10',
      department: 'Mathematics',
      bioEn: 'Teaches mathematics across middle and upper school.',
      bioAm: 'ከመካከለኛ እስከ ከፍተኛ ደረጃ ሒሳብ ያስተምራል።',
      bioOm: 'Herrega kutaa giddu-galeessaa fi ol’aanaa barsiisa.',
      featured: true,
    },
  ])

  await db.insert(classes).values([
    { id: 'class-kg', name: 'KG-A', gradeLevelId: 'kg', teacherId: 'user-teacher-2', year: YEAR },
    { id: 'class-g1', name: '1-A', gradeLevelId: 'g1', teacherId: 'user-teacher-2', year: YEAR },
    { id: 'class-g6', name: '6-A', gradeLevelId: 'g6', teacherId: 'user-teacher-2', year: YEAR },
    { id: 'class-g10', name: '10-A', gradeLevelId: 'g10', teacherId: 'user-teacher', year: YEAR },
  ])

  const studentRows = [
    { id: 'stu-yonas', userId: 'user-student', firstName: 'Yonas', lastName: 'Sara', studentNumber: 'HA-1001', dateOfBirth: '2010-04-12', gender: 'M', gradeLevelId: 'g10', classId: 'class-g10' },
    { id: 'stu-marta', userId: null, firstName: 'Marta', lastName: 'Sara', studentNumber: 'HA-1002', dateOfBirth: '2014-09-03', gender: 'F', gradeLevelId: 'g6', classId: 'class-g6' },
    { id: 'stu-3', userId: null, firstName: 'Abel', lastName: 'Tadesse', studentNumber: 'HA-1003', dateOfBirth: '2010-01-22', gender: 'M', gradeLevelId: 'g10', classId: 'class-g10' },
    { id: 'stu-4', userId: null, firstName: 'Hana', lastName: 'Kebede', studentNumber: 'HA-1004', dateOfBirth: '2010-07-18', gender: 'F', gradeLevelId: 'g10', classId: 'class-g10' },
    { id: 'stu-5', userId: null, firstName: 'Kidus', lastName: 'Alemu', studentNumber: 'HA-1005', dateOfBirth: '2010-11-02', gender: 'M', gradeLevelId: 'g10', classId: 'class-g10' },
    { id: 'stu-6', userId: null, firstName: 'Ruth', lastName: 'Girma', studentNumber: 'HA-1006', dateOfBirth: '2010-03-09', gender: 'F', gradeLevelId: 'g10', classId: 'class-g10' },
    { id: 'stu-7', userId: null, firstName: 'Nahom', lastName: 'Worku', studentNumber: 'HA-1007', dateOfBirth: '2014-02-14', gender: 'M', gradeLevelId: 'g6', classId: 'class-g6' },
    { id: 'stu-8', userId: null, firstName: 'Selam', lastName: 'Desta', studentNumber: 'HA-1008', dateOfBirth: '2014-06-21', gender: 'F', gradeLevelId: 'g6', classId: 'class-g6' },
    { id: 'stu-9', userId: null, firstName: 'Biniam', lastName: 'Assefa', studentNumber: 'HA-1009', dateOfBirth: '2014-08-30', gender: 'M', gradeLevelId: 'g6', classId: 'class-g6' },
    { id: 'stu-10', userId: null, firstName: 'Meron', lastName: 'Yilma', studentNumber: 'HA-1010', dateOfBirth: '2014-12-05', gender: 'F', gradeLevelId: 'g6', classId: 'class-g6' },
    { id: 'stu-11', userId: null, firstName: 'Elias', lastName: 'Negash', studentNumber: 'HA-1011', dateOfBirth: '2019-05-11', gender: 'M', gradeLevelId: 'g1', classId: 'class-g1' },
    { id: 'stu-12', userId: null, firstName: 'Betty', lastName: 'Solomon', studentNumber: 'HA-1012', dateOfBirth: '2019-09-19', gender: 'F', gradeLevelId: 'g1', classId: 'class-g1' },
    { id: 'stu-13', userId: null, firstName: 'Robel', lastName: 'Haile', studentNumber: 'HA-1013', dateOfBirth: '2019-01-08', gender: 'M', gradeLevelId: 'g1', classId: 'class-g1' },
    { id: 'stu-14', userId: null, firstName: 'Lily', lastName: 'Fikru', studentNumber: 'HA-1014', dateOfBirth: '2019-04-27', gender: 'F', gradeLevelId: 'g1', classId: 'class-g1' },
    { id: 'stu-15', userId: null, firstName: 'Noah', lastName: 'Berhanu', studentNumber: 'HA-1015', dateOfBirth: '2019-10-15', gender: 'M', gradeLevelId: 'g1', classId: 'class-g1' },
    { id: 'stu-16', userId: null, firstName: 'Amina', lastName: 'Omar', studentNumber: 'HA-1016', dateOfBirth: '2021-03-02', gender: 'F', gradeLevelId: 'kg', classId: 'class-kg' },
    { id: 'stu-17', userId: null, firstName: 'Samuel', lastName: 'Teshome', studentNumber: 'HA-1017', dateOfBirth: '2021-06-16', gender: 'M', gradeLevelId: 'kg', classId: 'class-kg' },
    { id: 'stu-18', userId: null, firstName: 'Maya', lastName: 'Bekele', studentNumber: 'HA-1018', dateOfBirth: '2021-08-24', gender: 'F', gradeLevelId: 'kg', classId: 'class-kg' },
    { id: 'stu-19', userId: null, firstName: 'Jonas', lastName: 'Getachew', studentNumber: 'HA-1019', dateOfBirth: '2021-11-11', gender: 'M', gradeLevelId: 'kg', classId: 'class-kg' },
    { id: 'stu-20', userId: null, firstName: 'Hawi', lastName: 'Lemma', studentNumber: 'HA-1020', dateOfBirth: '2021-02-07', gender: 'F', gradeLevelId: 'kg', classId: 'class-kg' },
  ]
  await db.insert(students).values(studentRows)

  await db.insert(guardians).values([
    { id: 'g-yonas', userId: 'user-parent', studentId: 'stu-yonas', relationship: 'Mother' },
    { id: 'g-marta', userId: 'user-parent', studentId: 'stu-marta', relationship: 'Mother' },
  ])

  const subjectDefs = [
    { classId: 'class-g10', items: [
      { id: 'sub-bio', teacherId: 'user-teacher', nameEn: 'Biology', nameAm: 'ባዮሎጂ', nameOm: 'Baayoloojii' },
      { id: 'sub-chem', teacherId: 'user-teacher', nameEn: 'Chemistry', nameAm: 'ኬሚስትሪ', nameOm: 'Keemistirii' },
      { id: 'sub-math10', teacherId: 'user-teacher-3', nameEn: 'Mathematics', nameAm: 'ሒሳብ', nameOm: 'Herrega' },
      { id: 'sub-eng10', teacherId: 'user-teacher-2', nameEn: 'English', nameAm: 'እንግሊዝኛ', nameOm: 'Ingiliffaa' },
      { id: 'sub-phy10', teacherId: 'user-teacher', nameEn: 'Physics', nameAm: 'ፊዚክስ', nameOm: 'Fiiziksii' },
      { id: 'sub-pe10', teacherId: 'user-teacher-2', nameEn: 'PE', nameAm: 'የሰውነት ማጎልመሻ', nameOm: 'Ispoortii' },
    ]},
    { classId: 'class-g6', items: [
      { id: 'sub-eng6', teacherId: 'user-teacher-2', nameEn: 'English', nameAm: 'እንግሊዝኛ', nameOm: 'Ingiliffaa' },
      { id: 'sub-math6', teacherId: 'user-teacher-3', nameEn: 'Mathematics', nameAm: 'ሒሳብ', nameOm: 'Herrega' },
      { id: 'sub-sci6', teacherId: 'user-teacher', nameEn: 'Science', nameAm: 'ሳይንስ', nameOm: 'Saayinsii' },
      { id: 'sub-ss6', teacherId: 'user-teacher-2', nameEn: 'Social studies', nameAm: 'ማህበራዊ ትምህርት', nameOm: 'Barnoota hawaasaa' },
      { id: 'sub-amh6', teacherId: 'user-teacher-2', nameEn: 'Amharic', nameAm: 'አማርኛ', nameOm: 'Amaariffaa' },
      { id: 'sub-pe6', teacherId: 'user-teacher-3', nameEn: 'PE', nameAm: 'የሰውነት ማጎልመሻ', nameOm: 'Ispoortii' },
    ]},
    { classId: 'class-g1', items: [
      { id: 'sub-lit1', teacherId: 'user-teacher-2', nameEn: 'Literacy', nameAm: 'ንባብና ጽሑፍ', nameOm: 'Dubbisuu fi barreessuu' },
      { id: 'sub-num1', teacherId: 'user-teacher-2', nameEn: 'Numeracy', nameAm: 'ቁጥር', nameOm: 'Lakkoofsa' },
    ]},
    { classId: 'class-kg', items: [
      { id: 'sub-play', teacherId: 'user-teacher-2', nameEn: 'Play & discovery', nameAm: 'ጨዋታ እና ግኝት', nameOm: 'Taphachuu fi argachuu' },
    ]},
  ]
  await db.insert(subjects).values(subjectDefs.flatMap((g) => g.items.map((s) => ({ ...s, classId: g.classId }))))

  await db.insert(timetableSlots).values(weekTimetableSlots())

  await db.insert(assignments).values([
    { id: 'asg-1', classId: 'class-g10', subjectId: 'sub-bio', title: 'Cell structure worksheet', description: 'Label the plant and animal cell diagrams and answer questions 1–8.', dueDate: addisDateOffset(5) },
    { id: 'asg-2', classId: 'class-g10', subjectId: 'sub-math10', title: 'Quadratic equations set B', description: 'Complete problems 4–12. Show working.', dueDate: addisDateOffset(3) },
    { id: 'asg-3', classId: 'class-g6', subjectId: 'sub-eng6', title: 'Book report: The Giver', description: 'Write two pages on theme and a favourite character.', dueDate: addisDateOffset(7) },
  ])

  const g10 = studentRows.filter((s) => s.classId === 'class-g10')
  await db.insert(gradeRecords).values(
    g10.flatMap((s, i) => [
      { id: `gr-${s.id}-bio`, studentId: s.id, subjectId: 'sub-bio', assignmentId: 'asg-1', term: 'Term 1', score: 78 + (i % 5) * 3, maxScore: 100 },
      { id: `gr-${s.id}-math`, studentId: s.id, subjectId: 'sub-math10', assignmentId: 'asg-2', term: 'Term 1', score: 72 + (i % 4) * 4, maxScore: 100 },
      { id: `gr-${s.id}-eng`, studentId: s.id, subjectId: 'sub-eng10', assignmentId: null, term: 'Term 1', score: 81 + (i % 3) * 2, maxScore: 100 },
      { id: `gr-${s.id}-bio-t2`, studentId: s.id, subjectId: 'sub-bio', assignmentId: null, term: 'Term 2', score: 80 + (i % 5) * 2, maxScore: 100 },
      { id: `gr-${s.id}-math-t2`, studentId: s.id, subjectId: 'sub-math10', assignmentId: null, term: 'Term 2', score: 74 + (i % 4) * 3, maxScore: 100 },
      { id: `gr-${s.id}-eng-t2`, studentId: s.id, subjectId: 'sub-eng10', assignmentId: null, term: 'Term 2', score: 83 + (i % 3), maxScore: 100 },
    ]),
  )
  const g6 = studentRows.filter((s) => s.classId === 'class-g6')
  await db.insert(gradeRecords).values(
    g6.flatMap((s, i) => [
      {
        id: `gr-${s.id}-eng`,
        studentId: s.id,
        subjectId: 'sub-eng6',
        assignmentId: 'asg-3',
        term: 'Term 1',
        score: 80 + (i % 6),
        maxScore: 100,
      },
      {
        id: `gr-${s.id}-eng-t2`,
        studentId: s.id,
        subjectId: 'sub-eng6',
        assignmentId: null,
        term: 'Term 2',
        score: 82 + (i % 5),
        maxScore: 100,
      },
    ]),
  )

  const dates = [addisDateOffset(-4), addisDateOffset(-3), addisDateOffset(-2), addisDateOffset(-1), addisDateOffset(0)]
  const attRows = studentRows.flatMap((s) =>
    dates.map((date, di) => ({
      id: `att-${s.id}-${date}`,
      studentId: s.id,
      classId: s.classId!,
      date,
      status: s.id === 'stu-marta' && di === 2 ? 'absent' : di === 1 && s.id === 'stu-3' ? 'late' : 'present',
      note: null as string | null,
    })),
  )
  await db.insert(attendance).values(attRows)

  await db.insert(announcements).values([
    {
      id: 'ann-1',
      titleEn: 'Sports day this Friday',
      titleAm: 'የስፖርት ቀን በዚህ አርብ',
      titleOm: 'Guyyaa ispoortii Jimaata kana',
      bodyEn: 'All classes meet on the south field at 08:30. Bring a water bottle and house colour.',
      bodyAm: 'ሁሉም ክፍሎች ከጠዋቱ 8:30 በደቡብ ሜዳ ይሰበሰባሉ። ውሃ እና የቤት ቀለም ይዘው ይምጡ።',
      bodyOm: 'Kutaaleen hundi sa’aatii 8:30 dirree kibbaa irratti wal ga’u. Dambalii bishaanii fi halluu mana fudhadhaa.',
      audience: 'all',
      publishedAt: addisDateOffset(-1),
      createdBy: 'user-admin',
    },
    {
      id: 'ann-2',
      titleEn: 'Parent–teacher conferences',
      titleAm: 'የወላጅ–መምህር ስብሰባ',
      titleOm: 'Mariin maatii–barsiisaa',
      bodyEn: 'Book a 15-minute slot next week through the parent portal.',
      bodyAm: 'በሚቀጥለው ሳምንት በወላጅ ፖርታል 15 ደቂቃ ቀጠሮ ይያዙ።',
      bodyOm: 'Torban dhufu keessatti daqiiqaa 15 portaala maatii irratti qabadhaa.',
      audience: 'parents',
      publishedAt: addisDateOffset(-2),
      createdBy: 'user-admin',
    },
  ])

  await db.insert(newsPosts).values([
    {
      id: 'news-1',
      slug: 'science-fair-winners',
      titleEn: 'Grade 10 science fair winners',
      titleAm: 'የ10ኛ ክፍል የሳይንስ ኤግዚቢሽን አሸናፊዎች',
      titleOm: 'Mo’attoonni agarsiisa saayinsii kutaa 10',
      excerptEn: 'Students presented water-filter prototypes to a panel of visiting engineers.',
      excerptAm: 'ተማሪዎች የውሃ ማጣሪያ ሞዴሎችን ለጎብኝ መሐንዲሶች አቀረቡ።',
      excerptOm: 'Barattoonni moodeela filtara bishaanii injiinariiwota daawwattootaaf dhiheessan.',
      bodyEn:
        'Ethiopia International School hosted its annual science fair in the south hall. Grade 10 teams demonstrated solar stills, compost sensors, and a low-cost water filter. Congratulations to Yonas Sara and Abel Tadesse, whose filter design took first place.',
      bodyAm:
        'ሆራይዘን አካዳሚ ዓመታዊ የሳይንስ ኤግዚቢሽኑን በደቡብ አዳራሽ አካሄደ። የ10ኛ ክፍል ቡድኖች የፀሐይ ማጣሪያ፣ የኮምፖስት ዳሳሽ እና ርካሽ የውሃ ማጣሪያ አሳዩ። የመጀመሪያ ስፍራን ለያዙት ዮናስ ሳራ እና አቤል ታደሰ እንኳን ደስ አለዎት።',
      bodyOm:
        'Akademiin Horizon agarsiisa saayinsii waggaa waggaa keessatti gaggeesse. Gareen kutaa 10 filtara bishaanii gatii gadi aanaa agarsiisan. Yonas Sara fi Abel Tadesse bakka jalqabaa fudhatan.',
      publishedAt: addisDateOffset(-6),
      imageUrl: '/media/lab.jpg',
    },
    {
      id: 'news-2',
      slug: 'new-library-wing',
      titleEn: 'New library wing opens',
      titleAm: 'አዲስ የቤተ መጻሕፍት ክንፍ ተከፈተ',
      titleOm: 'Kutaan haaraan mana kitaabaa bane',
      excerptEn: 'Quiet study rooms and a bilingual picture-book corner for the early years.',
      excerptAm: 'ጸጥ ያሉ የጥናት ክፍሎች እና ለመጀመሪያ ዓመታት የሁለት ቋንቋ የስዕል መጻሕፍት ማእዘን።',
      excerptOm: 'Kutaa qorannoo tasgabbaa’aa fi gola kitaaba suuraa afaan lamaa ijoollee xiqqoo irratti.',
      bodyEn:
        'Families toured the new library wing on Saturday. The space includes 8,000 volumes, two seminar rooms, and a reading garden. Opening hours are 07:30–17:00 on school days.',
      bodyAm:
        'ቤተሰቦች ቅዳሜ አዲሱን የቤተ መጻሕፍት ክንፍ ጎበኙ። 8,000 መጻሕፍት፣ ሁለት የሴሚናር ክፍሎች እና የንባብ የአትክልት ስፍራ አሉ። በትምህርት ቀናት ከ7:30–17:00 ክፍት ነው።',
      bodyOm:
        'Maatiin kutaa haaraa mana kitaabaa Sanbata daawwatan. Kitaabota 8,000, kutaa seminar 2, fi giddugalee dubbisuu qaba. Guyyaa barnootaa 07:30–17:00 banaadha.',
      publishedAt: addisDateOffset(-12),
      imageUrl: '/media/library.jpg',
    },
    {
      id: 'news-3',
      slug: 'football-cup',
      titleEn: 'House football cup goes to Nile',
      titleAm: 'የቤት እግር ኳስ ዋንጫ ለናይል',
      titleOm: 'Kooppii kubbaa miilaa mana Nileef kenname',
      excerptEn: 'A late goal sealed the inter-house championship on a dusty Friday afternoon.',
      excerptAm: 'በአርብ ከሰዓት በኋላ የመጨረሻ ግብ የቤት ሻምፒዮናውን ቋጨ።',
      excerptOm: 'Goolii dhumaa Jimaata galgala kooppii mana gidduu cufee.',
      bodyEn: 'Nile House beat Awash 2–1. Thank you to families who came to cheer and to the athletics team for running a fair tournament.',
      bodyAm: 'ናይል ሃውስ አዋሽን 2–1 አሸነፈ። የመጡ ቤተሰቦችን እና ውድድሩን ያካሄደውን የአትሌቲክስ ቡድን እናመሰግናለን።',
      bodyOm: 'Mana Naayil Awash 2–1 mo’ate. Maatii jajjabeessitootaaf galata.',
      publishedAt: addisDateOffset(-18),
      imageUrl: '/media/pitch.jpg',
    },
  ])

  await db.insert(events).values([
    {
      id: 'ev-1',
      titleEn: 'Open campus Saturday',
      titleAm: 'ክፍት ግቢ ቅዳሜ',
      titleOm: 'Kampasii banaa Sanbata',
      descriptionEn: 'Tour classrooms, meet teachers, and sit in on a sample lesson.',
      descriptionAm: 'ክፍሎችን ይጎብኙ፣ መምህራንን ያግኙ፣ የናሙና ትምህርት ይከታተሉ።',
      descriptionOm: 'Kutaa daawwadhaa, barsiisota argadhaa, barnoota fakkeenyaa hordofaa.',
      startAt: `${addisDateOffset(5)}T10:00:00`,
      endAt: `${addisDateOffset(5)}T13:00:00`,
      locationEn: 'Main gate, Bole campus',
      locationAm: 'ዋና በር፣ ቦሌ ግቢ',
      locationOm: 'Balbala ijoo, kampasii Boolee',
    },
    {
      id: 'ev-2',
      titleEn: 'Sports day',
      titleAm: 'የስፖርት ቀን',
      titleOm: 'Guyyaa ispoortii',
      descriptionEn: 'Track, field, and house games for every grade.',
      descriptionAm: 'ለሁሉም ክፍሎች ሩጫ፣ ሜዳ እና የቤት ጨዋታዎች።',
      descriptionOm: 'Fiigicha, dirree, fi taphoota mana hundaaf.',
      startAt: `${addisDateOffset(3)}T08:30:00`,
      endAt: `${addisDateOffset(3)}T14:00:00`,
      locationEn: 'South field',
      locationAm: 'ደቡብ ሜዳ',
      locationOm: 'Dirree kibbaa',
    },
    {
      id: 'ev-3',
      titleEn: 'Arts showcase',
      titleAm: 'የጥበብ ትርኢት',
      titleOm: 'Agarsiisa aartii',
      descriptionEn: 'Music, drama, and gallery work from the term.',
      descriptionAm: 'የዚህ ወቅት ሙዚቃ፣ ቲያትር እና የእይታ ጥበብ።',
      descriptionOm: 'Muuziqaa, tiyaatiraa, fi aartii ijaarsaa termii kanaa.',
      startAt: `${addisDateOffset(12)}T16:00:00`,
      endAt: `${addisDateOffset(12)}T18:30:00`,
      locationEn: 'Auditorium',
      locationAm: 'አዳራሽ',
      locationOm: 'Oditooriyamii',
    },
  ])

  await db.insert(galleryItems).values(GALLERY_SEED)

  await db.insert(applications).values({
    id: nanoid(),
    childName: 'Naomi Desta',
    parentName: 'Helen Desta',
    email: 'helen.desta@example.com',
    phone: '0912001122',
    gradeApplying: 'Grade 1',
    notes: 'Transferring from a neighbourhood preschool.',
    status: 'pending',
    createdAt: new Date(),
  })

  await db.insert(messages).values([
    {
      id: 'msg-1',
      fromUserId: 'user-teacher',
      toUserId: 'user-parent',
      studentId: 'stu-yonas',
      subject: 'Biology lab next week',
      body: 'Yonas is well prepared for the lab practical. Please remind him to bring closed shoes on Wednesday.',
      createdAt: new Date(Date.now() - 2 * 86400000),
      readAt: null,
    },
    {
      id: 'msg-2',
      fromUserId: 'user-parent',
      toUserId: 'user-teacher-2',
      studentId: 'stu-marta',
      subject: 'Absence last Thursday',
      body: 'Marta had a dental appointment. She will submit the English homework tomorrow.',
      createdAt: new Date(Date.now() - 86400000),
      readAt: null,
    },
  ])

  await db.insert(feeInvoices).values([
    { id: 'fee-1', studentId: 'stu-yonas', title: 'Term 1 tuition', amountEtb: 28500, dueDate: addisDateOffset(10), status: 'unpaid' },
    { id: 'fee-2', studentId: 'stu-marta', title: 'Term 1 tuition', amountEtb: 24500, dueDate: addisDateOffset(-4), status: 'paid' },
    { id: 'fee-3', studentId: 'stu-yonas', title: 'Lab materials', amountEtb: 1200, dueDate: addisDateOffset(20), status: 'unpaid' },
  ])

  await db.insert(absenceRequests).values({
    id: 'abs-1',
    studentId: 'stu-marta',
    parentUserId: 'user-parent',
    fromDate: addisDateOffset(8),
    toDate: addisDateOffset(9),
    reason: 'Family travel to Hawassa.',
    status: 'pending',
  })

  await db.insert(downloads).values([
    { id: 'dl-1', titleEn: 'Student handbook 2026–27', titleAm: 'የተማሪ መመሪያ 2019 ዓ.ም', titleOm: 'Kitaaba qajeelfama barataa 2026–27', category: 'Policies', href: '/docs/student-handbook.txt' },
    { id: 'dl-2', titleEn: 'Term calendar', titleAm: 'የወቅት የቀን መቁጠሪያ', titleOm: 'Dhaha termii', category: 'Calendar', href: '/docs/term-calendar.txt' },
    { id: 'dl-3', titleEn: 'Uniform guide', titleAm: 'የደንብ ልብስ መመሪያ', titleOm: 'Qajeelfama uffataa', category: 'Policies', href: '/docs/uniform-guide.txt' },
  ])

  await db.insert(jobs).values([
    {
      id: 'job-1',
      titleEn: 'Middle school mathematics teacher',
      titleAm: 'የመካከለኛ ደረጃ የሒሳብ መምህር',
      titleOm: 'Barsiisaa herrega kutaa giddu-galeessaa',
      department: 'Mathematics',
      descriptionEn: 'Full-time role from August. Degree in mathematics or education required.',
      descriptionAm: 'ከነሐሴ ጀምሮ ሙሉ ሰዓት። በሒሳብ ወይም በትምህርት ዲግሪ ያስፈልጋል።',
      descriptionOm: 'Hojii yeroo guutuu Hagayya irraa. Digirii herrega ykn barnootaa barbaachisa.',
    },
    {
      id: 'job-2',
      titleEn: 'School nurse',
      titleAm: 'የትምህርት ቤት ነርስ',
      titleOm: 'Narsii mana barumsaa',
      department: 'Wellbeing',
      descriptionEn: 'Clinic coverage during school hours. Licensed nurse with paediatric experience preferred.',
      descriptionAm: 'በትምህርት ሰዓት ክሊኒክ። የህጻናት ልምድ ያለው ፈቃድ ያለው ነርስ ይመረጣል።',
      descriptionOm: 'Kilinika sa’aatii barnootaa. Narsii hayyama qabu, muuxannoo daa’immanii filatama.',
    },
  ])
}

const SUBJECT_TEACHERS: Array<{ id: string; teacherId: string }> = [
  { id: 'sub-bio', teacherId: 'user-teacher' },
  { id: 'sub-chem', teacherId: 'user-teacher' },
  { id: 'sub-math10', teacherId: 'user-teacher-3' },
  { id: 'sub-eng10', teacherId: 'user-teacher-2' },
  { id: 'sub-eng6', teacherId: 'user-teacher-2' },
  { id: 'sub-math6', teacherId: 'user-teacher-3' },
  { id: 'sub-sci6', teacherId: 'user-teacher' },
  { id: 'sub-ss6', teacherId: 'user-teacher-2' },
  { id: 'sub-lit1', teacherId: 'user-teacher-2' },
  { id: 'sub-num1', teacherId: 'user-teacher-2' },
  { id: 'sub-play', teacherId: 'user-teacher-2' },
]

export async function ensureStaffing() {
  const teacherHash = hashPassword('teacher123')
  const [mathTeacher] = await db.select({ id: users.id }).from(users).where(eq(users.id, 'user-teacher-3')).limit(1)
  if (!mathTeacher) {
    await db.insert(users).values({
      id: 'user-teacher-3',
      email: 'math@eis.school',
      passwordHash: teacherHash,
      fullName: 'Solomon Abebe',
      phone: '0911447788',
      role: 'teacher',
    })
  }

  const [mathStaff] = await db.select({ id: staffProfiles.id }).from(staffProfiles).where(eq(staffProfiles.id, 'staff-solomon')).limit(1)
  if (!mathStaff) {
    await db.insert(staffProfiles).values({
      id: 'staff-solomon',
      userId: 'user-teacher-3',
      titleEn: 'Mathematics · Grades 6 and 10',
      titleAm: 'ሒሳብ · 6ኛ እና 10ኛ ክፍል',
      titleOm: 'Herrega · kutaa 6 fi 10',
      department: 'Mathematics',
      bioEn: 'Teaches mathematics across middle and upper school.',
      bioAm: 'ከመካከለኛ እስከ ከፍተኛ ደረጃ ሒሳብ ያስተምራል።',
      bioOm: 'Herrega kutaa giddu-galeessaa fi ol’aanaa barsiisa.',
      featured: true,
    })
  }

  for (const row of SUBJECT_TEACHERS) {
    await db.update(subjects).set({ teacherId: row.teacherId }).where(eq(subjects.id, row.id))
  }

  const [site] = await db.select().from(settings).where(eq(settings.id, 'school')).limit(1)
  if (site?.alertEnabled && site.alertEn.includes('Admissions for 2026–27 are open')) {
    await db
      .update(settings)
      .set({ alertEnabled: false, alertEn: '', alertAm: '', alertOm: '' })
      .where(eq(settings.id, 'school'))
  }

  await ensureGallery()
}

export async function ensureEisIdentity() {
  const pairs: Array<[string, string]> = [
    ['admin@horizon.school', 'admin@eis.school'],
    ['teacher@horizon.school', 'teacher@eis.school'],
    ['hanna@horizon.school', 'hanna@eis.school'],
    ['math@horizon.school', 'math@eis.school'],
    ['parent@horizon.school', 'parent@eis.school'],
    ['student@horizon.school', 'student@eis.school'],
  ]
  for (const [from, to] of pairs) {
    const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, to)).limit(1)
    if (taken) continue
    await db.update(users).set({ email: to }).where(eq(users.email, from))
  }
  await db.update(settings).set({ email: 'hello@eis.school' }).where(eq(settings.id, 'school'))

  const posts = await db.select({ id: newsPosts.id, bodyEn: newsPosts.bodyEn }).from(newsPosts)
  for (const post of posts) {
    if (!post.bodyEn.includes('Horizon')) continue
    await db
      .update(newsPosts)
      .set({
        bodyEn: post.bodyEn.replaceAll('Horizon Academy', 'Ethiopia International School').replaceAll('Horizon', 'EIS'),
      })
      .where(eq(newsPosts.id, post.id))
  }

  await db
    .update(staffProfiles)
    .set({
      bioEn: 'Leads Ethiopia International School with a focus on Cambridge-aligned learning and student wellbeing.',
    })
    .where(eq(staffProfiles.id, 'staff-liya'))
}

async function ensureGallery() {
  const existing = await db.select({ id: galleryItems.id }).from(galleryItems)
  const have = new Set(existing.map((row) => row.id))
  const missing = GALLERY_SEED.filter((item) => !have.has(item.id))
  if (missing.length) await db.insert(galleryItems).values(missing)
}

export async function ensureTermReports() {
  const [termTwo] = await db.select({ id: gradeRecords.id }).from(gradeRecords).where(eq(gradeRecords.term, 'Term 2')).limit(1)
  if (termTwo) return
  const g10 = await db.select().from(students).where(eq(students.classId, 'class-g10'))
  const g6 = await db.select().from(students).where(eq(students.classId, 'class-g6'))
  const extra = [
    ...g10.flatMap((s, i) => [
      { id: `gr-${s.id}-bio-t2`, studentId: s.id, subjectId: 'sub-bio', assignmentId: null as string | null, term: 'Term 2', score: 80 + (i % 5) * 2, maxScore: 100 },
      { id: `gr-${s.id}-math-t2`, studentId: s.id, subjectId: 'sub-math10', assignmentId: null, term: 'Term 2', score: 74 + (i % 4) * 3, maxScore: 100 },
      { id: `gr-${s.id}-eng-t2`, studentId: s.id, subjectId: 'sub-eng10', assignmentId: null, term: 'Term 2', score: 83 + (i % 3), maxScore: 100 },
    ]),
    ...g6.map((s, i) => ({
      id: `gr-${s.id}-eng-t2`,
      studentId: s.id,
      subjectId: 'sub-eng6',
      assignmentId: null as string | null,
      term: 'Term 2',
      score: 82 + (i % 5),
      maxScore: 100,
    })),
  ]
  if (extra.length) await db.insert(gradeRecords).values(extra)
}

export async function ensureWeekTimetable() {
  const [ready] = await db.select({ id: timetableSlots.id }).from(timetableSlots).where(eq(timetableSlots.id, 'tt-g10-0-0')).limit(1)
  if (ready) return
  const existing = await db.select({ id: subjects.id }).from(subjects)
  const have = new Set(existing.map((row) => row.id))
  const missing = EXTRA_SUBJECTS.filter((item) => !have.has(item.id))
  if (missing.length) await db.insert(subjects).values(missing)
  await db.delete(timetableSlots)
  await db.insert(timetableSlots).values(weekTimetableSlots())
}

export async function ensureBehaviour() {
  const [ready] = await db
    .select({ id: behaviourIncidents.id })
    .from(behaviourIncidents)
    .where(eq(behaviourIncidents.id, 'beh-yonas-late'))
    .limit(1)
  if (ready) return
  const term = currentReportTerm()
  await db.insert(behaviourIncidents).values([
    {
      id: 'beh-yonas-late',
      studentId: 'stu-yonas',
      teacherUserId: 'user-teacher',
      term,
      kind: 'deduct',
      category: 'late',
      points: 5,
      note: 'Arrived after the bell.',
      status: 'active',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      id: 'beh-yonas-help',
      studentId: 'stu-yonas',
      teacherUserId: 'user-teacher',
      term,
      kind: 'add',
      category: 'helpful',
      points: 5,
      note: 'Helped a classmate with notes.',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'beh-marta-uniform',
      studentId: 'stu-marta',
      teacherUserId: 'user-teacher-2',
      term,
      kind: 'deduct',
      category: 'uniform',
      points: 5,
      note: 'Missing house badge.',
      status: 'active',
      createdAt: new Date(),
    },
  ])
}

async function remapLocalImages() {
  for (const item of GALLERY_SEED) {
    await db.update(galleryItems).set({ imageUrl: item.imageUrl }).where(eq(galleryItems.id, item.id))
  }
  await db.update(newsPosts).set({ imageUrl: '/media/lab.jpg' }).where(eq(newsPosts.id, 'news-1'))
  await db.update(newsPosts).set({ imageUrl: '/media/library.jpg' }).where(eq(newsPosts.id, 'news-2'))
  await db.update(newsPosts).set({ imageUrl: '/media/pitch.jpg' }).where(eq(newsPosts.id, 'news-3'))
}
