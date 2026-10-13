// CareNova Universal SQLite & Turso Client
// - In Production (Render/Cloud): Uses @libsql/client/web (pure HTTP fetch, zero native binaries) to connect to Turso Hosted SQLite
// - In Local Development: Automatically uses Node's built-in node:sqlite ('carenova.db')
// Lead Architect: Aryan More

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config();

let db;

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (tursoUrl && tursoUrl.startsWith('libsql')) {
  // Remote Turso Hosted Database
  const { createClient } = await import('@libsql/client/web');
  console.log(`[Database] Connecting to Turso Hosted SQLite: ${tursoUrl}`);
  db = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
} else {
  // Local SQLite via Node.js built-in engine
  const { DatabaseSync } = await import('node:sqlite');
  const dbPath = fileURLToPath(new URL('./carenova.db', import.meta.url));
  console.log(`[Database] Using Local SQLite Engine: ${dbPath}`);
  const localDb = new DatabaseSync(dbPath);

  db = {
    async execute(query) {
      const sql = typeof query === 'string' ? query : query.sql;
      const rawArgs = typeof query === 'string' ? [] : (query.args || []);
      const args = rawArgs.map(val => (val === undefined ? null : val));

      const trimmed = sql.trim();
      const isSelect = /^SELECT\b/i.test(trimmed) || /^PRAGMA\b/i.test(trimmed);

      if (isSelect) {
        const stmt = localDb.prepare(sql);
        const rows = stmt.all(...args);
        return { rows };
      } else {
        const stmt = localDb.prepare(sql);
        const result = stmt.run(...args);
        return { rows: [], changes: result.changes, lastInsertRowid: result.lastInsertRowid };
      }
    },
  };
}

export { db };

export async function initDatabase() {
  console.log('[Database] Verifying tables and schema...');

  // 1. Users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Profiles
  await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      age INTEGER,
      gender TEXT,
      height REAL,
      weight REAL,
      blood_group TEXT,
      activity_level TEXT DEFAULT 'Moderate',
      water_goal_glasses INTEGER DEFAULT 8,
      step_goal INTEGER DEFAULT 10000,
      sleep_goal_hours REAL DEFAULT 8.0,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      allergies TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Water Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS water_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      glasses INTEGER NOT NULL DEFAULT 1,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, log_date)
    );
  `);

  // 4. Weight Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight REAL NOT NULL,
      bmi REAL,
      notes TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Sleep Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      duration_hours REAL NOT NULL,
      quality TEXT,
      notes TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Exercise Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      calories_burned INTEGER,
      intensity TEXT,
      notes TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Step Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS step_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      step_count INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, log_date)
    );
  `);

  // 8. Blood Pressure Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS blood_pressure_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      pulse INTEGER,
      category TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Blood Glucose Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS blood_glucose_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      glucose_mg_dl INTEGER NOT NULL,
      timing TEXT,
      notes TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Heart Rate Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS heart_rate_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bpm INTEGER NOT NULL,
      tag TEXT,
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Medications
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      reminder_time TEXT,
      instructions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 12. Medication Logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'taken',
      log_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 13. Health Goals
  await db.execute(`
    CREATE TABLE IF NOT EXISTS health_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_value REAL NOT NULL,
      current_value REAL DEFAULT 0,
      unit TEXT NOT NULL,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 14. Disease Library
  await db.execute(`
    CREATE TABLE IF NOT EXISTS disease_library (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      overview TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      causes TEXT NOT NULL,
      risk_factors TEXT NOT NULL,
      prevention TEXT NOT NULL,
      treatment TEXT NOT NULL,
      emergency_signs TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default diseases if table is empty
  const diseaseCount = await db.execute('SELECT COUNT(*) as count FROM disease_library');
  const count = Number(diseaseCount.rows[0].count);
  if (count === 0) {
    const seeds = [
      {
        id: 'dl-1',
        title: 'Essential Hypertension',
        category: 'Cardiology',
        overview: 'A chronic medical condition where arterial blood pressure is persistently elevated above 130/80 mmHg.',
        symptoms: JSON.stringify(['Often asymptomatic (silent killer)', 'Morning headaches', 'Dizziness', 'Shortness of breath']),
        causes: JSON.stringify(['Vascular stiffness', 'High sodium intake', 'Renal factors', 'Genetic history']),
        risk_factors: JSON.stringify(['Sedentary lifestyle', 'Obesity', 'Age > 45', 'Tobacco usage', 'Chronic stress']),
        prevention: JSON.stringify(['DASH diet', 'Exercise >= 150 mins/week', 'Reduce sodium', 'Weight management']),
        treatment: 'Lifestyle modification, ACE inhibitors, ARBs, Calcium channel blockers.',
        emergency_signs: 'Hypertensive crisis (BP > 180/120) with chest pain or blurred vision. Call 112/108 immediately.',
      },
      {
        id: 'dl-2',
        title: 'Type 2 Diabetes Mellitus',
        category: 'Endocrinology',
        overview: 'A metabolic disorder characterized by high blood sugar, insulin resistance, and relative lack of insulin.',
        symptoms: JSON.stringify(['Increased thirst', 'Frequent urination', 'Increased hunger', 'Unintended weight loss', 'Fatigue']),
        causes: JSON.stringify(['Insulin resistance', 'Pancreatic beta-cell dysfunction', 'Genetic factors']),
        risk_factors: JSON.stringify(['BMI >= 25', 'Inactivity', 'Family history', 'High blood pressure']),
        prevention: JSON.stringify(['Healthy eating', 'Regular physical activity', 'Weight loss']),
        treatment: 'Diet, exercise, Metformin, and doctor-prescribed glucose-lowering therapies.',
        emergency_signs: 'Blood glucose > 300 mg/dL with confusion, extreme nausea, or fruity breath odor.',
      },
      {
        id: 'dl-3',
        title: 'Asthma & Respiratory Care',
        category: 'Pulmonology',
        overview: 'A condition in which airways narrow, swell, and produce extra mucus, making breathing difficult.',
        symptoms: JSON.stringify(['Shortness of breath', 'Chest tightness or pain', 'Wheezing when exhaling', 'Nighttime coughing']),
        causes: JSON.stringify(['Airway sensitivity to allergens, cold air, or physical exertion']),
        risk_factors: JSON.stringify(['Family history of asthma', 'Allergies', 'Smoking or secondhand smoke exposure']),
        prevention: JSON.stringify(['Avoid known triggers', 'Take preventive medications as prescribed', 'Monitor breathing']),
        treatment: 'Controller inhalers (corticosteroids) and fast-acting rescue inhalers.',
        emergency_signs: 'Severe breathlessness unresponsive to inhaler, blue lips, or inability to speak full sentences. Call 112.',
      },
      {
        id: 'dl-4',
        title: 'Anxiety & Depression Awareness',
        category: 'Mental Health',
        overview: 'Common and treatable mental health conditions affecting mood, emotional wellbeing, sleep, and energy levels.',
        symptoms: JSON.stringify(['Persistent sadness', 'Loss of interest in activities', 'Sleep disturbance', 'Fatigue', 'Restlessness']),
        causes: JSON.stringify(['Neurochemical imbalances', 'Chronic life stress', 'Genetic predisposition']),
        risk_factors: JSON.stringify(['Major life events', 'Chronic medical conditions', 'Lack of social support']),
        prevention: JSON.stringify(['Regular exercise', 'Mindfulness', 'Consistent sleep routine', 'Social connection']),
        treatment: 'Counseling, cognitive therapy (CBT), and lifestyle support.',
        emergency_signs: 'Acute emotional crisis or thoughts of self-harm. Call KIRAN Mental Health Helpline 1800-599-0019 immediately.',
      },
    ];

    for (const d of seeds) {
      await db.execute({
        sql: `INSERT INTO disease_library (id, title, category, overview, symptoms, causes, risk_factors, prevention, treatment, emergency_signs)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [d.id, d.title, d.category, d.overview, d.symptoms, d.causes, d.risk_factors, d.prevention, d.treatment, d.emergency_signs],
      });
    }
  }

  console.log('[Database] Schema verified and ready.');
}
