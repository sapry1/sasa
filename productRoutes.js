/* ============================================================
   مسارات المنتجات والأقسام والسلايدر - productRoutes.js
   CRUD كامل للمنتجات والأقسام، البحث، الفلاتر
   ============================================================ */

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { authenticateToken, requireAdmin, upload, logActivity } = require('../backend/middleware');

/* ============================================================
   الأقسام
   ============================================================ */
/* جلب جميع الأقسام */
router.get('/categories', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as products_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 'available'
    WHERE c.status = 'active'
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `).all();
  res.json({ success: true, categories });
});

/* جلب قسم واحد */
router.get('/categories/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'القسم غير موجود' });
  res.json({ success: true, category: cat });
});

/* إضافة قسم - ADMIN */
router.post('/categories', requireAdmin, upload.single('image'), (req, res) => {
  const { name, name_en, name_tr, description, sort_order } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
  const image = req.file ? `/uploads/categories/${req.file.filename}` : req.body.image;

  const result = db.prepare(`
    INSERT INTO categories (name, name_en, name_tr, slug, image, description, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(name, name_en, name_tr, slug, image, description, sort_order || 0);

  logActivity(req.user.id, 'add_category', `إضافة قسم: ${name}`, req.ip);
  res.status(201).json({ success: true, id: result.lastInsertRowid, message: 'تم إضافة القسم بنجاح' });
});

/* تعديل قسم - ADMIN */
router.put('/categories/:id', requireAdmin, upload.single('image'), (req, res) => {
  const { name, name_en, name_tr, description, sort_order, status } = req.body;
  const image = req.file ? `/uploads/categories/${req.file.filename}` : req.body.image;

  db.prepare(`
    UPDATE categories SET name=?, name_en=?, name_tr=?, image=?, description=?, sort_order=?, status=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name, name_en, name_tr, image, description, sort_order, status, req.params.id);

  logActivity(req.user.id, 'edit_category', `تعديل قسم: ${name}`, req.ip);
  res.json({ success: true, message: 'تم تحديث القسم بنجاح' });
});

/* حذف قسم - ADMIN */
router.delete('/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, 'delete_category', `حذف قسم ID: ${req.params.id}`, req.ip);
  res.json({ success: true, message: 'تم حذف القسم بنجاح' });
});

/* ============================================================
   المنتجات
   ============================================================ */
/* جلب جميع المنتجات مع الفلاتر */
router.get('/products', (req, res) => {
  const { category, status, sort, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let where = ["p.status != 'hidden'"];
  let params = [];

  if (category) { where.push('p.category_id = ?'); params.push(category); }
  if (status && status !== 'all') { where.push('p.status = ?'); params.push(status); }
  if (search) {
    where.push('(p.name LIKE ? OR p.short_description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  let orderBy = 'p.sort_order ASC, p.id DESC';
  if (sort === 'popular') orderBy = 'p.orders_count DESC';
  if (sort === 'price_asc') orderBy = 'p.price ASC';
  if (sort === 'price_desc') orderBy = 'p.price DESC';
  if (sort === 'newest') orderBy = 'p.created_at DESC';
  if (sort === 'rating') orderBy = 'p.rating DESC';

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM products p ${whereStr}`).get(...params);
  const products = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereStr}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ success: true, products, total: total.count, page: parseInt(page), pages: Math.ceil(total.count / limit) });
});

/* جلب منتج واحد */
router.get('/products/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });

  /* تحديث عدد المشاهدات */
  db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(req.params.id);

  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order').all(req.params.id);
  const reviews = db.prepare(`
    SELECT r.*, u.profile_image as user_image
    FROM reviews r LEFT JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.status = 'approved'
    ORDER BY r.created_at DESC LIMIT 10
  `).all(req.params.id);

  const related = db.prepare(`
    SELECT * FROM products WHERE category_id = ? AND id != ? AND status = 'available' LIMIT 4
  `).all(product.category_id, product.id);

  res.json({ success: true, product, images, reviews, related });
});

/* إضافة منتج - ADMIN */
router.post('/products', requireAdmin, upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), (req, res) => {
  const { name, name_en, name_tr, category_id, short_description, full_description, price, old_price, sort_order, status } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A-]/g, '') + '-' + Date.now();
  const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;
  const main_image = req.files?.main_image?.[0] ? `/uploads/products/${req.files.main_image[0].filename}` : req.body.main_image;

  const result = db.prepare(`
    INSERT INTO products (category_id, name, name_en, name_tr, slug, short_description, full_description, price, old_price, discount, main_image, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(category_id, name, name_en, name_tr, slug, short_description, full_description, price, old_price, discount, main_image, status || 'available', sort_order || 0);

  /* حفظ الصور الإضافية */
  if (req.files?.images) {
    const insertImg = db.prepare('INSERT INTO product_images (product_id, image, sort_order) VALUES (?, ?, ?)');
    req.files.images.forEach((f, i) => insertImg.run(result.lastInsertRowid, `/uploads/products/${f.filename}`, i));
  }

  logActivity(req.user.id, 'add_product', `إضافة منتج: ${name}`, req.ip);
  res.status(201).json({ success: true, id: result.lastInsertRowid, message: 'تم إضافة المنتج بنجاح' });
});

/* تعديل منتج - ADMIN */
router.put('/products/:id', requireAdmin, upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), (req, res) => {
  const { name, name_en, name_tr, category_id, short_description, full_description, price, old_price, sort_order, status, quantity } = req.body;
  const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;
  const main_image = req.files?.main_image?.[0] ? `/uploads/products/${req.files.main_image[0].filename}` : req.body.main_image;

  db.prepare(`
    UPDATE products SET category_id=?, name=?, name_en=?, name_tr=?, short_description=?, full_description=?,
    price=?, old_price=?, discount=?, main_image=?, status=?, sort_order=?, quantity=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(category_id, name, name_en, name_tr, short_description, full_description, price, old_price, discount, main_image, status, sort_order, quantity, req.params.id);

  logActivity(req.user.id, 'edit_product', `تعديل منتج: ${name}`, req.ip);
  res.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
});

/* حذف منتج - ADMIN */
router.delete('/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, 'delete_product', `حذف منتج ID: ${req.params.id}`, req.ip);
  res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

/* ============================================================
   السلايدر / البنرات
   ============================================================ */
router.get('/sliders', (req, res) => {
  const sliders = db.prepare("SELECT * FROM sliders WHERE status = 'active' ORDER BY sort_order").all();
  res.json({ success: true, sliders });
});

router.post('/sliders', requireAdmin, upload.single('image'), (req, res) => {
  const { title, description, button_text, button_url, sort_order } = req.body;
  const image = req.file ? `/uploads/banners/${req.file.filename}` : req.body.image;
  db.prepare(`INSERT INTO sliders (title, description, image, button_text, button_url, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`).run(title, description, image, button_text, button_url, sort_order || 0);
  res.status(201).json({ success: true, message: 'تم إضافة البنر بنجاح' });
});

router.put('/sliders/:id', requireAdmin, upload.single('image'), (req, res) => {
  const { title, description, button_text, button_url, sort_order, status } = req.body;
  const image = req.file ? `/uploads/banners/${req.file.filename}` : req.body.image;
  db.prepare(`UPDATE sliders SET title=?, description=?, image=?, button_text=?, button_url=?, sort_order=?, status=? WHERE id=?`).run(title, description, image, button_text, button_url, sort_order, status, req.params.id);
  res.json({ success: true, message: 'تم تحديث البنر' });
});

router.delete('/sliders/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM sliders WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'تم حذف البنر' });
});

/* ============================================================
   المفضلة
   ============================================================ */
router.get('/favorites', authenticateToken, (req, res) => {
  const favorites = db.prepare(`
    SELECT p.* FROM favorites f
    JOIN products p ON p.id = f.product_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json({ success: true, favorites });
});

router.post('/favorites/:productId', authenticateToken, (req, res) => {
  const exists = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(req.user.id, req.params.productId);
  if (exists) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    return res.json({ success: true, favorited: false, message: 'تم الحذف من المفضلة' });
  }
  db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(req.user.id, req.params.productId);
  res.json({ success: true, favorited: true, message: 'تم الإضافة للمفضلة' });
});

/* ============================================================
   إحصائيات المنتجات للأدمن
   ============================================================ */
router.get('/admin/products/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM products').get();
  const available = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'available'").get();
  const outOfStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'out_of_stock'").get();
  const topProducts = db.prepare('SELECT name, orders_count, views, price FROM products ORDER BY orders_count DESC LIMIT 5').all();
  res.json({ success: true, stats: { total: total.count, available: available.count, out_of_stock: outOfStock.count, top_products: topProducts } });
});

module.exports = router;