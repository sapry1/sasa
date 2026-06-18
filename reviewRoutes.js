/* ============================================================
   مسارات التعليقات والتقييمات - reviewRoutes.js
   إضافة تعليقات، مراجعتها، قبولها أو رفضها
   ============================================================ */

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { authenticateToken, requireAdmin, upload, logActivity } = require('../backend/middleware');

/* ============================================================
   التعليقات العامة المعتمدة
   ============================================================ */
router.get('/reviews', (req, res) => {
  const { product_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let where = ["r.status = 'approved'"];
  let params = [];

  if (product_id) { where.push('r.product_id = ?'); params.push(product_id); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) as count FROM reviews r ${whereStr}`).get(...params);
  const reviews = db.prepare(`
    SELECT r.*, u.profile_image as user_image,
           p.name as product_name, p.main_image as product_image
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN products p ON p.id = r.product_id
    ${whereStr}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  const withImages = reviews.map(r => ({
    ...r,
    images: db.prepare('SELECT image FROM review_images WHERE review_id = ?').all(r.id)
  }));

  res.json({ success: true, reviews: withImages, total: total.count });
});

/* ============================================================
   إضافة تعليق - يتطلب تسجيل دخول
   ============================================================ */
router.post('/reviews', authenticateToken, upload.array('images', 5), (req, res) => {
  const { product_id, rating, review } = req.body;

  if (!product_id || !rating || !review) {
    return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول' });
  }

  /* التحقق من أن المستخدم اشترى هذا المنتج */
  const hasPurchased = db.prepare(`
    SELECT oi.id FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'
  `).get(req.user.id, product_id);

  /* التحقق من عدم تكرار التعليق */
  const alreadyReviewed = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'لقد أرسلت تعليقاً على هذا المنتج بالفعل' });
  }

  const user = db.prepare('SELECT full_name FROM users WHERE id = ?').get(req.user.id);

  const result = db.prepare(`
    INSERT INTO reviews (user_id, product_id, customer_name, rating, review, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(req.user.id, product_id, user.full_name, rating, review);

  /* حفظ صور التعليق */
  if (req.files && req.files.length > 0) {
    const insertImg = db.prepare('INSERT INTO review_images (review_id, image) VALUES (?, ?)');
    req.files.forEach(f => insertImg.run(result.lastInsertRowid, `/uploads/reviews/${f.filename}`));
  }

  res.status(201).json({ success: true, message: 'تم إرسال تعليقك وسيظهر بعد المراجعة' });
});

/* ============================================================
   إدارة التعليقات - ADMIN
   ============================================================ */
router.get('/admin/reviews', requireAdmin, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const where = status && status !== 'all' ? `WHERE r.status = '${status}'` : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM reviews r ${where}`).get();
  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name, u.full_name as user_name
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    LEFT JOIN users u ON u.id = r.user_id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(parseInt(limit), offset);

  const withImages = reviews.map(r => ({
    ...r,
    images: db.prepare('SELECT image FROM review_images WHERE review_id = ?').all(r.id)
  }));

  res.json({ success: true, reviews: withImages, total: total.count });
});

/* قبول/رفض تعليق */
router.put('/admin/reviews/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'التعليق غير موجود' });

  db.prepare('UPDATE reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, review.id);

  /* إشعار المستخدم */
  if (review.user_id) {
    const msg = status === 'approved' ? 'تم قبول تعليقك' : 'تم رفض تعليقك';
    db.prepare(`INSERT INTO notifications (title, description, type, target, target_user_id) VALUES (?, ?, 'text', 'user', ?)`).run(
      msg, `تعليقك على المنتج تم ${status === 'approved' ? 'قبوله' : 'رفضه'}`, review.user_id
    );
  }

  /* تحديث تقييم المنتج */
  if (review.product_id) {
    const avg = db.prepare(`
      SELECT AVG(rating) as avg FROM reviews WHERE product_id = ? AND status = 'approved'
    `).get(review.product_id);
    db.prepare('UPDATE products SET rating = ? WHERE id = ?').run(avg.avg || 0, review.product_id);
  }

  logActivity(req.user.id, 'review_action', `${status} تعليق ID: ${review.id}`, req.ip);
  res.json({ success: true, message: 'تم تحديث حالة التعليق' });
});

router.delete('/admin/reviews/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, 'delete_review', `حذف تعليق ID: ${req.params.id}`, req.ip);
  res.json({ success: true, message: 'تم حذف التعليق' });
});

/* ============================================================
   الأسئلة الشائعة
   ============================================================ */
router.get('/faq', (req, res) => {
  const faq = db.prepare("SELECT * FROM faq WHERE status = 'active' ORDER BY sort_order").all();
  res.json({ success: true, faq });
});

router.post('/admin/faq', requireAdmin, (req, res) => {
  const { question, question_en, answer, answer_en, category, sort_order } = req.body;
  db.prepare(`INSERT INTO faq (question, question_en, answer, answer_en, category, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`).run(question, question_en, answer, answer_en, category, sort_order);
  res.status(201).json({ success: true, message: 'تم إضافة السؤال' });
});

router.put('/admin/faq/:id', requireAdmin, (req, res) => {
  const { question, question_en, answer, answer_en, category, sort_order, status } = req.body;
  db.prepare(`UPDATE faq SET question=?, question_en=?, answer=?, answer_en=?, category=?, sort_order=?, status=? WHERE id=?`).run(question, question_en, answer, answer_en, category, sort_order, status, req.params.id);
  res.json({ success: true, message: 'تم تحديث السؤال' });
});

router.delete('/admin/faq/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM faq WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'تم حذف السؤال' });
});

/* ============================================================
   الرسائل الخاصة
   ============================================================ */
router.get('/messages', authenticateToken, (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.full_name as sender_name, u.profile_image as sender_image
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.receiver_id = ?
    ORDER BY m.created_at DESC
    LIMIT 50
  `).all(req.user.id);

  /* تعليم القراءة */
  db.prepare('UPDATE messages SET is_read = 1 WHERE receiver_id = ?').run(req.user.id);

  res.json({ success: true, messages });
});

router.post('/messages', authenticateToken, (req, res) => {
  const { receiver_id, message } = req.body;
  db.prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)').run(req.user.id, receiver_id, message);
  res.status(201).json({ success: true, message: 'تم إرسال الرسالة' });
});

/* إدارة الرسائل - ADMIN */
router.get('/admin/messages', requireAdmin, (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, s.full_name as sender_name, r.full_name as receiver_name
    FROM messages m
    JOIN users s ON s.id = m.sender_id
    JOIN users r ON r.id = m.receiver_id
    ORDER BY m.created_at DESC
    LIMIT 100
  `).all();
  res.json({ success: true, messages });
});

module.exports = router;