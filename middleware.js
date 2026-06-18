/* ============================================================
   Middleware المساعد - middleware.js
   JWT، صلاحيات الأدمن، رفع الملفات، تسجيل النشاط
   ============================================================ */

const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'SmartMenuSecret@2026JWT!';

/* ============================================================
   التحقق من التوكن
   ============================================================ */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول أولاً' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' });
    req.user = user;
    next();
  });
};

/* ============================================================
   التحقق من صلاحيات الأدمن
   ============================================================ */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'غير مصرح' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'انتهت الجلسة' });
    if (!['admin', 'manager', 'employee'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية الوصول' });
    }
    req.user = user;
    next();
  });
};

/* ============================================================
   إعداد رفع الملفات
   ============================================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'main_image' || file.fieldname === 'images') folder = 'uploads/products';
    else if (file.fieldname === 'image' && req.path.includes('categor')) folder = 'uploads/categories';
    else if (file.fieldname === 'image' && req.path.includes('slider')) folder = 'uploads/banners';
    else if (file.fieldname === 'image' && req.path.includes('notif')) folder = 'uploads/banners';
    else if (file.fieldname === 'store_logo' || file.fieldname === 'developer_logo') folder = 'uploads/logo';
    else if (file.fieldname === 'proof') folder = 'uploads/payments';
    else if (file.fieldname.includes('review') || req.path.includes('review')) folder = 'uploads/reviews';
    else folder = 'uploads/products';

    const fullPath = path.join(__dirname, '..', folder);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E6) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('نوع الملف غير مدعوم. يُسمح بـ JPG, PNG, WEBP, SVG فقط'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* ============================================================
   تسجيل النشاط
   ============================================================ */
const logActivity = (userId, action, description, ip) => {
  try {
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, description, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(userId, action, description, ip);
  } catch (e) {}
};

module.exports = { authenticateToken, requireAdmin, upload, logActivity };