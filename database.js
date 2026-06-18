/* ============================================================
   قاعدة البيانات - SMART MENU CMS
   Database: SQLite (better-sqlite3)
   جميع الجداول والبيانات الأولية تُنشأ هنا تلقائياً
   ============================================================ */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

/* مسار قاعدة البيانات */
const DB_PATH = path.join(__dirname, '../smart_menu.db');

/* إنشاء الاتصال */
const db = new Database(DB_PATH);

/* تفعيل Foreign Keys وWAL للأداء */
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ============================================================
   إنشاء جميع الجداول
   ============================================================ */
const initDB = () => {

  /* جدول الأدوار */
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  /* جدول المستخدمين */
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password TEXT NOT NULL,
      profile_image TEXT DEFAULT NULL,
      points INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      role TEXT DEFAULT 'customer',
      language TEXT DEFAULT 'ar',
      currency TEXT DEFAULT 'EGP',
      loyalty_level TEXT DEFAULT 'bronze',
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول الأقسام */
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      name_tr TEXT,
      slug TEXT UNIQUE NOT NULL,
      image TEXT DEFAULT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول المنتجات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      name_en TEXT,
      name_tr TEXT,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      full_description TEXT,
      price REAL NOT NULL,
      old_price REAL DEFAULT NULL,
      discount REAL DEFAULT 0,
      main_image TEXT DEFAULT NULL,
      status TEXT DEFAULT 'available',
      rating REAL DEFAULT 0,
      views INTEGER DEFAULT 0,
      orders_count INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 100,
      minimum_stock INTEGER DEFAULT 5,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  /* جدول صور المنتجات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  /* جدول الطلبات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      payment_method_id INTEGER,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      points_used INTEGER DEFAULT 0,
      coupon_code TEXT DEFAULT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      payment_proof TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
    )
  `);

  /* جدول تفاصيل الطلب */
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      product_image TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  /* جدول التعليقات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      review TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  /* جدول صور التعليقات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      image TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    )
  `);

  /* جدول الإشعارات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT DEFAULT NULL,
      url TEXT DEFAULT NULL,
      type TEXT DEFAULT 'text',
      target TEXT DEFAULT 'all',
      target_user_id INTEGER DEFAULT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول إشعارات المستخدمين */
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  /* جدول طرق الدفع */
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      image TEXT DEFAULT NULL,
      description TEXT,
      account_name TEXT,
      account_number TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول الكوبونات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'percentage',
      value REAL NOT NULL,
      minimum_order REAL DEFAULT 0,
      usage_limit INTEGER DEFAULT 0,
      used_count INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول سجل النقاط */
  db.exec(`
    CREATE TABLE IF NOT EXISTS points_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type TEXT DEFAULT 'earn',
      description TEXT,
      order_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  /* جدول العملات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      symbol TEXT NOT NULL,
      exchange_rate REAL DEFAULT 1,
      status TEXT DEFAULT 'active'
    )
  `);

  /* جدول اللغات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      flag TEXT,
      direction TEXT DEFAULT 'rtl',
      status TEXT DEFAULT 'active'
    )
  `);

  /* جدول الأسئلة الشائعة */
  db.exec(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      question_en TEXT,
      answer TEXT NOT NULL,
      answer_en TEXT,
      category TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    )
  `);

  /* جدول الصفحات الثابتة */
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      content_en TEXT,
      seo_title TEXT,
      seo_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول الإعدادات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    )
  `);

  /* جدول سجل النشاط */
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      action TEXT NOT NULL,
      description TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول السلايدر/البنرات */
  db.exec(`
    CREATE TABLE IF NOT EXISTS sliders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image TEXT NOT NULL,
      button_text TEXT,
      button_url TEXT,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /* جدول الرسائل الخاصة */
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  /* جدول تذاكر الدعم */
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  /* جدول ردود التذاكر */
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    )
  `);

  /* جدول المفضلة */
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  /* جدول الزوار */
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT,
      visit_date DATE DEFAULT (date('now')),
      UNIQUE(ip_address, visit_date)
    )
  `);

  console.log('✅ تم إنشاء جميع جداول قاعدة البيانات بنجاح');
};

/* ============================================================
   إدراج البيانات الأولية
   ============================================================ */
const seedDB = () => {

  /* إنشاء حساب المدير الرئيسي */
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('SmartMenu@2026', 12);
    db.prepare(`
      INSERT INTO users (full_name, email, phone, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('مدير النظام', 'admin@smartmenu.com', '01000000000', hashedPassword, 'admin', 'active');
    console.log('✅ تم إنشاء حساب المدير - ID: admin | Password: SmartMenu@2026');
  }

  /* إدراج الإعدادات الأساسية */
  const defaultSettings = [
    ['store_name', 'SMART MENU'],
    ['store_name_en', 'SMART MENU'],
    ['store_logo', '/uploads/logo/logo.svg'],
    ['store_description', 'أفضل مطعم لتجربة طعام استثنائية'],
    ['store_description_en', 'The best restaurant for an exceptional dining experience'],
    ['email', 'info@smartmenu.com'],
    ['phone', '+201234567890'],
    ['whatsapp', '+201234567890'],
    ['address', 'القاهرة، مصر'],
    ['facebook', 'https://facebook.com/smartmenu'],
    ['instagram', 'https://instagram.com/smartmenu'],
    ['telegram', 'https://t.me/smartmenu'],
    ['tiktok', 'https://tiktok.com/@smartmenu'],
    ['default_language', 'ar'],
    ['default_currency', 'EGP'],
    ['maintenance_mode', '0'],
    ['store_open', '1'],
    ['min_order', '50'],
    ['points_per_100', '10'],
    ['points_value', '1'],
    ['admin_url', 'X7mK29LpQ8T'],
    ['working_hours', 'السبت - الخميس: 10:00 ص - 12:00 م'],
    ['delivery_available', '1'],
    ['currency_symbol', 'ج.م'],
    ['tax_rate', '0'],
    ['developer_name', 'Smart Dev'],
    ['developer_whatsapp', '+201234567890'],
    ['theme', 'dark'],
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);
  defaultSettings.forEach(([k, v]) => insertSetting.run(k, v));

  /* إدراج العملات */
  const currencies = [
    ['جنيه مصري', 'EGP', 'ج.م', 1],
    ['دولار أمريكي', 'USD', '$', 0.032],
    ['ريال سعودي', 'SAR', 'ر.س', 0.12],
    ['درهم إماراتي', 'AED', 'د.إ', 0.12],
    ['ليرة تركية', 'TRY', '₺', 1.02],
    ['دينار أردني', 'JOD', 'د.أ', 0.023],
    ['دينار جزائري', 'DZD', 'د.ج', 4.35],
    ['درهم مغربي', 'MAD', 'د.م', 0.32],
  ];
  const insertCurrency = db.prepare(`
    INSERT OR IGNORE INTO currencies (name, code, symbol, exchange_rate) VALUES (?, ?, ?, ?)
  `);
  currencies.forEach(c => insertCurrency.run(...c));

  /* إدراج اللغات */
  const languages = [
    ['العربية', 'ar', '🇸🇦', 'rtl'],
    ['English', 'en', '🇬🇧', 'ltr'],
    ['Türkçe', 'tr', '🇹🇷', 'ltr'],
  ];
  const insertLang = db.prepare(`
    INSERT OR IGNORE INTO languages (name, code, flag, direction) VALUES (?, ?, ?, ?)
  `);
  languages.forEach(l => insertLang.run(...l));

  /* إدراج الأقسام */
  const categoriesExist = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoriesExist.count === 0) {
    const cats = [
      ['مشويات', 'grills', 'en_Grills', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'],
      ['برجر', 'burger', 'en_Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'],
      ['بيتزا', 'pizza', 'en_Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
      ['شاورما', 'shawarma', 'en_Shawarma', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400'],
      ['مشروبات', 'drinks', 'en_Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'],
      ['حلويات', 'desserts', 'en_Desserts', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'],
      ['مقبلات', 'appetizers', 'en_Appetizers', 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400'],
      ['عصائر', 'juices', 'en_Juices', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'],
    ];
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, name_en, image, sort_order, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `);
    cats.forEach(([name, slug, name_en, image], i) => insertCat.run(name, slug, name_en, image, i + 1));
    console.log('✅ تم إدراج الأقسام');
  }

  /* إدراج المنتجات */
  const productsExist = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productsExist.count === 0) {
    const catId = (slug) => db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)?.id;
    const products = [
      // مشويات
      [catId('grills'), 'مشاوي مشكلة فاخرة', 'mixed-grill', 'طبق مشاوي مشكلة من أجود أنواع اللحوم المشوية على الفحم', 'تشكيلة رائعة من لحم الضأن والدجاج والكوفتة المشوية على الفحم الطبيعي مع الخضروات الطازجة والصلصات المميزة', 185, 220, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', 'available', 4.8],
      [catId('grills'), 'دجاج مشوي بالليمون', 'grilled-chicken', 'دجاج طازج مشوي بتتبيلة الليمون والأعشاب', 'نصف دجاجة طازجة مشوية على الفحم بتتبيلة الليمون والثوم والأعشاب الطبيعية تقدم مع الخبز والسلطة', 95, 120, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c4?w=600', 'available', 4.7],
      [catId('grills'), 'كوفتة لحم طازجة', 'beef-kofta', 'كوفتة لحم بقري طازجة مشوية على الفحم', 'كوفتة من اللحم البقري الطازج المفروم مع البهارات والبصل تشوى على الفحم وتقدم مع صلصة الطحينة', 75, 90, 'https://images.unsplash.com/photo-1544025162-d76594e08e0d?w=600', 'available', 4.6],
      // برجر
      [catId('burger'), 'سموكي برجر', 'smoky-burger', 'برجر لحم بقري مع صلصة سموكي مميزة', 'برجر 200 جرام لحم بقري طازج مع جبنة شيدر مذابة وصلصة سموكي الخاصة وخضروات طازجة في خبز بريوش', 89, 110, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 'available', 4.9],
      [catId('burger'), 'كريسبي تشيكن برجر', 'crispy-chicken-burger', 'برجر دجاج مقرمش بالصلصة الحارة', 'صدر دجاج مقرمش بالصلصة الحارة مع خس طازج ومايونيز الثوم في خبز سيزام', 75, 95, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600', 'available', 4.7],
      [catId('burger'), 'دابل بيف برجر', 'double-beef-burger', 'برجر مزدوج من أجود اللحوم البقرية', 'طبقتان من اللحم البقري الطازج 150 جرام لكل منهما مع جبنتين وصلصات متنوعة في خبز بريوش المحمص', 115, 140, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600', 'available', 4.8],
      // بيتزا
      [catId('pizza'), 'بيتزا مارجريتا', 'pizza-margherita', 'بيتزا إيطالية أصيلة بالطماطم والموزاريلا', 'بيتزا إيطالية أصيلة بصلصة الطماطم الطازجة وجبنة الموزاريلا الطازجة والريحان', 85, 100, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', 'available', 4.6],
      [catId('pizza'), 'بيتزا الدجاج', 'chicken-pizza', 'بيتزا دجاج مشوي مع فلفل ملون', 'بيتزا بقطع الدجاج المشوي والفلفل الملون والبصل وجبنة موزاريلا مع صلصة البيستو', 95, 115, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', 'available', 4.7],
      // مشروبات
      [catId('drinks'), 'قهوة عربية', 'arabic-coffee', 'قهوة عربية أصيلة بالهيل والزعفران', 'قهوة عربية فاخرة محضرة بأجود حبوب البن مع الهيل والزعفران تقدم في دلة تراثية', 25, 35, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 'available', 4.9],
      [catId('drinks'), 'موهيتو نعناع', 'mint-mojito', 'موهيتو منعش بالنعناع الطازج والليمون', 'موهيتو بارد بالنعناع الطازج والليمون والسكر الطبيعي مع الثلج المجروش', 35, 45, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600', 'available', 4.8],
      // حلويات
      [catId('desserts'), 'تشيز كيك نيويورك', 'ny-cheesecake', 'تشيز كيك نيويورك الكلاسيكي بصلصة التوت', 'تشيز كيك نيويورك كريمي فاخر بقاعدة البسكويت المقرمش وصلصة التوت الطازجة', 65, 80, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600', 'available', 4.9],
      [catId('desserts'), 'كنافة نابلسية', 'kunafa', 'كنافة نابلسية أصيلة بالعجينة الخشنة والجبن', 'كنافة نابلسية أصيلة بالعجينة الخشنة وجبن الموزاريلا مع القطر والفستق', 55, 70, 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600', 'available', 4.8],
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (category_id, name, slug, short_description, full_description, price, old_price, main_image, status, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    products.forEach(p => insertProd.run(...p));
    console.log('✅ تم إدراج المنتجات');
  }

  /* إدراج طرق الدفع */
  const pmExist = db.prepare('SELECT COUNT(*) as count FROM payment_methods').get();
  if (pmExist.count === 0) {
    const pms = [
      ['Vodafone Cash', 'Vodafone Cash', 'ادفع عبر فودافون كاش', 'خالد محمد', '010xxxxxxxx', 'افتح تطبيق فودافون كاش وادفع على الرقم أعلاه ثم ارفع إثبات الدفع', 1],
      ['Etisalat Cash', 'Etisalat Cash', 'ادفع عبر اتصالات كاش', 'خالد محمد', '011xxxxxxxx', 'افتح تطبيق اتصالات كاش وادفع ثم ارفع إثبات الدفع', 2],
      ['InstaPay', 'InstaPay', 'ادفع عبر إنستاباي', 'خالد محمد', 'smartmenu@instapay', 'افتح تطبيق الإنستاباي وادفع ثم ارفع إثبات الدفع', 3],
      ['Bank Transfer', 'Bank Transfer', 'تحويل بنكي مباشر', 'شركة سمارت مينو', 'IBAN: EG00 0000 0000 0000 0000', 'قم بالتحويل البنكي وارفع إيصال التحويل', 4],
    ];
    const insertPM = db.prepare(`
      INSERT INTO payment_methods (name, name_en, description, account_name, account_number, instructions, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    pms.forEach(pm => insertPM.run(...pm));
    console.log('✅ تم إدراج طرق الدفع');
  }

  /* إدراج البنرات */
  const slidersExist = db.prepare('SELECT COUNT(*) as count FROM sliders').get();
  if (slidersExist.count === 0) {
    const sliders = [
      ['عروض مميزة', 'احصل على خصم 20% على جميع المشويات', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200', 'اطلب الآن'],
      ['برجر الشهر', 'جرب برجرنا الجديد بنكهة سموكي رائعة', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200', 'اكتشف المزيد'],
      ['حلويات شرقية', 'أشهى الحلويات الشرقية المحضرة يومياً', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200', 'شاهد الحلويات'],
    ];
    const insertSlider = db.prepare(`
      INSERT INTO sliders (title, description, image, button_text, sort_order, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `);
    sliders.forEach(([t, d, img, btn], i) => insertSlider.run(t, d, img, btn, i + 1));
  }

  /* إدراج الأسئلة الشائعة */
  const faqExist = db.prepare('SELECT COUNT(*) as count FROM faq').get();
  if (faqExist.count === 0) {
    const faqs = [
      ['كيف يمكنني تقديم طلب؟', 'اختر المنتجات التي تريدها وأضفها للسلة ثم اضغط على تأكيد الطلب واختر طريقة الدفع المناسبة.', 'orders', 1],
      ['ما هي طرق الدفع المتاحة؟', 'نقبل Vodafone Cash وInstaPay والتحويل البنكي والدفع عند الاستلام.', 'payment', 2],
      ['كيف أتابع طلبي؟', 'يمكنك متابعة طلبك من صفحة "طلباتي" بعد تسجيل الدخول.', 'orders', 3],
      ['كيف أستخدم نقاط المكافآت؟', 'تجمع النقاط مع كل طلب مكتمل ويمكن استبدالها بخصومات في طلباتك القادمة.', 'orders', 4],
      ['كيف أتواصل مع الدعم الفني؟', 'يمكنك التواصل معنا عبر WhatsApp أو من خلال نموذج الدعم في الموقع.', 'support', 5],
    ];
    const insertFaq = db.prepare(`
      INSERT INTO faq (question, answer, category, sort_order) VALUES (?, ?, ?, ?)
    `);
    faqs.forEach(([q, a, cat, sort]) => insertFaq.run(q, a, cat, sort));
  }

  /* إدراج بعض التعليقات */
  const reviewsExist = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  if (reviewsExist.count === 0) {
    const reviews = [
      [null, 1, 'أحمد محمد', 5, 'أفضل مطعم جربته في حياتي، الطعام رائع والخدمة ممتازة!', 'approved'],
      [null, 2, 'سارة علي', 5, 'البرجر لا يوصف، ألذ برجر جربته. أنصح الجميع بتجربته', 'approved'],
      [null, 4, 'محمد عبدالله', 4, 'قهوة رائعة جداً، الجو مريح والخدمة سريعة', 'approved'],
      [null, 3, 'فاطمة حسن', 5, 'الكنافة من عندهم لا مثيل لها، حلاوة حقيقية وطعم أصيل', 'approved'],
    ];
    const insertReview = db.prepare(`
      INSERT INTO reviews (user_id, product_id, customer_name, rating, review, status) VALUES (?, ?, ?, ?, ?, ?)
    `);
    reviews.forEach(r => insertReview.run(...r));
  }

  /* إدراج كوبون تجريبي */
  db.prepare(`
    INSERT OR IGNORE INTO coupons (code, type, value, minimum_order, usage_limit, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('WELCOME20', 'percentage', 20, 100, 100, 'active');

  console.log('✅ تم إدراج جميع البيانات الأولية بنجاح');
};

/* تشغيل الإعداد */
initDB();
seedDB();

module.exports = db;