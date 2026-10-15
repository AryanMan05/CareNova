// CareNova REST API Server (Node.js + Express + SQLite / Turso)
// Lead Architect: Aryan More

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env, root .env, or runtime environment
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

export function getGeminiApiKey() {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    '';
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

export function getOpenAIApiKey() {
  const raw = process.env.OPENAI_API_KEY || '';
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'carenova-super-secure-jwt-secret-2026';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Auth Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CareNova Healthcare API',
    engine: 'SQLite (Turso Compatible)',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [cleanEmail],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Check total users: If this is the very first user, automatically grant admin!
    const userCountRes = await db.execute('SELECT COUNT(*) as count FROM users');
    const isFirstUser = Number(userCountRes.rows[0].count) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, full_name, role, is_verified)
            VALUES (?, ?, ?, ?, ?, 1)`,
      args: [userId, cleanEmail, passwordHash, fullName.trim(), role],
    });

    // Insert profile
    await db.execute({
      sql: `INSERT INTO profiles (id, user_id, full_name, role)
            VALUES (?, ?, ?, ?)`,
      args: [profileId, userId, fullName.trim(), role],
    });

    // Fetch created profile
    const profileRes = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [userId],
    });
    const profile = profileRes.rows[0];

    const token = jwt.sign(
      { id: userId, email: cleanEmail, full_name: fullName.trim(), role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, email: cleanEmail, full_name: fullName.trim(), role },
      profile,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userRes = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [cleanEmail],
    });

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch profile
    let profileRes = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [user.id],
    });

    let profile = profileRes.rows[0];
    if (!profile) {
      // Auto-create profile if missing
      const profileId = crypto.randomUUID();
      await db.execute({
        sql: 'INSERT INTO profiles (id, user_id, full_name, role) VALUES (?, ?, ?, ?)',
        args: [profileId, user.id, user.full_name, user.role],
      });
      profileRes = await db.execute({
        sql: 'SELECT * FROM profiles WHERE user_id = ?',
        args: [user.id],
      });
      profile = profileRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get Current User (Session verification)
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const userRes = await db.execute({
      sql: 'SELECT id, email, full_name, role, is_verified, created_at FROM users WHERE id = ?',
      args: [req.user.id],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];

    let profileRes = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [req.user.id],
    });

    let profile = profileRes.rows[0];
    if (!profile) {
      const profileId = crypto.randomUUID();
      await db.execute({
        sql: 'INSERT INTO profiles (id, user_id, full_name, role) VALUES (?, ?, ?, ?)',
        args: [profileId, user.id, user.full_name, user.role],
      });
      profileRes = await db.execute({
        sql: 'SELECT * FROM profiles WHERE user_id = ?',
        args: [user.id],
      });
      profile = profileRes.rows[0];
    }

    res.json({
      user,
      profile,
    });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Could not verify session.' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const {
      full_name,
      age,
      gender,
      height,
      weight,
      blood_group,
      activity_level,
      water_goal_glasses,
      step_goal,
      sleep_goal_hours,
      emergency_contact_name,
      emergency_contact_phone,
      allergies,
    } = req.body;

    // Check if profile exists
    const existing = await db.execute({
      sql: 'SELECT id FROM profiles WHERE user_id = ?',
      args: [req.user.id],
    });

    if (existing.rows.length === 0) {
      const profileId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO profiles (id, user_id, full_name, role, age, gender, height, weight, blood_group, activity_level, allergies, emergency_contact_name, emergency_contact_phone)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          profileId,
          req.user.id,
          full_name || req.user.full_name || 'Patient',
          req.user.role || 'user',
          age !== undefined ? age : null,
          gender !== undefined ? gender : null,
          height !== undefined ? height : null,
          weight !== undefined ? weight : null,
          blood_group !== undefined ? blood_group : null,
          activity_level !== undefined ? activity_level : 'Moderate',
          allergies !== undefined ? allergies : null,
          emergency_contact_name !== undefined ? emergency_contact_name : null,
          emergency_contact_phone !== undefined ? emergency_contact_phone : null,
        ],
      });
    } else {
      await db.execute({
        sql: `UPDATE profiles SET
                full_name = COALESCE(?, full_name),
                age = COALESCE(?, age),
                gender = COALESCE(?, gender),
                height = COALESCE(?, height),
                weight = COALESCE(?, weight),
                blood_group = COALESCE(?, blood_group),
                activity_level = COALESCE(?, activity_level),
                water_goal_glasses = COALESCE(?, water_goal_glasses),
                step_goal = COALESCE(?, step_goal),
                sleep_goal_hours = COALESCE(?, sleep_goal_hours),
                emergency_contact_name = COALESCE(?, emergency_contact_name),
                emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                allergies = COALESCE(?, allergies),
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?`,
        args: [
          full_name !== undefined ? full_name : null,
          age !== undefined ? age : null,
          gender !== undefined ? gender : null,
          height !== undefined ? height : null,
          weight !== undefined ? weight : null,
          blood_group !== undefined ? blood_group : null,
          activity_level !== undefined ? activity_level : null,
          water_goal_glasses !== undefined ? water_goal_glasses : null,
          step_goal !== undefined ? step_goal : null,
          sleep_goal_hours !== undefined ? sleep_goal_hours : null,
          emergency_contact_name !== undefined ? emergency_contact_name : null,
          emergency_contact_phone !== undefined ? emergency_contact_phone : null,
          allergies !== undefined ? allergies : null,
          req.user.id,
        ],
      });
    }

    if (full_name) {
      await db.execute({
        sql: 'UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [full_name, req.user.id],
      });
    }

    const updated = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [req.user.id],
    });

    res.json({ profile: updated.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// -------------------------------------------------------------
// Health Trackers & Telemetry Endpoints
// -------------------------------------------------------------

// Get All Health Data for Current User
app.get('/api/health/all', authenticate, async (req, res) => {
  try {
    const uid = req.user.id;

    const [
      waterRes,
      weightRes,
      sleepRes,
      exerciseRes,
      stepRes,
      bpRes,
      bgRes,
      hrRes,
      medRes,
      medLogRes,
      goalRes,
      diseaseRes,
    ] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM water_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM exercise_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM step_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM blood_pressure_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM blood_glucose_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM heart_rate_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM medications WHERE user_id = ? AND is_active = 1', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM medication_logs WHERE user_id = ? ORDER BY log_date DESC', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM health_goals WHERE user_id = ?', args: [uid] }),
      db.execute('SELECT * FROM disease_library'),
    ]);

    // Parse disease library JSON strings
    const diseases = diseaseRes.rows.map((d) => ({
      ...d,
      symptoms: typeof d.symptoms === 'string' ? JSON.parse(d.symptoms) : d.symptoms,
      causes: typeof d.causes === 'string' ? JSON.parse(d.causes) : d.causes,
      risk_factors: typeof d.risk_factors === 'string' ? JSON.parse(d.risk_factors) : d.risk_factors,
      prevention: typeof d.prevention === 'string' ? JSON.parse(d.prevention) : d.prevention,
    }));

    res.json({
      waterLogs: waterRes.rows,
      weightLogs: weightRes.rows,
      sleepLogs: sleepRes.rows,
      exerciseLogs: exerciseRes.rows,
      stepLogs: stepRes.rows,
      bloodPressureLogs: bpRes.rows,
      bloodGlucoseLogs: bgRes.rows,
      heartRateLogs: hrRes.rows,
      medications: medRes.rows,
      medicationLogs: medLogRes.rows,
      healthGoals: goalRes.rows,
      diseaseLibrary: diseases,
    });
  } catch (err) {
    console.error('Fetch health data error:', err);
    res.status(500).json({ error: 'Could not retrieve health logs.' });
  }
});

// Water Log (Upsert for date)
app.post('/api/health/water', authenticate, async (req, res) => {
  try {
    const { glasses, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO water_logs (id, user_id, glasses, log_date)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, log_date) DO UPDATE SET glasses = excluded.glasses`,
      args: [id, req.user.id, glasses, date],
    });

    const record = await db.execute({
      sql: 'SELECT * FROM water_logs WHERE user_id = ? AND log_date = ?',
      args: [req.user.id, date],
    });

    res.json({ waterLog: record.rows[0] });
  } catch (err) {
    console.error('Water log error:', err);
    res.status(500).json({ error: 'Could not save water log.' });
  }
});

// Weight Log
app.post('/api/health/weight', authenticate, async (req, res) => {
  try {
    const { weight, bmi, notes, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO weight_logs (id, user_id, weight, bmi, notes, log_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, req.user.id, weight, bmi || null, notes || null, date],
    });

    // Also update weight in user profile
    await db.execute({
      sql: 'UPDATE profiles SET weight = ? WHERE user_id = ?',
      args: [weight, req.user.id],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Weight log error:', err);
    res.status(500).json({ error: 'Could not save weight log.' });
  }
});

// Sleep Log
app.post('/api/health/sleep', authenticate, async (req, res) => {
  try {
    const { duration_hours, quality, notes, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO sleep_logs (id, user_id, duration_hours, quality, notes, log_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, req.user.id, duration_hours, quality || 'Normal', notes || null, date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Sleep log error:', err);
    res.status(500).json({ error: 'Could not save sleep log.' });
  }
});

// Exercise Log
app.post('/api/health/exercise', authenticate, async (req, res) => {
  try {
    const { activity_type, duration_minutes, calories_burned, intensity, notes, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO exercise_logs (id, user_id, activity_type, duration_minutes, calories_burned, intensity, notes, log_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, req.user.id, activity_type, duration_minutes, calories_burned || null, intensity || 'Moderate', notes || null, date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Exercise log error:', err);
    res.status(500).json({ error: 'Could not save exercise log.' });
  }
});

// Step Log (Upsert)
app.post('/api/health/steps', authenticate, async (req, res) => {
  try {
    const { step_count, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO step_logs (id, user_id, step_count, log_date)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, log_date) DO UPDATE SET step_count = excluded.step_count`,
      args: [id, req.user.id, step_count, date],
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Step log error:', err);
    res.status(500).json({ error: 'Could not save steps log.' });
  }
});

// Blood Pressure Log
app.post('/api/health/blood-pressure', authenticate, async (req, res) => {
  try {
    const { systolic, diastolic, pulse, category, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO blood_pressure_logs (id, user_id, systolic, diastolic, pulse, category, log_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, req.user.id, systolic, diastolic, pulse || null, category || null, date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Blood pressure log error:', err);
    res.status(500).json({ error: 'Could not save blood pressure log.' });
  }
});

// Blood Glucose Log
app.post('/api/health/blood-glucose', authenticate, async (req, res) => {
  try {
    const { glucose_mg_dl, timing, notes, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO blood_glucose_logs (id, user_id, glucose_mg_dl, timing, notes, log_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, req.user.id, glucose_mg_dl, timing || 'Fasting', notes || null, date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Blood glucose log error:', err);
    res.status(500).json({ error: 'Could not save blood glucose log.' });
  }
});

// Heart Rate Log
app.post('/api/health/heart-rate', authenticate, async (req, res) => {
  try {
    const { bpm, tag, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO heart_rate_logs (id, user_id, bpm, tag, log_date)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, req.user.id, bpm, tag || 'General', date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Heart rate log error:', err);
    res.status(500).json({ error: 'Could not save heart rate log.' });
  }
});

// Add Medication
app.post('/api/health/medications', authenticate, async (req, res) => {
  try {
    const { name, dosage, frequency, reminder_time, instructions } = req.body;
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO medications (id, user_id, name, dosage, frequency, reminder_time, instructions, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [id, req.user.id, name, dosage, frequency, reminder_time || null, instructions || null],
    });

    const newMed = await db.execute({
      sql: 'SELECT * FROM medications WHERE id = ?',
      args: [id],
    });

    res.status(201).json({ medication: newMed.rows[0] });
  } catch (err) {
    console.error('Add medication error:', err);
    res.status(500).json({ error: 'Could not add medication.' });
  }
});

// Delete Medication
app.delete('/api/health/medications/:id', authenticate, async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM medications WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete medication error:', err);
    res.status(500).json({ error: 'Could not delete medication.' });
  }
});

// Log Medication Dose
app.post('/api/health/medication-logs', authenticate, async (req, res) => {
  try {
    const { medication_id, status, log_date } = req.body;
    const date = log_date || new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO medication_logs (id, user_id, medication_id, status, log_date)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, req.user.id, medication_id, status || 'taken', date],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Medication log error:', err);
    res.status(500).json({ error: 'Could not record medication dose.' });
  }
});

// -------------------------------------------------------------
// Administrator Endpoints (Role-Protected)
// -------------------------------------------------------------

// Admin Overview Telemetry
app.get('/api/admin/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const [userCount, waterCount, bpCount, medCount] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM users'),
      db.execute('SELECT COUNT(*) as count FROM water_logs'),
      db.execute('SELECT COUNT(*) as count FROM blood_pressure_logs'),
      db.execute('SELECT COUNT(*) as count FROM medications'),
    ]);

    res.json({
      totalUsers: Number(userCount.rows[0].count),
      totalWaterLogs: Number(waterCount.rows[0].count),
      totalBpLogs: Number(bpCount.rows[0].count),
      totalMedications: Number(medCount.rows[0].count),
      serverStatus: 'Optimal',
      database: 'SQLite (Turso Compatible)',
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Could not load admin telemetry.' });
  }
});

// Admin Users Directory
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const usersRes = await db.execute(`
      SELECT u.id, u.email, u.full_name, u.role, u.is_verified, u.created_at,
             p.age, p.gender, p.blood_group, p.activity_level, p.emergency_contact_phone
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({ users: usersRes.rows });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Could not load users directory.' });
  }
});

// Admin Change User Role (Promote/Demote)
app.put('/api/admin/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin.' });
    }

    await db.execute({
      sql: 'UPDATE users SET role = ? WHERE id = ?',
      args: [role, req.params.id],
    });

    await db.execute({
      sql: 'UPDATE profiles SET role = ? WHERE user_id = ?',
      args: [role, req.params.id],
    });

    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) {
    console.error('Admin role update error:', err);
    res.status(500).json({ error: 'Could not update user role.' });
  }
});

// Admin Add Disease Item
app.post('/api/admin/disease-library', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, overview, symptoms, causes, risk_factors, prevention, treatment, emergency_signs } = req.body;
    const id = `dl-${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO disease_library (id, title, category, overview, symptoms, causes, risk_factors, prevention, treatment, emergency_signs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        category,
        overview,
        JSON.stringify(symptoms || []),
        JSON.stringify(causes || []),
        JSON.stringify(risk_factors || []),
        JSON.stringify(prevention || []),
        treatment,
        emergency_signs,
      ],
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Admin add disease error:', err);
    res.status(500).json({ error: 'Could not add disease.' });
  }
});

// Admin Delete Disease Item
app.delete('/api/admin/disease-library/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM disease_library WHERE id = ?',
      args: [req.params.id],
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete disease error:', err);
    res.status(500).json({ error: 'Could not delete disease.' });
  }
});

// -------------------------------------------------------------
// Real Conversational AI Health Assistant (Gemini & OpenAI)
// -------------------------------------------------------------

/**
 * Builds and sanitizes multi-turn contents for Google Gemini API.
 * Google Gemini v1beta requirements:
 * 1. Must start with role: 'user' (cannot start with 'model' e.g. default welcome greeting)
 * 2. Roles must strictly alternate: user -> model -> user -> model -> user
 * 3. Cannot have consecutive duplicate roles (merges text if consecutive)
 * 4. Must end with role: 'user'
 */
function buildGeminiContents(conversation, cleanPrompt) {
  const rawTurns = [];

  if (Array.isArray(conversation)) {
    // Retain up to last 10 turns of history
    for (const msg of conversation.slice(-10)) {
      if (!msg || !msg.text) continue;
      const text = String(msg.text).trim();
      if (!text) continue;
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      rawTurns.push({ role, text });
    }
  }

  // Append current user message
  rawTurns.push({ role: 'user', text: cleanPrompt });

  // Gemini Rule 1: First turn MUST be 'user'. Drop any leading assistant/model greeting.
  while (rawTurns.length > 0 && rawTurns[0].role === 'model') {
    rawTurns.shift();
  }

  // Gemini Rule 2: Strict alternation. Merge consecutive same-role messages.
  const alternating = [];
  for (const turn of rawTurns) {
    if (alternating.length === 0) {
      alternating.push({ role: turn.role, text: turn.text });
    } else {
      const prev = alternating[alternating.length - 1];
      if (prev.role === turn.role) {
        prev.text = `${prev.text}\n\n${turn.text}`;
      } else {
        alternating.push({ role: turn.role, text: turn.text });
      }
    }
  }

  // Gemini Rule 3: Guarantee at least one valid user turn
  if (alternating.length === 0 || alternating[alternating.length - 1].role !== 'user') {
    alternating.push({ role: 'user', text: cleanPrompt });
  }

  return alternating.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
}

// Helper to sanitize and classify AI error responses without exposing secrets or raw stack traces
function sanitizeAiError(errMessage, statusCode) {
  const lower = String(errMessage || '').toLowerCase();

  // 1. Quota / Rate limit (HTTP 429)
  if (statusCode === 429 || lower.includes('quota') || lower.includes('resource_exhausted')) {
    return 'CareNova AI is currently receiving high traffic and reached the free request limit. Please wait a moment and try again.';
  }

  // 2. Invalid API key (HTTP 400/403 with specific key errors)
  if (statusCode === 400 && (lower.includes('api_key_invalid') || lower.includes('api key not valid'))) {
    return 'The backend GEMINI_API_KEY could not be validated by Google AI Studio. Please verify the key in your Render Environment Variables.';
  }

  // 3. Model unavailable / decommissioned
  if (
    lower.includes('not found') ||
    lower.includes('no longer available') ||
    lower.includes('unsupported model') ||
    lower.includes('is not available')
  ) {
    return 'The AI service is temporarily undergoing scheduled updates. Please try asking again shortly.';
  }

  // 4. Region or location restriction
  if (lower.includes('location') || lower.includes('country') || lower.includes('region')) {
    return 'Google Gemini API is temporarily restricted in this server region. Please try again shortly.';
  }

  // 5. Network or timeout issues
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('econnrefused') || lower.includes('timeout')) {
    return 'Connection to the AI engine was interrupted. Please check your connection and try again.';
  }

  return 'CareNova AI could not generate a response right now. Please try asking again in a moment.';
}

// AI Diagnostic & Status Endpoint
app.get('/api/ai/status', (req, res) => {
  const geminiKey = getGeminiApiKey();
  const openaiKey = getOpenAIApiKey();
  const isConfigured = Boolean(geminiKey || openaiKey);

  res.json({
    status: 'online',
    version: '2.2.0',
    aiConfigured: isConfigured,
    provider: geminiKey ? 'google-gemini' : openaiKey ? 'openai' : 'none',
    model: 'gemini-3.8-flash',
    fallbackModel: 'gemini-3.5-flash-lite',
    models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],
    gemini: {
      configured: Boolean(geminiKey),
      preferredModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.5-flash-lite',
    },
    openai: {
      configured: Boolean(openaiKey),
    },
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, conversation = [], context = '' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Please enter a message or question.' });
    }

    const cleanPrompt = prompt.trim();
    const geminiKey = getGeminiApiKey();
    const openaiKey = getOpenAIApiKey();

    if (!geminiKey && !openaiKey) {
      return res.json({
        configured: false,
        reply: `⚠️ **CareNova AI Setup Required**

To activate real-time conversational AI, please add your free **\`GEMINI_API_KEY\`** in your Render Dashboard (or in your \`server/.env\` file).

**Quick Free Setup (takes 1 minute):**
1. Visit **[Google AI Studio](https://aistudio.google.com/)** and click **Get API Key** (100% free, no credit card required).
2. In your **Render Dashboard**, open your CareNova backend service > **Environment Variables**.
3. Add **\`GEMINI_API_KEY\`** with your copied key and click **Save**.
4. CareNova AI will automatically connect and respond conversationally!

*(Your health records, trackers, calculators, and disease library remain fully accessible.)*`,
      });
    }

    const systemInstruction = `You are CareNova AI, an empathetic, supportive, and knowledgeable personal health & wellness companion created for the CareNova platform (Lead Architect: Aryan More).

Your core objectives:
1. Carefully understand the user's specific query and provide helpful, relevant, and human-like answers.
2. Remember and refer back to context from previous messages in the current conversation to answer follow-up questions naturally.
3. Be a complete and versatile conversational AI: Answer general knowledge questions (e.g. history, science, technology, inventors, computers, math, everyday inquiries), casual greetings, and friendly conversation naturally and accurately, alongside your health & wellness expertise (nutrition, sleep, vitals, habit building, exercises).
4. Explain all medical concepts in simple, everyday English. If a clinical term is mentioned, briefly explain what it means in plain words.
5. Respond fluently in whatever language the user requests or writes in. If the user asks in Hindi, Hinglish, Spanish, or another language (e.g., "mujhe headache ho raha hai", "sugar kaise control karein?", or "Explain that in Hindi"), reply warmly, fluently, and naturally in that requested language.
6. Provide practical, helpful steps rather than repeating repetitive robotic disclaimers on every single turn.
7. Keep responses concise, clear, and easy to read (2 to 4 short paragraphs or bullet points), unless the user explicitly asks for in-depth details.
8. Clinical Safety & Emergency Rules: Never invent medical diagnoses or claim uncertain health info as definite fact. If the user describes acute emergency symptoms (such as crushing chest pain, difficulty breathing, slurred speech, sudden paralysis, severe bleeding, or suicidal distress), urge them to immediately seek emergency care by calling 112 or 108 in India or their local emergency number.
${context ? `\nUser Health Profile Context:\n${context}` : ''}`;

    // 1. Google Gemini Provider (Official current models: gemini-3.8-flash preferred, gemini-3.5-flash-lite fallback)
    if (geminiKey) {
      const contents = buildGeminiContents(conversation, cleanPrompt);
      const geminiModels = [
        {
          id: 'gemini-3.8-flash',
          config: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        },
        {
          id: 'gemini-3.5-flash-lite',
          config: {
            // gemini-3.5-flash-lite does not accept custom temperature
            maxOutputTokens: 1200,
          },
        },
      ];

      let geminiResponse = null;
      let lastGeminiError = null;
      let lastStatusCode = 500;
      let successfulModel = null;

      for (const model of geminiModels) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemInstruction }],
                },
                contents,
                generationConfig: model.config,
              }),
            }
          );

          if (apiRes.ok) {
            geminiResponse = await apiRes.json();
            successfulModel = model.id;
            break;
          } else {
            const errBody = await apiRes.json().catch(() => ({}));
            lastStatusCode = apiRes.status;
            lastGeminiError = errBody?.error?.message || `HTTP ${apiRes.status} (${apiRes.statusText})`;
            console.warn(`[Gemini API] Model ${model.id} returned HTTP ${apiRes.status}:`, lastGeminiError);

            // Fallback: If model complains about system_instruction, retry without it by prepending to user prompt
            if (
              lastGeminiError.toLowerCase().includes('system_instruction') ||
              lastGeminiError.toLowerCase().includes('not supported')
            ) {
              const fallbackContents = buildGeminiContents(
                conversation,
                `${systemInstruction}\n\nUser Question:\n${cleanPrompt}`
              );
              const fallbackRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${geminiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: fallbackContents,
                    generationConfig: model.config,
                  }),
                }
              );
              if (fallbackRes.ok) {
                geminiResponse = await fallbackRes.json();
                successfulModel = model.id;
                break;
              }
            }
          }
        } catch (fetchErr) {
          lastGeminiError = fetchErr.message;
          lastStatusCode = 503;
          console.warn(`[Gemini API] Network fetch error with ${model.id}:`, fetchErr.message);
        }
      }

      if (geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = geminiResponse.candidates[0].content.parts[0].text;
        return res.json({
          configured: true,
          reply,
          provider: 'google-gemini',
          model: successfulModel || 'gemini-3.8-flash',
        });
      }

      if (lastGeminiError && !openaiKey) {
        const sanitizedError = sanitizeAiError(lastGeminiError, lastStatusCode);
        return res.status(lastStatusCode >= 400 && lastStatusCode < 600 ? lastStatusCode : 502).json({
          error: sanitizedError,
        });
      }
    }

    // 2. OpenAI Provider (Alternative / Fallback)
    if (openaiKey) {
      const messages = [{ role: 'system', content: systemInstruction }];
      if (Array.isArray(conversation)) {
        conversation.slice(-10).forEach((msg) => {
          if (msg && msg.text) {
            messages.push({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: String(msg.text),
            });
          }
        });
      }
      messages.push({ role: 'user', content: cleanPrompt });

      const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (apiRes.ok) {
        const openAiData = await apiRes.json();
        const reply = openAiData.choices?.[0]?.message?.content;
        if (reply) {
          return res.json({
            configured: true,
            reply,
            provider: 'openai',
          });
        }
      } else {
        const errBody = await apiRes.json().catch(() => ({}));
        return res.status(502).json({
          error: `OpenAI API returned: ${errBody?.error?.message || apiRes.statusText}`,
        });
      }
    }

    return res.status(500).json({ error: 'AI service could not generate a response. Please try again.' });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Unexpected error communicating with AI service.' });
  }
});

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
async function startServer() {
  try {
    await initDatabase();
    const geminiKey = getGeminiApiKey();
    const openaiKey = getOpenAIApiKey();

    app.listen(PORT, () => {
      console.log(`[CareNova Server] Running on http://localhost:${PORT}`);
      if (geminiKey) {
        console.log(`[CareNova AI] Google Gemini Key: DETECTED - Preferred Model: gemini-3.8-flash (Fallback: gemini-3.5-flash-lite)`);
      } else if (openaiKey) {
        console.log(`[CareNova AI] OpenAI Key: DETECTED - Live AI Active`);
      } else {
        console.log(`[CareNova AI] No AI API Key detected - Setup prompt active until GEMINI_API_KEY is added`);
      }
    });
  } catch (err) {
    console.error('[CareNova Server] Failed to initialize:', err);
    process.exit(1);
  }
}

startServer();
