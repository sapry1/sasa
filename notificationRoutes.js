/* ============================================================
   مسارات الإشعارات والإعدادات والتحليلات - notificationRoutes.js
   الإشعارات، الإعدادات، السجلات، التحليلات، العملاء
   ============================================================ */

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { authenticateToken, requireAdmin, logActivity, upload } = require('../backend/middleware');
const path = require('path');
const fs = require('fs');

/* ============================================================
   الإشعارات - المستخدم
   ============================================================ */
router.get('/notifications', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const general = db.prepare(`
    SELECT n.*, 0 as is_read FROM notifications n
    WHERE n.target = 'all' AND n.status = 'active'
    ORDER BY n.created_at DESC LIMIT 20
  `).all();

  const personal = db.prepare(`
    SELECT n.*, un.is_read FROM notifications n
    JOIN user_notifications un ON un.notification_id = n.id
    WHERE un.user_id = ? AND n.target = 'user'
    ORDER BY n.created_at DESC LIMIT 30
  `).all(userId);

  const all = [...personal, ...general].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const unread = all.filter(n => !n.is_read).length;

  res.json({ success: true, notifications: all, unread });
});

/* تعليم الإشعار كمقروء */
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  db.prepare('UPDATE user_notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

/* تعليم الكل كمقروء */
router.put('/notifications/read-all', authenticateToken, (req, res) => {
  db.prepare('UPDATE user_notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true, message: 'تم تعليم الكل كمقروء' });
});

/* ============================================================
   إدارة الإشعارات - ADMIN
   ============================================================ */
router.get('/admin/notifications', requireAdmin, (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
  res.json({ success: true, notifications });
});

router.post('/admin/notifications', requireAdmin, upload.single('image'), (req, res) => {
  const { title, description, url, type, target, target_user_id } = req.body;
  const image = req.file ? `/uploads/banners/${req.file.filename}` : req.body.image;

  const result = db.prepare(`
    INSERT INTO notifications (title, description, image, url, type, target, target_user_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(title, description, image, url, type || 'text', target || 'all', target_user_id || null);

  /* إضافة لجميع المستخدمين إذا كان عاماً */
  if (target === 'all') {
    const users = db.prepare("SELECT id FROM users WHERE status = 'active' AND role = 'customer'").all();
    const insertUN = db.prepare('INSERT INTO user_notifications (notification_id, user_id) VALUES (?, ?)');
    users.forEach(u => { try { insertUN.run(result.lastInsertRowid, u.id); } catch (e) {} });
  } else if (target_user_id) {
    try {
      db.prepare('INSERT INTO user_notifications (notification_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, target_user_id);
    } catch (e) {}
  }

  logActivity(req.user.id, 'send_notification', `إرسال إشعار: ${title}`, req.ip);
  res.status(201).json({ success: true, message: 'تم إرسال الإشعار بنجاح' });
});

router.delete('/admin/notifications/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'تم حذف الإشعار' });
});

/* ============================================================
   الإعدادات - ADMIN
   ============================================================ */
router.get('/settings', (req, res) => {
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  settings.forEach(s => obj[s.key] = s.value);
  res.json({ success: true, settings: obj });
});

router.put('/admin/settings', requireAdmin, upload.fields([
  { name: 'store_logo', maxCount: 1 },
  { name: 'developer_logo', maxCount: 1 }
]), (req, res) => {
  const body = req.body;

  if (req.files?.store_logo?.[0]) {
    body.store_logo = `/uploads/logo/${req.files.store_logo[0].filename}`;
  }
  if (req.files?.developer_logo?.[0]) {
    body.developer_logo = `/uploads/logo/${req.files.developer_logo[0].filename}`;
  }

  const updateSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
  `);

  Object.entries(body).forEach(([key, value]) => {
    if (key && value !== undefined) updateSetting.run(key, value);
  });

  logActivity(req.user.id, 'update_settings', 'تحديث إعدادات المتجر', req.ip);
  res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
});

/* ============================================================
   إدارة العملاء - ADMIN
   ============================================================ */
router.get('/admin/customers', requireAdmin, (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = ["role = 'customer'"];
  let params = [];

  if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
  if (search) {
    where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereStr = 'WHERE ' + where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereStr}`).get(...params);
  const customers = db.prepare(`
    SELECT id, full_name, email, phone, profile_image, points, status, loyalty_level, total_spent, created_at
    FROM users ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const withOrders = customers.map(c => ({
    ...c,
    orders_count: db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(c.id).count
  }));

  res.json({ success: true, customers: withOrders, total: total.count });
});

router.put('/admin/customers/:id', requireAdmin, (req, res) => {
  const { status, points } = req.body;
  db.prepare('UPDATE users SET status = ?, points = ? WHERE id = ?').run(status, points, req.params.id);
  logActivity(req.user.id, 'update_customer', `تحديث عميل ID: ${req.params.id}`, req.ip);
  res.json({ success: true, message: 'تم تحديث بيانات العميل' });
});

/* ============================================================
   التحليلات - ADMIN
   ============================================================ */
router.get('/admin/analytics', requireAdmin, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const todayOrders = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE date(created_at) = ? AND status != 'cancelled'`).get(today);
  const monthOrders = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE strftime('%Y-%m', created_at) = ? AND status != 'cancelled'`).get(thisMonth);
  const totalOrders = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE status = 'completed'`).get();
  const totalCustomers = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`).get();
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  const pendingOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`).get();
  const totalReviews = db.prepare(`SELECT COUNT(*) as count FROM reviews WHERE status = 'approved'`).get();

  const topProducts = db.prepare(`
    SELECT p.name, p.main_image, p.price,
           COALESCE(SUM(oi.quantity), 0) as total_sold,
           COALESCE(SUM(oi.total), 0) as revenue
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
    GROUP BY p.id ORDER BY total_sold DESC LIMIT 5
  `).all();

  const topCategories = db.prepare(`
    SELECT c.name, COUNT(DISTINCT oi.id) as orders_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY c.id ORDER BY orders_count DESC LIMIT 5
  `).all();

  const recentOrders = db.prepare(`
    SELECT o.order_number, o.total, o.status, o.created_at, u.full_name
    FROM orders o LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();

  const salesByDay = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as revenue, COUNT(*) as count
    FROM orders WHERE status != 'cancelled' AND created_at >= date('now', '-7 days')
    GROUP BY day ORDER BY day
  `).all();

  const ordersByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `).all();

  res.json({
    success: true,
    analytics: {
      today: { orders: todayOrders.count, revenue: todayOrders.revenue },
      month: { orders: monthOrders.count, revenue: monthOrders.revenue },
      total: { orders: totalOrders.count, revenue: totalOrders.revenue },
      customers: totalCustomers.count,
      products: totalProducts.count,
      pending_orders: pendingOrders.count,
      reviews: totalReviews.count,
      top_products: topProducts,
      top_categories: topCategories,
      recent_orders: recentOrders,
      sales_by_day: salesByDay,
      orders_by_status: ordersByStatus,
    }
  });
});

/* ============================================================
   سجل النشاط - ADMIN
   ============================================================ */
router.get('/admin/activity-logs', requireAdmin, (req, res) => {
  const logs = db.prepare(`
    SELECT al.*, u.full_name FROM activity_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 100
  `).all();
  res.json({ success: true, logs });
});

/* ============================================================
   النسخ الاحتياطية - ADMIN
   ============================================================ */
router.get('/admin/backups', requireAdmin, (req, res) => {
  const backupDir = path.join(__dirname, '../backups');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).map(f => {
    const stat = fs.statSync(path.join(backupDir, f));
    return { name: f, size: (stat.size / 1024).toFixed(2) + ' KB', created_at: stat.birthtime };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, backups: files });
});

router.post('/admin/backups', requireAdmin, (req, res) => {
  const tables = ['users', 'categories', 'products', 'orders', 'order_items', 'reviews', 'notifications', 'payment_methods', 'coupons', 'settings', 'sliders'];
  const backup = {};
  tables.forEach(t => {
    try { backup[t] = db.prepare(`SELECT * FROM ${t}`).all(); } catch (e) {}
  });

  const filename = `backup-${Date.now()}.json`;
  const filepath = path.join(__dirname, '../backups', filename);
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

  logActivity(req.user.id, 'create_backup', `إنشاء نسخة احتياطية: ${filename}`, req.ip);
  res.json({ success: true, filename, message: 'تم إنشاء النسخة الاحتياطية بنجاح' });
});

router.delete('/admin/backups/:name', requireAdmin, (req, res) => {
  const filepath = path.join(__dirname, '../backups', req.params.name);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  res.json({ success: true, message: 'تم حذف النسخة الاحتياطية' });
});

/* ============================================================
   الصفحات الثابتة
   ============================================================ */
router.get('/pages/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
  if (!page) return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
  res.json({ success: true, page });
});

router.put('/admin/pages/:slug', requireAdmin, (req, res) => {
  const { title, content, content_en, seo_title, seo_description } = req.body;
  const exists = db.prepare('SELECT id FROM pages WHERE slug = ?').get(req.params.slug);
  if (exists) {
    db.prepare('UPDATE pages SET title=?, content=?, content_en=?, seo_title=?, seo_description=? WHERE slug=?').run(title, content, content_en, seo_title, seo_description, req.params.slug);
  } else {
    db.prepare('INSERT INTO pages (title, slug, content, content_en, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?)').run(title, req.params.slug, content, content_en, seo_title, seo_description);
  }
  res.json({ success: true, message: 'تم حفظ الصفحة' });
});

/* ============================================================
   إدارة مستخدمي الأدمن
   ============================================================ */
router.get('/admin/admins', requireAdmin, (req, res) => {
  const admins = db.prepare(`SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE role IN ('admin','manager','employee')`).all();
  res.json({ success: true, admins });
});

router.post('/admin/admins', requireAdmin, (req, res) => {
  const { full_name, email, phone, password, role } = req.body;
  const bcrypt = require('bcryptjs');
  const hashed = bcrypt.hashSync(password, 12);
  db.prepare(`INSERT INTO users (full_name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, 'active')`).run(full_name, email, phone, hashed, role);
  logActivity(req.user.id, 'add_admin', `إضافة مستخدم إدارة: ${full_name}`, req.ip);
  res.status(201).json({ success: true, message: 'تم إضافة المستخدم' });
});

/* إحصائيات لوحة التحكم الرئيسية */
router.get('/admin/dashboard', requireAdmin, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    orders_today: db.prepare(`SELECT COUNT(*) as c FROM orders WHERE date(created_at) = ?`).get(today).c,
    revenue_today: db.prepare(`SELECT COALESCE(SUM(total),0) as r FROM orders WHERE date(created_at) = ? AND status != 'cancelled'`).get(today).r,
    customers_total: db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'customer'`).get().c,
    products_total: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
    pending_orders: db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'pending'`).get().c,
    pending_reviews: db.prepare(`SELECT COUNT(*) as c FROM reviews WHERE status = 'pending'`).get().c,
    revenue_total: db.prepare(`SELECT COALESCE(SUM(total),0) as r FROM orders WHERE status = 'completed'`).get().r,
    recent_orders: db.prepare(`SELECT o.*, u.full_name FROM orders o LEFT JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 5`).all(),
    recent_customers: db.prepare(`SELECT id, full_name, email, phone, created_at FROM users WHERE role='customer' ORDER BY created_at DESC LIMIT 5`).all(),
  };
  res.json({ success: true, stats });
});

/* تسجيل الزائر */
router.post('/visitor', (req, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO visitors (ip_address) VALUES (?)').run(req.ip);
  } catch (e) {}
  const todayCount = db.prepare(`SELECT COUNT(*) as c FROM visitors WHERE visit_date = date('now')`).get().c;
  res.json({ success: true, visitors_today: todayCount });
});

/* عدد المتصلين */
router.get('/online-count', (req, res) => {
  const count = global.onlineUsers ? global.onlineUsers.size : 0;
  res.json({ success: true, count: Math.max(count, 1) });
});

module.exports = router;