import type { Database } from 'better-sqlite3'

export function ensureTables(sqlite: Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      alert_enabled INTEGER NOT NULL DEFAULT 1,
      alert_en TEXT NOT NULL,
      alert_am TEXT NOT NULL,
      alert_om TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address_en TEXT NOT NULL,
      address_am TEXT NOT NULL,
      address_om TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS grade_levels (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL,
      name_om TEXT NOT NULL,
      band TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade_level_id TEXT NOT NULL REFERENCES grade_levels(id),
      teacher_id TEXT REFERENCES users(id),
      year TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      student_number TEXT NOT NULL UNIQUE,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      grade_level_id TEXT NOT NULL REFERENCES grade_levels(id),
      class_id TEXT REFERENCES classes(id)
    );
    CREATE TABLE IF NOT EXISTS guardians (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      relationship TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS guardian_user_student ON guardians(user_id, student_id);
    CREATE TABLE IF NOT EXISTS staff_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      department TEXT NOT NULL,
      bio_en TEXT NOT NULL,
      bio_am TEXT NOT NULL,
      bio_om TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS enrollment_unique ON enrollments(student_id, class_id);
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      teacher_id TEXT REFERENCES users(id),
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL,
      name_om TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id),
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date ON attendance(student_id, date);
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS grade_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      assignment_id TEXT REFERENCES assignments(id) ON DELETE SET NULL,
      term TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      body_en TEXT NOT NULL,
      body_am TEXT NOT NULL,
      body_om TEXT NOT NULL,
      audience TEXT NOT NULL DEFAULT 'all',
      published_at TEXT NOT NULL,
      created_by TEXT REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS news_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      excerpt_am TEXT NOT NULL,
      excerpt_om TEXT NOT NULL,
      body_en TEXT NOT NULL,
      body_am TEXT NOT NULL,
      body_om TEXT NOT NULL,
      published_at TEXT NOT NULL,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      description_om TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT,
      location_en TEXT NOT NULL,
      location_am TEXT NOT NULL,
      location_om TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      child_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      grade_applying TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id),
      to_user_id TEXT NOT NULL REFERENCES users(id),
      student_id TEXT REFERENCES students(id),
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      read_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS fee_invoices (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount_etb INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid'
    );
    CREATE TABLE IF NOT EXISTS fee_payments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      parent_user_id TEXT NOT NULL REFERENCES users(id),
      invoice_id TEXT REFERENCES fee_invoices(id) ON DELETE SET NULL,
      kind TEXT NOT NULL,
      method TEXT NOT NULL,
      amount_etb INTEGER NOT NULL,
      receipt_number TEXT NOT NULL,
      proof_note TEXT NOT NULL DEFAULT '',
      proof_name TEXT NOT NULL DEFAULT '',
      proof_data TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS absence_requests (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      parent_user_id TEXT NOT NULL REFERENCES users(id),
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS behaviour_incidents (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_user_id TEXT NOT NULL REFERENCES users(id),
      term TEXT NOT NULL,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      points INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      category TEXT NOT NULL,
      href TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      title_om TEXT NOT NULL,
      department TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      description_om TEXT NOT NULL
    );
  `)

  const subjectCols = sqlite.prepare('PRAGMA table_info(subjects)').all() as Array<{ name: string }>
  if (!subjectCols.some((col) => col.name === 'teacher_id')) {
    sqlite.exec('ALTER TABLE subjects ADD COLUMN teacher_id TEXT REFERENCES users(id)')
  }
}
