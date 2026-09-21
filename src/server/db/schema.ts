import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  role: text('role').notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  alertEnabled: integer('alert_enabled', { mode: 'boolean' }).notNull().default(false),
  alertEn: text('alert_en').notNull(),
  alertAm: text('alert_am').notNull(),
  alertOm: text('alert_om').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  addressEn: text('address_en').notNull(),
  addressAm: text('address_am').notNull(),
  addressOm: text('address_om').notNull(),
})

export const gradeLevels = sqliteTable('grade_levels', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAm: text('name_am').notNull(),
  nameOm: text('name_om').notNull(),
  band: text('band').notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const classes = sqliteTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gradeLevelId: text('grade_level_id')
    .notNull()
    .references(() => gradeLevels.id),
  teacherId: text('teacher_id').references(() => users.id),
  year: text('year').notNull(),
})

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  studentNumber: text('student_number').notNull().unique(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  gradeLevelId: text('grade_level_id')
    .notNull()
    .references(() => gradeLevels.id),
  classId: text('class_id').references(() => classes.id),
})

export const guardians = sqliteTable(
  'guardians',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    relationship: text('relationship').notNull(),
  },
  (t) => [uniqueIndex('guardian_user_student').on(t.userId, t.studentId)],
)

export const staffProfiles = sqliteTable('staff_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  department: text('department').notNull(),
  bioEn: text('bio_en').notNull(),
  bioAm: text('bio_am').notNull(),
  bioOm: text('bio_om').notNull(),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
})

export const enrollments = sqliteTable(
  'enrollments',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    classId: text('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('enrollment_unique').on(t.studentId, t.classId)],
)

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  classId: text('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').references(() => users.id),
  nameEn: text('name_en').notNull(),
  nameAm: text('name_am').notNull(),
  nameOm: text('name_om').notNull(),
})

export const timetableSlots = sqliteTable('timetable_slots', {
  id: text('id').primaryKey(),
  classId: text('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  room: text('room').notNull(),
})

export const attendance = sqliteTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    classId: text('class_id')
      .notNull()
      .references(() => classes.id),
    date: text('date').notNull(),
    status: text('status').notNull(),
    note: text('note'),
  },
  (t) => [uniqueIndex('attendance_student_date').on(t.studentId, t.date), index('attendance_date_idx').on(t.date)],
)

export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(),
  classId: text('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dueDate: text('due_date').notNull(),
})

export const gradeRecords = sqliteTable('grade_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
  term: text('term').notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
})

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  bodyEn: text('body_en').notNull(),
  bodyAm: text('body_am').notNull(),
  bodyOm: text('body_om').notNull(),
  audience: text('audience').notNull().default('all'),
  publishedAt: text('published_at').notNull(),
  createdBy: text('created_by').references(() => users.id),
})

export const newsPosts = sqliteTable('news_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  excerptAm: text('excerpt_am').notNull(),
  excerptOm: text('excerpt_om').notNull(),
  bodyEn: text('body_en').notNull(),
  bodyAm: text('body_am').notNull(),
  bodyOm: text('body_om').notNull(),
  publishedAt: text('published_at').notNull(),
  imageUrl: text('image_url'),
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionAm: text('description_am').notNull(),
  descriptionOm: text('description_om').notNull(),
  startAt: text('start_at').notNull(),
  endAt: text('end_at'),
  locationEn: text('location_en').notNull(),
  locationAm: text('location_am').notNull(),
  locationOm: text('location_om').notNull(),
})

export const galleryItems = sqliteTable('gallery_items', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
})

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  childName: text('child_name').notNull(),
  parentName: text('parent_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  gradeApplying: text('grade_applying').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    fromUserId: text('from_user_id')
      .notNull()
      .references(() => users.id),
    toUserId: text('to_user_id')
      .notNull()
      .references(() => users.id),
    studentId: text('student_id').references(() => students.id),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    readAt: integer('read_at', { mode: 'timestamp' }),
  },
  (t) => [index('messages_to_idx').on(t.toUserId)],
)

export const feeInvoices = sqliteTable('fee_invoices', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  amountEtb: integer('amount_etb').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('unpaid'),
})

export const feePayments = sqliteTable('fee_payments', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  parentUserId: text('parent_user_id')
    .notNull()
    .references(() => users.id),
  invoiceId: text('invoice_id').references(() => feeInvoices.id, { onDelete: 'set null' }),
  kind: text('kind').notNull(),
  method: text('method').notNull(),
  amountEtb: integer('amount_etb').notNull(),
  receiptNumber: text('receipt_number').notNull(),
  proofNote: text('proof_note').notNull().default(''),
  proofName: text('proof_name').notNull().default(''),
  proofData: text('proof_data').notNull().default(''),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const absenceRequests = sqliteTable('absence_requests', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  parentUserId: text('parent_user_id')
    .notNull()
    .references(() => users.id),
  fromDate: text('from_date').notNull(),
  toDate: text('to_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'),
})

export const behaviourIncidents = sqliteTable('behaviour_incidents', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  teacherUserId: text('teacher_user_id')
    .notNull()
    .references(() => users.id),
  term: text('term').notNull(),
  kind: text('kind').notNull(),
  category: text('category').notNull(),
  points: integer('points').notNull(),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const contactMessages = sqliteTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  category: text('category').notNull(),
  href: text('href').notNull(),
})

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleAm: text('title_am').notNull(),
  titleOm: text('title_om').notNull(),
  department: text('department').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionAm: text('description_am').notNull(),
  descriptionOm: text('description_om').notNull(),
})
