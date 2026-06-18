/* ============================================================
   مسارات المصادقة والحسابات - authRoutes.js
   تسجيل الدخول، إنشاء حساب، الملف الشخصي، استعادة كلمة المرور
   ============================================================ */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');
const { authenticateToken, logActivity } = require('../backend/middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'SmartMenuSecret@2026JWT!';
const JWT_EXPIRE = '30d';

/* سجل محاولات تسجيل الدخول الفاشلة */
const loginAttempts = new Map();

/* ============================================================
   تسجيل الدخول
   ============================================================ */
router.post('/login', (req, res) => {
  const { identifier, password, remember } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات المطلوبة' });
  }

  /* فحص محاولات الدخول */
  const attempts = loginAttempts.get(identifier) || { count: 0, lockUntil: 0 };
  if (Date.now() < attempts.lockUntil) {
    const minutes = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
    return res.status(429).json({ success: false, message: `تم إيقاف المحاولات. حاول بعد ${minutes} دقيقة` });
  }

  /* البحث عن المستخدم بالإيميل أو الهاتف */
  const user = db.prepare(`
    SELECT * FROM users WHERE (email = ? OR phone = ?) AND status != 'blocked'
  `).get(identifier, identifier);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    attempts.count = (attempts.count || 0) + 1;
    if (attempts.count >= 5) {
      attempts.lockUntil = Date.now() + 15 * 60 * 1000;
      attempts.count = 0;
    }
    loginAttempts.set(identifier, attempts);
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
  }

  /* إعادة ضبط المحاولات */
  loginAttempts.delete(identifier);

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: remember ? '30d' : '7d' }
  );

  logActivity(user.id, 'login', 'تسجيل دخول ناجح', req.ip);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      role: user.role,
      points: user.points,
      loyalty_level: user.loyalty_level,
      language: user.language,
      currency: user.currency,
    }
  });
});

/* ============================================================
   إنشاء حساب جديد
   ============================================================ */
router.post('/register', (req, res) => {
  const { full_name, email, phone, password, confirm_password } = req.body;

  if (!full_name || (!email && !phone) || !password) {
    return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول المطلوبة' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ success: false, message: 'كلمتا المرور غير متطابقتين' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  }

  /* التحقق من عدم تكرار البريد أو الهاتف */
  if (email) {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
  }

  if (phone) {
    const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (exists) return res.status(409).json({ success: false, message: 'رقم الهاتف مستخدم بالفعل' });
  }

  const hashedPassword = bcrypt.hashSync(password, 12);

  const result = db.prepare(`
    INSERT INTO users (full_name, email, phone, password, role, status)
    VALUES (?, ?, ?, ?, 'customer', 'active')
  `).run(full_name, email || null, phone || null, hashedPassword);

  const token = jwt.sign({ id: result.lastInsertRowid, role: 'customer' }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

  logActivity(result.lastInsertRowid, 'register', 'إنشاء حساب جديد', req.ip);

  res.status(201).json({ success: true, token, message: 'تم إنشاء الحساب بنجاح' });
});

/* ============================================================
   الملف الشخصي
   ============================================================ */
router.get('/profile', authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, full_name, email, phone, profile_image, points, status, role,
           language, currency, loyalty_level, total_spent, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

  const orders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(req.user.id);
  const favorites = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(req.user.id);

  res.json({ success: true, user: { ...user, orders_count: orders.count, favorites_count: favorites.count } });
});

/* ============================================================
   تحديث الملف الشخصي
   ============================================================ */
router.put('/profile', authenticateToken, (req, res) => {
  const { full_name, phone, language, currency } = req.body;

  db.prepare(`
    UPDATE users SET full_name = ?, phone = ?, language = ?, currency = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(full_name, phone, language, currency, req.user.id);

  res.json({ success: true, message: 'تم تحديث الملف الشخصي بنجاح' });
});

/* ============================================================
   تغيير كلمة المرور
   ============================================================ */
router.put('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password)) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
  }

  const hashed = bcrypt.hashSync(new_password, 12);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

/* ============================================================
   تسجيل الخروج
   ============================================================ */
router.post('/logout', authenticateToken, (req, res) => {
  logActivity(req.user.id, 'logout', 'تسجيل خروج', req.ip);
  res.json({ success: true, message: 'تم تسجيل الخروج' });
});

/* ============================================================
   التحقق من التوكن
   ============================================================ */
router.get('/verify', authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, full_name, email, phone, profile_image, points, role, language, currency, loyalty_level
    FROM users WHERE id = ? AND status = 'active'
  `).get(req.user.id);

  if (!user) return res.status(401).json({ success: false, message: 'غير مصرح' });
  res.json({ success: true, user });
});

/* ============================================================
   الإحصائيات الخاصة بالمستخدم
   ============================================================ */
router.get('/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const orders = db.prepare("SELECT COUNT(*) as count, SUM(total) as total FROM orders WHERE user_id = ? AND status = 'completed'").get(userId);
  const points = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
  const pointsHistory = db.prepare('SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(userId);
  const favorites = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(userId);
  const coupons = db.prepare("SELECT COUNT(*) as count FROM coupons WHERE status = 'active'").get();

  res.json({
    success: true,
    stats: {
      orders_count: orders.count,
      total_spent: orders.total || 0,
      points: points?.points || 0,
      favorites_count: favorites.count,
      available_coupons: coupons.count,
      points_history: pointsHistory,
    }
  });
});

module.exports = router;