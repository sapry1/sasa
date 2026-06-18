/* ============================================================
   مسارات الدفع والعملات - paymentRoutes.js
   طرق الدفع، التحقق من الدفع، إدارة العملات
   ============================================================ */

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { requireAdmin, logActivity, upload } = require('../backend/middleware');

/* ============================================================
   طرق الدفع - عامة
   ============================================================ */
router.get('/payment-methods', (req, res) => {
  const methods = db.prepare("SELECT id, name, name_en, image, description, account_name, account_number, instructions, sort_order FROM payment_methods WHERE status = 'active' ORDER BY sort_order").all();
  res.json({ success: true, methods });
});

/* ============================================================
   طرق الدفع - ADMIN
   ============================================================ */
router.get('/admin/payment-methods', requireAdmin, (req, res) => {
  const methods = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order').all();
  res.json({ success: true, methods });
});

router.post('/admin/payment-methods', requireAdmin, upload.single('image'), (req, res) => {
  const { name, name_en, description, account_name, account_number, instructions, sort_order } = req.body;
  const image = req.file ? `/uploads/payments/${req.file.filename}` : req.body.image;

  db.prepare(`
    INSERT INTO payment_methods (name, name_en, image, description, account_name, account_number, instructions, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(name, name_en, image, description, account_name, account_number, instructions, sort_order || 0);

  logActivity(req.user.id, 'add_payment_method', `إضافة طريقة دفع: ${name}`, req.ip);
  res.status(201).json({ success: true, message: 'تم إضافة طريقة الدفع' });
});

router.put('/admin/payment-methods/:id', requireAdmin, upload.single('image'), (req, res) => {
  const { name, name_en, description, account_name, account_number, instructions, sort_order, status } = req.body;
  const image = req.file ? `/uploads/payments/${req.file.filename}` : req.body.image;

  db.prepare(`
    UPDATE payment_methods SET name=?, name_en=?, image=?, description=?, account_name=?, account_number=?, instructions=?, sort_order=?, status=? WHERE id=?
  `).run(name, name_en, image, description, account_name, account_number, instructions, sort_order, status, req.params.id);

  logActivity(req.user.id, 'edit_payment_method', `تعديل طريقة دفع: ${name}`, req.ip);
  res.json({ success: true, message: 'تم تحديث طريقة الدفع' });
});

router.delete('/admin/payment-methods/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM payment_methods WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, 'delete_payment_method', `حذف طريقة دفع ID: ${req.params.id}`, req.ip);
  res.json({ success: true, message: 'تم حذف طريقة الدفع' });
});

/* ============================================================
   العملات
   ============================================================ */
router.get('/currencies', (req, res) => {
  const currencies = db.prepare("SELECT * FROM currencies WHERE status = 'active'").all();
  res.json({ success: true, currencies });
});

router.get('/admin/currencies', requireAdmin, (req, res) => {
  const currencies = db.prepare('SELECT * FROM currencies').all();
  res.json({ success: true, currencies });
});

router.post('/admin/currencies', requireAdmin, (req, res) => {
  const { name, code, symbol, exchange_rate } = req.body;
  db.prepare('INSERT OR IGNORE INTO currencies (name, code, symbol, exchange_rate, status) VALUES (?, ?, ?, ?, \'active\')').run(name, code, symbol, exchange_rate);
  res.status(201).json({ success: true, message: 'تم إضافة العملة' });
});

router.put('/admin/currencies/:id', requireAdmin, (req, res) => {
  const { name, code, symbol, exchange_rate, status } = req.body;
  db.prepare('UPDATE currencies SET name=?, code=?, symbol=?, exchange_rate=?, status=? WHERE id=?').run(name, code, symbol, exchange_rate, status, req.params.id);
  res.json({ success: true, message: 'تم تحديث العملة' });
});

router.delete('/admin/currencies/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM currencies WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'تم حذف العملة' });
});

/* ============================================================
   اللغات
   ============================================================ */
router.get('/languages', (req, res) => {
  const languages = db.prepare("SELECT * FROM languages WHERE status = 'active'").all();
  res.json({ success: true, languages });
});

router.get('/admin/languages', requireAdmin, (req, res) => {
  const languages = db.prepare('SELECT * FROM languages').all();
  res.json({ success: true, languages });
});

router.put('/admin/languages/:id', requireAdmin, (req, res) => {
  const { name, code, flag, direction, status } = req.body;
  db.prepare('UPDATE languages SET name=?, code=?, flag=?, direction=?, status=? WHERE id=?').run(name, code, flag, direction, status, req.params.id);
  res.json({ success: true, message: 'تم تحديث اللغة' });
});

module.exports = router;