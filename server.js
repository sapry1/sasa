/* ============================================================
   الخادم الرئيسي - SMART MENU CMS
   server.js — Express + WebSocket + جميع المسارات
   ============================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

/* ============================================================
   إعداد WebSocket للمزامنة الفورية
   ============================================================ */
const wss = new WebSocketServer({ server });
global.onlineUsers = new Set();
const clients = new Set();

wss.on('connection', (ws, req) => {
  clients.add(ws);
  global.onlineUsers.add(ws);

  /* إرسال عدد المتصلين للجميع */
  broadcast({ type: 'online_count', count: clients.size });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch (e) {}
  });

  ws.on('close', () => {
    clients.delete(ws);
    global.onlineUsers.delete(ws);
    broadcast({ type: 'online_count', count: clients.size });
  });

  ws.on('error', () => {
    clients.delete(ws);
    global.onlineUsers.delete(ws);
  });
});

/* إرسال رسالة لجميع المتصلين */
function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    try { if (client.readyState === 1) client.send(msg); } catch (e) {}
  });
}

/* تصدير دالة البث للاستخدام في المسارات */
global.broadcastUpdate = broadcast;

/* ============================================================
   Middleware أساسية
   ============================================================ */
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ============================================================
   Rate Limiting — حماية من الطلبات المتكررة
   ============================================================ */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'طلبات كثيرة جداً، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'محاولات دخول كثيرة، حاول بعد 15 دقيقة' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

/* ============================================================
   تقديم الملفات الثابتة
   ============================================================ */
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/backups', (req, res) => res.status(403).send('غير مصرح'));

/* ============================================================
   تحميل المسارات
   ============================================================ */
const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const notificationRoutes = require('../routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', reviewRoutes);
app.use('/api', notificationRoutes);

/* ============================================================
   مسار وضع الصيانة
   ============================================================ */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  try {
    const db = require('../database/database');
    const maintenance = db.prepare("SELECT value FROM settings WHERE key = 'maintenance_mode'").get();
    if (maintenance?.value === '1' && !req.path.includes('X7mK29LpQ8T')) {
      return res.send(`
        <!DOCTYPE html><html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تحت الصيانة</title>
        <style>body{font-family:Cairo,sans-serif;background:#0F1115;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
        .box{padding:40px;max-width:400px}.icon{font-size:80px;margin-bottom:20px}h1{font-size:28px;color:#FF6B00}p{color:#A7A7A7}</style></head>
        <body><div class="box"><div class="icon">🔧</div><h1>المتجر تحت الصيانة</h1><p>نعمل على تحسين الموقع. سنعود قريباً!</p></div></body></html>
      `);
    }
  } catch (e) {}
  next();
});

/* ============================================================
   جميع الطلبات تعود إلى index.html (SPA)
   ============================================================ */
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ success: false, message: 'المسار غير موجود' });
  res.sendFile(path.join(rootDir, 'index.html'));
});

/* ============================================================
   معالج الأخطاء العام
   ============================================================ */
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'حجم الملف كبير جداً (الحد الأقصى 10 ميجا)' });
  }
  res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
});

/* ============================================================
   تشغيل الخادم
   ============================================================ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     SMART MENU CMS - تم التشغيل بنجاح    ║
  ║                                           ║
  ║  الرابط: http://localhost:${PORT}            ║
  ║  لوحة التحكم: /X7mK29LpQ8T               ║
  ║  ID: admin | Password: SmartMenu@2026     ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = { app, broadcast };