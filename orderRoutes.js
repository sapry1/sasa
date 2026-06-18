/* ============================================================
   مسارات الطلبات والسلة والكوبونات والنقاط - orderRoutes.js
   إنشاء الطلبات، تتبعها، الكوبونات، نظام النقاط
   ============================================================ */

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { authenticateToken, requireAdmin, logActivity } = require('../backend/middleware');
const { v4: uuidv4 } = require('uuid');

/* ============================================================
   إنشاء طلب جديد
   ============================================================ */
router.post('/orders', authenticateToken, (req, res) => {
  const { items, payment_method_id, coupon_code, points_used, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'السلة فارغة' });
  }

  /* التحقق من إعداد الحد الأدنى */
  const minOrder = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'min_order'").get()?.value || 0);

  /* حساب الإجمالي */
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(item.product_id, 'available');
    if (!product) {
      return res.status(400).json({ success: false, message: `المنتج "${item.name}" غير متوفر` });
    }
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.main_image,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    });
  }

  if (subtotal < minOrder) {
    return res.status(400).json({ success: false, message: `الحد الأدنى للطلب ${minOrder} ج.م` });
  }

  /* تطبيق الكوبون */
  let discount = 0;
  if (coupon_code) {
    const coupon = db.prepare(`
      SELECT * FROM coupons
      WHERE code = ? AND status = 'active'
      AND (end_date IS NULL OR date(end_date) >= date('now'))
      AND (usage_limit = 0 OR used_count < usage_limit)
      AND minimum_order <= ?
    `).get(coupon_code, subtotal);

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'الكوبون غير صالح أو منتهي الصلاحية' });
    }

    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
    db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(coupon_code);
  }

  /* تطبيق النقاط */
  let pointsDiscount = 0;
  const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.id);
  const pointsValue = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'points_value'").get()?.value || 1);

  if (points_used && points_used > 0) {
    const maxPoints = Math.min(points_used, user.points);
    pointsDiscount = maxPoints * pointsValue;
    pointsDiscount = Math.min(pointsDiscount, subtotal - discount);
  }

  const total = Math.max(0, subtotal - discount - pointsDiscount);

  /* إنشاء رقم الطلب */
  const orderNumber = 'SM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

  /* إدراج الطلب */
  const orderResult = db.prepare(`
    INSERT INTO orders (order_number, user_id, payment_method_id, subtotal, discount, points_used, coupon_code, total, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(orderNumber, req.user.id, payment_method_id, subtotal, discount + pointsDiscount, points_used || 0, coupon_code, total, notes);

  /* إدراج العناصر */
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  orderItems.forEach(item => {
    insertItem.run(orderResult.lastInsertRowid, item.product_id, item.product_name, item.product_image, item.quantity, item.price, item.total);
    db.prepare('UPDATE products SET orders_count = orders_count + ? WHERE id = ?').run(item.quantity, item.product_id);
  });

  /* خصم النقاط المستخدمة */
  if (points_used > 0) {
    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(points_used, req.user.id);
    db.prepare('INSERT INTO points_history (user_id, points, type, description, order_id) VALUES (?, ?, ?, ?, ?)').run(
      req.user.id, -points_used, 'spend', `استخدام نقاط في الطلب ${orderNumber}`, orderResult.lastInsertRowid
    );
  }

  /* إشعار الطلب الجديد */
  db.prepare(`
    INSERT INTO notifications (title, description, type, target, target_user_id)
    VALUES (?, ?, 'text', 'user', ?)
  `).run('تم استلام طلبك', `رقم الطلب: ${orderNumber} - إجمالي: ${total} ج.م`, req.user.id);

  logActivity(req.user.id, 'create_order', `إنشاء طلب: ${orderNumber}`, req.ip);

  res.status(201).json({
    success: true,
    order: { id: orderResult.lastInsertRowid, order_number: orderNumber, total, status: 'pending' },
    message: 'تم تقديم طلبك بنجاح!'
  });
});

/* ============================================================
   طلبات المستخدم
   ============================================================ */
router.get('/orders/my', authenticateToken, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, pm.name as payment_method_name
    FROM orders o
    LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);

  const ordersWithItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  }));

  res.json({ success: true, orders: ordersWithItems });
});

/* جلب طلب واحد */
router.get('/orders/:id', authenticateToken, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, pm.name as payment_method_name, pm.account_number, pm.account_name,
           u.full_name as customer_name, u.phone as customer_phone
    FROM orders o
    LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')
  `).get(req.params.id, req.user.id, req.user.role);

  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ success: true, order: { ...order, items } });
});

/* رفع إثبات الدفع */
const multer = require('multer');
const path = require('path');
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/payments')),
  filename: (req, file, cb) => cb(null, 'proof-' + Date.now() + path.extname(file.originalname))
});
const uploadProof = multer({ storage: paymentStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/orders/:id/payment-proof', authenticateToken, uploadProof.single('proof'), (req, res) => {
  const order = db.prepare('SELECT id, user_id FROM orders WHERE id = ?').get(req.params.id);
  if (!order || order.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'غير مصرح' });
  }

  const proofPath = `/uploads/payments/${req.file.filename}`;
  db.prepare('UPDATE orders SET payment_proof = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(proofPath, order.id);

  res.json({ success: true, proof_url: proofPath, message: 'تم رفع إثبات الدفع بنجاح' });
});

/* إلغاء طلب */
router.put('/orders/:id/cancel', authenticateToken, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  if (!['pending'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'لا يمكن إلغاء هذا الطلب' });
  }
  db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
  res.json({ success: true, message: 'تم إلغاء الطلب' });
});

/* ============================================================
   إدارة الطلبات - ADMIN
   ============================================================ */
router.get('/admin/orders', requireAdmin, (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];

  if (status && status !== 'all') { where.push('o.status = ?'); params.push(status); }
  if (search) {
    where.push('(o.order_number LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o LEFT JOIN users u ON u.id = o.user_id ${whereStr}`).get(...params);
  const orders = db.prepare(`
    SELECT o.*, u.full_name as customer_name, u.phone as customer_phone, pm.name as payment_method_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
    ${whereStr}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ success: true, orders, total: total.count });
});

/* تحديث حالة الطلب - ADMIN */
router.put('/admin/orders/:id', requireAdmin, (req, res) => {
  const { status, notes } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

  db.prepare(`
    UPDATE orders SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(status, notes, order.id);

  /* منح النقاط عند اكتمال الطلب */
  if (status === 'completed' && order.status !== 'completed') {
    const pointsPerHundred = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'points_per_100'").get()?.value || 10);
    const earnedPoints = Math.floor(order.total / 100) * pointsPerHundred;
    if (earnedPoints > 0) {
      db.prepare('UPDATE users SET points = points + ?, total_spent = total_spent + ? WHERE id = ?').run(earnedPoints, order.total, order.user_id);
      db.prepare('INSERT INTO points_history (user_id, points, type, description, order_id) VALUES (?, ?, ?, ?, ?)').run(
        order.user_id, earnedPoints, 'earn', `نقاط مكافأة على الطلب ${order.order_number}`, order.id
      );
      /* تحديث مستوى الولاء */
      updateLoyaltyLevel(order.user_id);
    }
  }

  /* إشعار المستخدم */
  const statusMessages = {
    processing: 'جاري تجهيز طلبك',
    ready: 'طلبك جاهز!',
    completed: 'تم اكتمال طلبك بنجاح',
    rejected: 'تم رفض طلبك',
    cancelled: 'تم إلغاء طلبك',
  };
  if (statusMessages[status]) {
    db.prepare(`INSERT INTO notifications (title, description, type, target, target_user_id) VALUES (?, ?, 'text', 'user', ?)`).run(
      statusMessages[status], `رقم الطلب: ${order.order_number}`, order.user_id
    );
  }

  logActivity(req.user.id, 'update_order', `تحديث طلب ${order.order_number} إلى: ${status}`, req.ip);
  res.json({ success: true, message: 'تم تحديث حالة الطلب' });
});

/* مساعد: تحديث مستوى الولاء */
function updateLoyaltyLevel(userId) {
  const user = db.prepare('SELECT total_spent FROM users WHERE id = ?').get(userId);
  let level = 'bronze';
  if (user.total_spent >= 10000) level = 'diamond';
  else if (user.total_spent >= 5000) level = 'platinum';
  else if (user.total_spent >= 2000) level = 'gold';
  else if (user.total_spent >= 500) level = 'silver';
  db.prepare('UPDATE users SET loyalty_level = ? WHERE id = ?').run(level, userId);
}

/* ============================================================
   الكوبونات
   ============================================================ */
router.post('/coupons/verify', authenticateToken, (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = db.prepare(`
    SELECT * FROM coupons WHERE code = ? AND status = 'active'
    AND (end_date IS NULL OR date(end_date) >= date('now'))
    AND (usage_limit = 0 OR used_count < usage_limit)
    AND minimum_order <= ?
  `).get(code, subtotal);

  if (!coupon) return res.status(400).json({ success: false, message: 'الكوبون غير صالح أو منتهي الصلاحية' });

  let discount = 0;
  if (coupon.type === 'percentage') discount = (subtotal * coupon.value) / 100;
  else if (coupon.type === 'fixed') discount = coupon.value;

  res.json({ success: true, coupon, discount: Math.min(discount, subtotal) });
});

/* إدارة الكوبونات - ADMIN */
router.get('/admin/coupons', requireAdmin, (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  res.json({ success: true, coupons });
});

router.post('/admin/coupons', requireAdmin, (req, res) => {
  const { code, type, value, minimum_order, usage_limit, start_date, end_date } = req.body;
  db.prepare(`INSERT OR IGNORE INTO coupons (code, type, value, minimum_order, usage_limit, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`).run(code, type, value, minimum_order, usage_limit, start_date, end_date);
  logActivity(req.user.id, 'add_coupon', `إضافة كوبون: ${code}`, req.ip);
  res.status(201).json({ success: true, message: 'تم إضافة الكوبون' });
});

router.put('/admin/coupons/:id', requireAdmin, (req, res) => {
  const { code, type, value, minimum_order, usage_limit, start_date, end_date, status } = req.body;
  db.prepare(`UPDATE coupons SET code=?, type=?, value=?, minimum_order=?, usage_limit=?, start_date=?, end_date=?, status=? WHERE id=?`).run(code, type, value, minimum_order, usage_limit, start_date, end_date, status, req.params.id);
  res.json({ success: true, message: 'تم تحديث الكوبون' });
});

router.delete('/admin/coupons/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'تم حذف الكوبون' });
});

module.exports = router;