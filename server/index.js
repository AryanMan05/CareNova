// CareNova REST API Server (Node.js + Express + SQLite / Turso)
// Lead Architect: Aryan More

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.js';

dotenv.config();

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

    const profileRes = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [req.user.id],
    });

    res.json({
      user,
      profile: profileRes.rows[0] || null,
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
        req.user.id,
      ],
    });

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
// Start Server
// -------------------------------------------------------------
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`[CareNova Server] Running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[CareNova Server] Failed to initialize:', err);
    process.exit(1);
  }
}

startServer();
