/* ============================================================
   SMART MENU CMS — app.js
   جميع أكواد JavaScript للواجهة الأمامية في ملف واحد
   ============================================================ */

'use strict';

/* ============================================================
   الإعدادات العامة
   ============================================================ */
const API_BASE = '/api';
const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const ADMIN_PATH = '/X7mK29LpQ8T';

/* حالة التطبيق العامة */
const App = {
  user: null,
  token: null,
  cart: [],
  favorites: [],
  settings: {},
  currentLang: localStorage.getItem('lang') || 'ar',
  currentCurrency: localStorage.getItem('currency') || 'EGP',
  currencies: [],
  onlineCount: 0,
  ws: null,

  /* ترجمات */
  translations: {
    ar: {
      home: 'الرئيسية', offers: 'العروض', categories: 'الأقسام', orders: 'طلباتي',
      notifications: 'الإشعارات', faq: 'الأسئلة الشائعة', about: 'من نحن',
      privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', support: 'الدعم الفني',
      login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج',
      cart: 'السلة', favorites: 'المفضلة', profile: 'حسابي', points: 'النقاط',
      add_to_cart: 'أضف للسلة', order_now: 'اطلب الآن', checkout: 'إتمام الطلب',
      products: 'المنتجات', popular: 'الأكثر طلباً', latest: 'الأحدث',
      search: 'البحث', search_placeholder: 'ابحث عن منتج...',
      out_of_stock: 'نفد المخزون', unavailable: 'غير متوفر', available: 'متوفر',
      total: 'الإجمالي', subtotal: 'المجموع', discount: 'الخصم', pay: 'الدفع',
      select_payment: 'اختر طريقة الدفع', upload_proof: 'ارفع إثبات الدفع',
      order_confirmed: 'تم تأكيد الطلبيك!', tracking: 'تتبع الطلب',
      reviews: 'التقييمات', write_review: 'اكتب تقييماً', rating: 'التقييم',
      send: 'إرسال', cancel: 'إلغاء', save: 'حفظ', close: 'إغلاق',
      back: 'رجوع', see_all: 'عرض الكل', empty_cart: 'السلة فارغة',
      login_required: 'يجب تسجيل الدخول أولاً', loading: 'جاري التحميل...',
      coupon: 'كوبون الخصم', apply: 'تطبيق', enter_coupon: 'أدخل كود الكوبون',
      min_order: 'الحد الأدنى للطلب', connected_now: 'زائر متصل الآن',
      all_products: 'جميع المنتجات', featured_offers: 'العروض المميزة',
      delete: 'حذف', edit: 'تعديل', add: 'إضافة', status: 'الحالة',
      name: 'الاسم', price: 'السعر', quantity: 'الكمية', image: 'الصورة',
      description: 'الوصف', category: 'القسم', payment_method: 'طريقة الدفع',
      date: 'التاريخ', actions: 'الإجراءات', messages: 'الرسائل',
      loyalty: 'نظام الولاء', my_points: 'نقاطي', use_points: 'استخدام النقاط',
      phone: 'رقم الهاتف', email: 'البريد الإلكتروني', password: 'كلمة المرور',
      confirm_password: 'تأكيد كلمة المرور', full_name: 'الاسم الكامل',
      remember_me: 'تذكرني', forgot_password: 'نسيت كلمة المرور?',
      or_login_with: 'أو سجل بـ', create_account: 'إنشاء حساب جديد',
      have_account: 'لديك حساب؟', no_account: 'ليس لديك حساب؟',
    },
    en: {
      home: 'Home', offers: 'Offers', categories: 'Categories', orders: 'My Orders',
      notifications: 'Notifications', faq: 'FAQ', about: 'About Us',
      privacy: 'Privacy Policy', terms: 'Terms & Conditions', support: 'Support',
      login: 'Login', register: 'Register', logout: 'Logout',
      cart: 'Cart', favorites: 'Favorites', profile: 'My Account', points: 'Points',
      add_to_cart: 'Add to Cart', order_now: 'Order Now', checkout: 'Checkout',
      products: 'Products', popular: 'Most Popular', latest: 'Latest',
      search: 'Search', search_placeholder: 'Search for a product...',
      out_of_stock: 'Out of Stock', unavailable: 'Unavailable', available: 'Available',
      total: 'Total', subtotal: 'Subtotal', discount: 'Discount', pay: 'Pay',
      select_payment: 'Select Payment Method', upload_proof: 'Upload Payment Proof',
      order_confirmed: 'Order Confirmed!', tracking: 'Track Order',
      reviews: 'Reviews', write_review: 'Write a Review', rating: 'Rating',
      send: 'Send', cancel: 'Cancel', save: 'Save', close: 'Close',
      back: 'Back', see_all: 'See All', empty_cart: 'Cart is Empty',
      login_required: 'Please login first', loading: 'Loading...',
      coupon: 'Discount Coupon', apply: 'Apply', enter_coupon: 'Enter coupon code',
      min_order: 'Minimum Order', connected_now: 'visitors online now',
      all_products: 'All Products', featured_offers: 'Featured Offers',
      delete: 'Delete', edit: 'Edit', add: 'Add', status: 'Status',
      name: 'Name', price: 'Price', quantity: 'Quantity', image: 'Image',
      description: 'Description', category: 'Category', payment_method: 'Payment Method',
      date: 'Date', actions: 'Actions', messages: 'Messages',
      loyalty: 'Loyalty System', my_points: 'My Points', use_points: 'Use Points',
      phone: 'Phone', email: 'Email', password: 'Password',
      confirm_password: 'Confirm Password', full_name: 'Full Name',
      remember_me: 'Remember Me', forgot_password: 'Forgot Password?',
      or_login_with: 'Or login with', create_account: 'Create Account',
      have_account: 'Have an account?', no_account: "Don't have an account?",
    },
    tr: {
      home: 'Anasayfa', offers: 'Teklifler', categories: 'Kategoriler', orders: 'Siparişlerim',
      notifications: 'Bildirimler', faq: 'SSS', about: 'Hakkımızda',
      privacy: 'Gizlilik Politikası', terms: 'Şartlar ve Koşullar', support: 'Destek',
      login: 'Giriş', register: 'Kayıt Ol', logout: 'Çıkış',
      cart: 'Sepet', favorites: 'Favoriler', profile: 'Hesabım', points: 'Puan',
      add_to_cart: 'Sepete Ekle', order_now: 'Şimdi Sipariş Ver', checkout: 'Ödeme',
      products: 'Ürünler', popular: 'En Popüler', latest: 'En Yeni',
      search: 'Ara', search_placeholder: 'Ürün ara...',
      out_of_stock: 'Stokta Yok', unavailable: 'Mevcut Değil', available: 'Mevcut',
      total: 'Toplam', subtotal: 'Ara Toplam', discount: 'İndirim', pay: 'Öde',
      select_payment: 'Ödeme Yöntemi Seç', upload_proof: 'Ödeme Kanıtı Yükle',
      order_confirmed: 'Sipariş Onaylandı!', tracking: 'Siparişi Takip Et',
      reviews: 'Yorumlar', write_review: 'Yorum Yaz', rating: 'Değerlendirme',
      send: 'Gönder', cancel: 'İptal', save: 'Kaydet', close: 'Kapat',
      back: 'Geri', see_all: 'Tümünü Gör', empty_cart: 'Sepet Boş',
      login_required: 'Lütfen önce giriş yapın', loading: 'Yükleniyor...',
      coupon: 'İndirim Kuponu', apply: 'Uygula', enter_coupon: 'Kupon kodu girin',
      min_order: 'Minimum Sipariş', connected_now: 'ziyaretçi şu an bağlı',
      all_products: 'Tüm Ürünler', featured_offers: 'Öne Çıkan Teklifler',
      delete: 'Sil', edit: 'Düzenle', add: 'Ekle', status: 'Durum',
      name: 'Ad', price: 'Fiyat', quantity: 'Miktar', image: 'Resim',
      description: 'Açıklama', category: 'Kategori', payment_method: 'Ödeme Yöntemi',
      date: 'Tarih', actions: 'İşlemler', messages: 'Mesajlar',
      loyalty: 'Sadakat Sistemi', my_points: 'Puanlarım', use_points: 'Puan Kullan',
      phone: 'Telefon', email: 'E-posta', password: 'Şifre',
      confirm_password: 'Şifreyi Onayla', full_name: 'Tam Ad',
      remember_me: 'Beni Hatırla', forgot_password: 'Şifremi Unuttum?',
      or_login_with: 'Veya şununla giriş yap', create_account: 'Hesap Oluştur',
      have_account: 'Hesabınız var mı?', no_account: 'Hesabınız yok mu?',
    }
  },

  t(key) {
    return this.translations[this.currentLang]?.[key] || this.translations.ar[key] || key;
  }
};

/* ============================================================
   تهيئة التطبيق
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  loadTheme();
  loadAuthFromStorage();
  applyLanguage(App.currentLang);
  applyCurrencyFromStorage();
  await loadSettings();
  await loadCurrencies();
  setupWebSocket();
  setupLogoTap();
  setupSearchBar();
  setupCartUI();
  setupNotifDropdown();
  setupScrollTop();
  setupBottomNav();
  updateAuthUI();
  updateCartBadge();
  loadFavoritesFromStorage();
  updateFavBadge();
  initPageRouter();
  recordVisit();
}

/* ============================================================
   الإعدادات من السيرفر
   ============================================================ */
async function loadSettings() {
  try {
    const data = await apiGet('/settings');
    if (data.success) {
      App.settings = data.settings;
      applySettings();
    }
  } catch (e) {}
}

function applySettings() {
  const s = App.settings;
  document.title = s.store_name || 'SMART MENU';
  const logoEls = document.querySelectorAll('.store-logo-img');
  logoEls.forEach(el => { if (s.store_logo) el.src = s.store_logo; });
  const nameEls = document.querySelectorAll('.store-name-text');
  nameEls.forEach(el => { el.textContent = s.store_name || 'SMART MENU'; });
  const descEls = document.querySelectorAll('.store-desc-text');
  descEls.forEach(el => { el.textContent = s.store_description || ''; });

  /* بيانات التواصل في السايدبار */
  const phone = document.getElementById('sidebar-phone');
  const whatsapp = document.getElementById('sidebar-whatsapp');
  const fb = document.getElementById('sidebar-facebook');
  const ig = document.getElementById('sidebar-instagram');
  if (phone) phone.href = `tel:${s.phone}`;
  if (whatsapp) whatsapp.href = `https://wa.me/${s.whatsapp?.replace(/\D/g, '')}`;
  if (fb && s.facebook) fb.href = s.facebook;
  if (ig && s.instagram) ig.href = s.instagram;

  /* أسعار العملة */
  App.baseSymbol = s.currency_symbol || 'ج.م';
}

/* ============================================================
   WebSocket — مزامنة فورية
   ============================================================ */
function setupWebSocket() {
  try {
    App.ws = new WebSocket(WS_URL);
    App.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'online_count') {
        App.onlineCount = data.count;
        document.querySelectorAll('.online-count').forEach(el => {
          el.textContent = data.count;
        });
      } else if (data.type === 'product_update' || data.type === 'category_update') {
        renderCurrentPage();
      } else if (data.type === 'order_update' && data.user_id === App.user?.id) {
        showToast(`تحديث طلبك: ${data.message}`, 'info');
      }
    };
    App.ws.onclose = () => setTimeout(setupWebSocket, 3000);
    App.ws.onerror = () => {};
  } catch (e) {}
}

/* ============================================================
   اختصار فتح لوحة التحكم — 7 ضغطات على الشعار
   ============================================================ */
function setupLogoTap() {
  let tapCount = 0;
  let tapTimer = null;

  document.querySelectorAll('.header-logo, .store-logo-img').forEach(el => {
    el.addEventListener('click', () => {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 5000);

      if (tapCount >= 7) {
        tapCount = 0;
        clearTimeout(tapTimer);
        openAdminPanel();
      }
    });
  });
}

/* ============================================================
   نظام التوجيه (SPA Router)
   ============================================================ */
const routes = {
  '/': renderHome,
  '/offers': renderOffers,
  '/categories': renderCategoriesPage,
  '/products': renderProductsPage,
  '/product': renderProductDetail,
  '/cart': renderCartPage,
  '/checkout': renderCheckout,
  '/payment': renderPaymentPage,
  '/orders': renderOrdersPage,
  '/order': renderOrderDetail,
  '/favorites': renderFavoritesPage,
  '/profile': renderProfilePage,
  '/notifications': renderNotificationsPage,
  '/loyalty': renderLoyaltyPage,
  '/faq': renderFAQPage,
  '/about': renderStaticPage,
  '/privacy': renderStaticPage,
  '/terms': renderStaticPage,
  '/search': renderSearchPage,
};

function initPageRouter() {
  window.addEventListener('popstate', () => renderCurrentPage());
  renderCurrentPage();
}

function navigate(path, params = {}) {
  const url = new URL(location.origin + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  history.pushState({}, '', url.toString());
  renderCurrentPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeSidebar();
}

function renderCurrentPage() {
  const path = location.pathname;
  const basePath = '/' + path.split('/')[1];
  const handler = routes[basePath] || renderHome;
  handler();
}

/* ============================================================
   الصفحة الرئيسية
   ============================================================ */
async function renderHome() {
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';

  const [slidersData, categoriesData, productsData, reviewsData, faqData] = await Promise.all([
    apiGet('/sliders'),
    apiGet('/categories'),
    apiGet('/products?sort=popular&limit=8'),
    apiGet('/reviews?limit=6'),
    apiGet('/faq?limit=5'),
  ]);

  main.innerHTML = `
    ${renderSlider(slidersData.sliders || [])}
    <div class="container">
      ${renderCategoriesSection(categoriesData.categories || [])}
      ${renderProductsSection(t('popular'), productsData.products || [], 'popular')}
      ${await renderFeaturedOffers()}
      ${renderAllProductsSection(productsData.products || [])}
      ${renderReviewsSection(reviewsData.reviews || [])}
      ${renderFAQSection(faqData.faq || [])}
    </div>
  `;

  initSlider();
  attachProductEvents();
}

/* ============================================================
   Hero Slider
   ============================================================ */
function renderSlider(sliders) {
  if (!sliders.length) return '';
  return `
    <div class="hero-slider" id="hero-slider">
      <div class="slider-track" id="slider-track">
        ${sliders.map(s => `
          <div class="slide">
            <img src="${s.image}" alt="${s.title || ''}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200'">
            <div class="slide-overlay">
              <div class="slide-content">
                ${s.title ? `<h1 class="slide-title">${s.title}</h1>` : ''}
                ${s.description ? `<p class="slide-desc">${s.description}</p>` : ''}
                ${s.button_text ? `<button class="btn btn-primary" onclick="navigate('${s.button_url || '/products'}')">${s.button_text}</button>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="slider-controls">
        ${sliders.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
      </div>
      <button class="slider-arrow prev" onclick="sliderPrev()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="slider-arrow next" onclick="sliderNext()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    </div>
  `;
}

let sliderIndex = 0;
let sliderTimer = null;

function initSlider() {
  const track = document.getElementById('slider-track');
  if (!track) return;
  const total = track.children.length;
  if (total < 2) return;
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide((sliderIndex + 1) % total), 5000);
}

function goToSlide(i) {
  const track = document.getElementById('slider-track');
  if (!track) return;
  sliderIndex = i;
  track.style.transform = `translateX(${i * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
  });
  clearInterval(sliderTimer);
  const total = track.children.length;
  sliderTimer = setInterval(() => goToSlide((sliderIndex + 1) % total), 5000);
}

function sliderPrev() {
  const track = document.getElementById('slider-track');
  if (!track) return;
  const total = track.children.length;
  goToSlide((sliderIndex - 1 + total) % total);
}

function sliderNext() {
  const track = document.getElementById('slider-track');
  if (!track) return;
  const total = track.children.length;
  goToSlide((sliderIndex + 1) % total);
}

/* ============================================================
   عرض الأقسام
   ============================================================ */
function renderCategoriesSection(categories) {
  if (!categories.length) return '';
  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${t('categories')}</h2>
        <a class="section-link" onclick="navigate('/categories')">
          ${t('see_all')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
      </div>
      <div class="categories-scroll">
        ${categories.map(c => `
          <div class="category-card" onclick="navigate('/products', {category: '${c.id}'})">
            <img src="${c.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'}" alt="${c.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'">
            <div class="category-card-info">
              <div class="category-card-name">${App.currentLang === 'en' && c.name_en ? c.name_en : c.name}</div>
              <div class="category-card-count">${c.products_count} ${t('products')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ============================================================
   عرض المنتجات
   ============================================================ */
function renderProductsSection(title, products, sortType) {
  if (!products.length) return '';
  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${title}</h2>
        <a class="section-link" onclick="navigate('/products', {sort: '${sortType}'})">
          ${t('see_all')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
      </div>
      <div class="products-grid">
        ${products.map(p => renderProductCard(p)).join('')}
      </div>
    </div>
  `;
}

function renderProductCard(p) {
  const price = formatPrice(p.price);
  const oldPrice = p.old_price ? formatPrice(p.old_price) : null;
  const isFav = App.favorites.includes(p.id);
  const isUnavailable = p.status !== 'available';

  return `
    <div class="product-card fade-in" data-id="${p.id}">
      <div class="product-img-wrap" onclick="navigate('/product', {id: '${p.id}'})">
        <img src="${p.main_image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'}"
          alt="${p.name}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'">
        ${p.discount > 0 ? `<span class="product-badge offer">-${p.discount}%</span>` : ''}
        ${p.status === 'out_of_stock' ? `<span class="product-badge out">${t('out_of_stock')}</span>` : ''}
        ${p.status === 'unavailable' ? `<span class="product-badge">${t('unavailable')}</span>` : ''}
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${p.id})" title="${t('favorites')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="${isFav ? '#EF4444' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="product-info">
        <div class="product-name" onclick="navigate('/product', {id: '${p.id}'})">${App.currentLang === 'en' && p.name_en ? p.name_en : p.name}</div>
        ${p.short_description ? `<div class="product-desc">${p.short_description}</div>` : ''}
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating || 0)}</span>
          <span class="rating-count">(${p.orders_count || 0})</span>
        </div>
        <div class="product-footer">
          <div>
            <div class="product-price">${price}</div>
            ${oldPrice ? `<div class="product-old-price">${oldPrice}</div>` : ''}
          </div>
          <button class="add-btn" onclick="addToCart(event, ${p.id})"
            ${isUnavailable ? 'disabled' : ''}
            title="${t('add_to_cart')}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

async function renderFeaturedOffers() {
  const data = await apiGet('/products?sort=popular&limit=4');
  const offers = (data.products || []).filter(p => p.discount > 0);
  if (!offers.length) return '';
  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${t('featured_offers')}</h2>
      </div>
      <div class="products-grid">
        ${offers.map(p => renderProductCard(p)).join('')}
      </div>
    </div>
  `;
}

function renderAllProductsSection(products) {
  return `
    <div class="section" id="all-products-section">
      <div class="section-header">
        <h2 class="section-title">${t('all_products')}</h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="form-select" style="width:auto;padding:8px 14px" onchange="filterProducts(this.value)">
            <option value="">${t('all_products')}</option>
            <option value="popular">${t('popular')}</option>
            <option value="price_asc">السعر: الأقل</option>
            <option value="price_desc">السعر: الأعلى</option>
            <option value="newest">${t('latest')}</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>
      <div class="products-grid" id="all-products-grid">
        ${products.map(p => renderProductCard(p)).join('')}
      </div>
    </div>
  `;
}

async function filterProducts(sort) {
  const grid = document.getElementById('all-products-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner"></div>';
  const data = await apiGet(`/products?sort=${sort}&limit=24`);
  grid.innerHTML = (data.products || []).map(p => renderProductCard(p)).join('');
  attachProductEvents();
}

function renderReviewsSection(reviews) {
  if (!reviews.length) return '';
  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${t('reviews')}</h2>
      </div>
      <div class="reviews-grid">
        ${reviews.map(r => `
          <div class="review-card fade-in">
            <div class="review-header">
              <div class="review-avatar">
                ${r.user_image ? `<img src="${r.user_image}" alt="${r.customer_name}">` : r.customer_name[0]}
              </div>
              <div>
                <div class="review-name">${r.customer_name}</div>
                ${r.product_name ? `<div class="review-product">${r.product_name}</div>` : ''}
              </div>
            </div>
            <div class="review-stars">${renderStars(r.rating)}</div>
            <div class="review-text">${r.review}</div>
            ${r.images?.length ? `
              <div class="review-images">
                ${r.images.map(img => `<img src="${img.image}" alt="review" onclick="openImageModal('${img.image}')">`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ${App.user ? `
        <div style="text-align:center;margin-top:24px">
          <button class="btn btn-outline" onclick="openWriteReviewModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            ${t('write_review')}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderFAQSection(faq) {
  if (!faq.length) return '';
  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">${t('faq')}</h2>
      </div>
      <div class="faq-list">
        ${faq.map((item, i) => `
          <div class="faq-item" id="faq-${i}">
            <div class="faq-q" onclick="toggleFAQ(${i})">
              <span>${App.currentLang === 'en' && item.question_en ? item.question_en : item.question}</span>
              <div class="faq-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </div>
            <div class="faq-a">${App.currentLang === 'en' && item.answer_en ? item.answer_en : item.answer}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleFAQ(i) {
  document.getElementById(`faq-${i}`)?.classList.toggle('open');
}

/* ============================================================
   صفحة تفاصيل المنتج
   ============================================================ */
async function renderProductDetail() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return navigate('/');

  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';

  const data = await apiGet(`/products/${id}`);
  if (!data.success) { main.innerHTML = '<div class="empty-state"><h3>المنتج غير موجود</h3></div>'; return; }

  const p = data.product;
  const imgs = data.images || [];
  const reviews = data.reviews || [];
  const related = data.related || [];
  const allImgs = [{ image: p.main_image }, ...imgs];
  const isFav = App.favorites.includes(p.id);

  main.innerHTML = `
    <div class="container">
      <div class="breadcrumb">
        <span class="breadcrumb-item" onclick="navigate('/')">${t('home')}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-item" onclick="navigate('/products', {category: '${p.category_id}'})">${p.category_name || t('products')}</span>
        <span class="breadcrumb-sep">›</span>
        <span>${p.name}</span>
      </div>
      <div class="product-page-grid">
        <div>
          <div class="product-gallery-main" id="gallery-main">
            <img id="gallery-main-img" src="${p.main_image || ''}" alt="${p.name}"
              onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'">
          </div>
          ${allImgs.length > 1 ? `
            <div class="product-gallery-thumbs">
              ${allImgs.filter(i => i.image).map((img, idx) => `
                <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImg('${img.image}', this)">
                  <img src="${img.image}" alt="">
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div>
          <h1 class="product-page-name">${App.currentLang === 'en' && p.name_en ? p.name_en : p.name}</h1>
          <div class="product-rating" style="margin-bottom:12px">
            <span class="stars" style="font-size:18px">${renderStars(p.rating || 0)}</span>
            <span class="rating-count" style="font-size:13px">(${p.orders_count || 0} ${t('orders')})</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:16px">
            <div class="product-page-price">${formatPrice(p.price)}</div>
            ${p.old_price ? `<div style="font-size:16px;color:var(--text3);text-decoration:line-through">${formatPrice(p.old_price)}</div>` : ''}
            ${p.discount > 0 ? `<span class="product-badge offer" style="position:static">-${p.discount}%</span>` : ''}
          </div>
          <span class="product-status-badge ${p.status === 'available' ? 'status-available' : p.status === 'out_of_stock' ? 'status-out' : 'status-unavailable'}">
            ● ${p.status === 'available' ? t('available') : p.status === 'out_of_stock' ? t('out_of_stock') : t('unavailable')}
          </span>
          ${p.short_description || p.full_description ? `
            <div class="product-page-desc">${p.full_description || p.short_description}</div>
          ` : ''}
          <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
            <button class="btn btn-primary" style="flex:1" onclick="addToCart(event, ${p.id})" ${p.status !== 'available' ? 'disabled' : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              ${t('add_to_cart')}
            </button>
            <button class="btn btn-outline fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${p.id})" style="width:auto;padding:12px">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="${isFav ? '#EF4444' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      </div>

      ${reviews.length ? `
        <div class="section">
          <h2 class="section-title">${t('reviews')}</h2>
          <div class="reviews-grid" style="margin-top:16px">
            ${reviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <div class="review-avatar">${r.customer_name[0]}</div>
                  <div>
                    <div class="review-name">${r.customer_name}</div>
                    <div class="review-stars">${renderStars(r.rating)}</div>
                  </div>
                </div>
                <div class="review-text">${r.review}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${related.length ? `
        <div class="section">
          <h2 class="section-title">منتجات مشابهة</h2>
          <div class="products-grid" style="margin-top:16px">
            ${related.map(p => renderProductCard(p)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  attachProductEvents();
}

function switchGalleryImg(src, thumb) {
  document.getElementById('gallery-main-img').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

/* ============================================================
   صفحة جميع المنتجات
   ============================================================ */
async function renderProductsPage() {
  const params = new URLSearchParams(location.search);
  const catId = params.get('category');
  const sort = params.get('sort') || '';

  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';

  const [catData, prodData] = await Promise.all([
    apiGet('/categories'),
    apiGet(`/products?${catId ? `category=${catId}&` : ''}sort=${sort}&limit=40`)
  ]);

  main.innerHTML = `
    <div class="container">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${t('products')}</h2>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
          <div class="categories-scroll" style="flex:1">
            <div class="category-card ${!catId ? 'active' : ''}" onclick="navigate('/products')" style="min-width:80px">
              <div style="padding:12px;text-align:center;font-size:13px;font-weight:700">الكل</div>
            </div>
            ${(catData.categories || []).map(c => `
              <div class="category-card ${catId == c.id ? 'active' : ''}" onclick="navigate('/products', {category: '${c.id}'})" style="min-width:80px">
                <img src="${c.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'}" alt="${c.name}" style="height:60px" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'">
                <div class="category-card-info"><div class="category-card-name" style="font-size:12px">${c.name}</div></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
          <select class="form-select" style="width:auto;padding:8px 14px" onchange="navigate('/products', {sort: this.value${catId ? `, category: '${catId}'` : ''}})">
            <option value="">الترتيب</option>
            <option value="popular" ${sort === 'popular' ? 'selected' : ''}>${t('popular')}</option>
            <option value="price_asc" ${sort === 'price_asc' ? 'selected' : ''}>السعر: الأقل</option>
            <option value="price_desc" ${sort === 'price_desc' ? 'selected' : ''}>السعر: الأعلى</option>
            <option value="newest" ${sort === 'newest' ? 'selected' : ''}>${t('latest')}</option>
            <option value="rating" ${sort === 'rating' ? 'selected' : ''}>الأعلى تقييماً</option>
          </select>
        </div>
        <div class="products-grid">
          ${(prodData.products || []).map(p => renderProductCard(p)).join('') || '<div class="empty-state"><h3>لا توجد منتجات</h3></div>'}
        </div>
      </div>
    </div>
  `;
  attachProductEvents();
}

/* ============================================================
   السلة
   ============================================================ */
function setupCartUI() {
  const cartSidebar = document.getElementById('cart-sidebar');
  if (!cartSidebar) return;
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
}

function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCartSidebar();
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCartSidebar() {
  const cartItems = document.getElementById('cart-items-list');
  const cartFooter = document.getElementById('cart-footer');
  if (!cartItems) return;

  if (App.cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>${t('empty_cart')}</p>
        <button class="btn btn-primary btn-sm" onclick="navigate('/products');closeCart()">${t('products')}</button>
      </div>
    `;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  let subtotal = 0;
  App.cart.forEach(item => subtotal += item.price * item.quantity);
  const discount = App.cartDiscount || 0;
  const total = subtotal - discount;

  cartItems.innerHTML = App.cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'">
      <div style="flex:1">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          <button class="cart-remove" onclick="removeFromCart(${item.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (cartFooter) {
    cartFooter.style.display = 'block';
    cartFooter.innerHTML = `
      <div class="coupon-row">
        <input class="form-input" id="coupon-input" placeholder="${t('enter_coupon')}" value="${App.couponCode || ''}">
        <button class="btn btn-outline btn-sm" onclick="applyCoupon()">${t('apply')}</button>
      </div>
      <div class="cart-summary-row"><span>${t('subtotal')}</span><span>${formatPrice(subtotal)}</span></div>
      ${discount > 0 ? `<div class="cart-summary-row" style="color:var(--success)"><span>${t('discount')}</span><span>-${formatPrice(discount)}</span></div>` : ''}
      <div class="cart-total"><span>${t('total')}</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn-primary btn-block" onclick="goToCheckout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
        ${t('checkout')} (${App.cart.length})
      </button>
    `;
  }
}

function addToCart(e, productId) {
  e.stopPropagation();
  const btn = e.currentTarget;
  btn.disabled = true;
  setTimeout(() => { if (btn) btn.disabled = false; }, 800);

  /* جلب بيانات المنتج من الـ DOM */
  const card = btn.closest('.product-card, .product-page-grid');
  let product = {
    id: productId,
    name: card?.querySelector('.product-name, .product-page-name')?.textContent?.trim() || 'منتج',
    price: parseCartPrice(card?.querySelector('.product-price, .product-page-price')?.textContent || '0'),
    image: card?.querySelector('img')?.src || '',
  };

  /* البحث في الـ cart */
  const exists = App.cart.find(i => i.id === productId);
  if (exists) {
    exists.quantity++;
  } else {
    App.cart.push({ ...product, quantity: 1 });
  }

  saveCartToStorage();
  updateCartBadge();
  showToast(`تم إضافة "${product.name}" للسلة`, 'success');

  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
  setTimeout(() => {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  }, 1200);
}

function parseCartPrice(str) {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function changeQty(id, delta) {
  const item = App.cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) App.cart = App.cart.filter(i => i.id !== id);
  saveCartToStorage();
  updateCartBadge();
  renderCartSidebar();
}

function removeFromCart(id) {
  App.cart = App.cart.filter(i => i.id !== id);
  saveCartToStorage();
  updateCartBadge();
  renderCartSidebar();
}

function updateCartBadge() {
  const total = App.cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(App.cart));
}

function loadCartFromStorage() {
  try { App.cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) { App.cart = []; }
}

async function applyCoupon() {
  const code = document.getElementById('coupon-input')?.value?.trim();
  if (!code) return;
  const subtotal = App.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const data = await apiPost('/coupons/verify', { code, subtotal });
  if (data.success) {
    App.cartDiscount = data.discount;
    App.couponCode = code;
    showToast(`تم تطبيق الكوبون! خصم ${formatPrice(data.discount)}`, 'success');
    renderCartSidebar();
  } else {
    showToast(data.message, 'error');
  }
}

function goToCheckout() {
  if (!App.user) { showLoginModal(); return; }
  if (App.cart.length === 0) { showToast(t('empty_cart'), 'warning'); return; }
  closeCart();
  navigate('/checkout');
}

/* ============================================================
   صفحة الـ Checkout
   ============================================================ */
async function renderCheckout() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }
  if (App.cart.length === 0) { navigate('/'); return; }

  const main = document.getElementById('main-view');
  const [pmData] = await Promise.all([apiGet('/payment-methods')]);
  const methods = pmData.methods || [];

  let subtotal = App.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = App.cartDiscount || 0;
  const total = subtotal - discount;
  const userPoints = App.user?.points || 0;
  const pointsValue = 1;

  main.innerHTML = `
    <div class="payment-page">
      <h2 style="font-size:22px;font-weight:900;margin-bottom:24px">${t('checkout')}</h2>

      <div class="admin-form" style="max-width:100%;margin-bottom:20px">
        <div class="admin-form-title">ملخص الطلب</div>
        ${App.cart.map(item => `
          <div style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <img src="${item.image}" style="width:48px;height:48px;border-radius:8px;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'">
            <div style="flex:1"><div style="font-weight:600;font-size:13px">${item.name}</div><div style="font-size:12px;color:var(--text2)">${item.quantity} × ${formatPrice(item.price)}</div></div>
            <div style="font-weight:700;color:var(--primary)">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}
        <div class="cart-summary-row" style="margin-top:12px"><span>${t('subtotal')}</span><span>${formatPrice(subtotal)}</span></div>
        ${discount > 0 ? `<div class="cart-summary-row" style="color:var(--success)"><span>${t('discount')}</span><span>-${formatPrice(discount)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
          <span>${t('total')}</span>
          <span style="color:var(--primary)" id="checkout-total">${formatPrice(total)}</span>
        </div>
      </div>

      ${userPoints > 0 ? `
        <div class="admin-form" style="max-width:100%;margin-bottom:20px">
          <div class="admin-form-title">${t('use_points')}</div>
          <p style="font-size:13px;color:var(--text2);margin-bottom:12px">لديك <strong style="color:var(--primary)">${userPoints}</strong> نقطة (كل 10 نقاط = ${formatPrice(10 * pointsValue)})</p>
          <div style="display:flex;gap:10px;align-items:center">
            <input type="number" class="form-input" id="points-input" placeholder="عدد النقاط" max="${userPoints}" min="0" style="flex:1">
            <button class="btn btn-outline btn-sm" onclick="applyPoints()">تطبيق</button>
          </div>
        </div>
      ` : ''}

      <div class="admin-form" style="max-width:100%">
        <div class="admin-form-title">${t('select_payment')}</div>
        <div class="payment-methods-list" id="pm-list">
          ${methods.map(pm => `
            <div class="payment-method-item" onclick="selectPaymentMethod(${pm.id}, this)" data-id="${pm.id}">
              <div class="pm-icon">${pm.image ? `<img src="${pm.image}" alt="${pm.name}">` : '💳'}</div>
              <div><div class="pm-name">${pm.name}</div><div class="pm-desc">${pm.description || ''}</div></div>
              <div style="margin-right:auto;width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center" class="pm-radio"></div>
            </div>
          `).join('')}
        </div>

        <div id="payment-details" style="display:none"></div>

        <div class="form-group" style="margin-top:16px">
          <label class="form-label">ملاحظات للطلب (اختياري)</label>
          <textarea class="form-textarea" id="order-notes" placeholder="أي تعليمات خاصة؟"></textarea>
        </div>

        <div id="proof-upload-section" style="display:none">
          <label class="form-label">${t('upload_proof')}</label>
          <div class="upload-area" onclick="document.getElementById('proof-file').click()">
            <input type="file" id="proof-file" accept="image/*" style="display:none" onchange="previewProof(this)">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 8px;opacity:0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style="font-size:13px;color:var(--text2)">اضغط لرفع صورة إثبات الدفع</p>
            <img id="proof-preview" style="display:none" class="upload-preview">
          </div>
        </div>

        <button class="btn btn-primary btn-block" style="margin-top:20px" onclick="submitOrder()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          تأكيد الطلب — ${formatPrice(total)}
        </button>
      </div>
    </div>
  `;

  App.selectedPaymentId = null;
}

function selectPaymentMethod(id, el) {
  document.querySelectorAll('.payment-method-item').forEach(item => {
    item.classList.remove('selected');
    item.querySelector('.pm-radio').innerHTML = '';
    item.querySelector('.pm-radio').style.borderColor = 'var(--border)';
  });
  el.classList.add('selected');
  el.querySelector('.pm-radio').innerHTML = '<div style="width:10px;height:10px;background:var(--primary);border-radius:50%"></div>';
  el.querySelector('.pm-radio').style.borderColor = 'var(--primary)';
  App.selectedPaymentId = id;

  /* عرض تفاصيل طريقة الدفع */
  const detailBox = document.getElementById('payment-details');
  const proofSection = document.getElementById('proof-upload-section');

  apiGet('/payment-methods').then(data => {
    const pm = (data.methods || []).find(m => m.id === id);
    if (!pm) return;
    detailBox.style.display = 'block';
    detailBox.innerHTML = `
      <div class="payment-details-box">
        <div class="payment-account">
          <div>
            <div class="payment-account-label">اسم الحساب</div>
            <div class="payment-account-value">${pm.account_name || '-'}</div>
          </div>
        </div>
        <div class="payment-account">
          <div style="flex:1">
            <div class="payment-account-label">رقم / معرف الحساب</div>
            <div class="payment-account-value" id="account-num">${pm.account_number || '-'}</div>
          </div>
          <button class="copy-btn" onclick="copyText('${pm.account_number}')">نسخ</button>
        </div>
        ${pm.instructions ? `<div style="padding:12px 0;font-size:13px;color:var(--text2);line-height:1.7">${pm.instructions}</div>` : ''}
      </div>
    `;
    if (proofSection) proofSection.style.display = 'block';
  });
}

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => showToast('تم النسخ!', 'success')).catch(() => {});
}

function previewProof(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById('proof-preview');
  const reader = new FileReader();
  reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
  reader.readAsDataURL(file);
  document.querySelector('.upload-area').classList.add('has-file');
}

function applyPoints() {
  const pts = parseInt(document.getElementById('points-input')?.value || 0);
  App.pointsUsed = Math.min(pts, App.user?.points || 0);
  showToast(`سيتم استخدام ${App.pointsUsed} نقطة`, 'info');
}

async function submitOrder() {
  if (!App.selectedPaymentId) { showToast('يرجى اختيار طريقة الدفع', 'warning'); return; }
  if (App.cart.length === 0) { showToast(t('empty_cart'), 'warning'); return; }

  const btn = document.querySelector('#main-view .btn-primary[onclick="submitOrder()"]');
  if (btn) { btn.disabled = true; btn.textContent = t('loading'); }

  const orderData = {
    items: App.cart.map(i => ({ product_id: i.id, name: i.name, quantity: i.quantity })),
    payment_method_id: App.selectedPaymentId,
    coupon_code: App.couponCode || null,
    points_used: App.pointsUsed || 0,
    notes: document.getElementById('order-notes')?.value || '',
  };

  const data = await apiPost('/orders', orderData);

  if (data.success) {
    /* رفع إثبات الدفع إن وُجد */
    const proofFile = document.getElementById('proof-file')?.files[0];
    if (proofFile && data.order?.id) {
      const formData = new FormData();
      formData.append('proof', proofFile);
      await apiFetch(`/orders/${data.order.id}/payment-proof`, { method: 'POST', body: formData });
    }

    App.cart = [];
    App.cartDiscount = 0;
    App.couponCode = null;
    App.pointsUsed = 0;
    saveCartToStorage();
    updateCartBadge();
    showOrderSuccessModal(data.order);
  } else {
    showToast(data.message || 'حدث خطأ', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'تأكيد الطلب'; }
  }
}

function showOrderSuccessModal(order) {
  openModal(`
    <div style="text-align:center;padding:20px">
      <div style="width:80px;height:80px;background:rgba(16,185,129,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px">✓</div>
      <h2 style="font-size:22px;font-weight:900;margin-bottom:8px;color:var(--success)">${t('order_confirmed')}</h2>
      <p style="color:var(--text2);font-size:14px;margin-bottom:4px">رقم الطلب: <strong style="color:var(--primary)">${order.order_number}</strong></p>
      <p style="color:var(--text2);font-size:13px;margin-bottom:24px">الإجمالي: ${formatPrice(order.total)}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="navigate('/orders');closeModal()">متابعة الطلبات</button>
        <button class="btn btn-outline" onclick="navigate('/');closeModal()">العودة للمتجر</button>
      </div>
    </div>
  `, 'تم الطلب!');
}

/* ============================================================
   طلبات المستخدم
   ============================================================ */
async function renderOrdersPage() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }

  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';

  const data = await apiGet('/orders/my');

  main.innerHTML = `
    <div class="user-page">
      <h2 style="font-size:22px;font-weight:900;margin-bottom:20px">${t('orders')}</h2>
      ${(data.orders || []).length === 0 ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h3>لا توجد طلبات بعد</h3>
          <button class="btn btn-primary" onclick="navigate('/products')">ابدأ الطلب</button>
        </div>
      ` : (data.orders || []).map(o => `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-number">#${o.order_number}</div>
              <div class="order-date">${formatDate(o.created_at)}</div>
            </div>
            <span class="status-pill pill-${o.status}">${statusLabel(o.status)}</span>
          </div>
          <div class="order-items-preview">
            ${(o.items || []).slice(0, 4).map(item => `
              <img class="order-item-thumb" src="${item.product_image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'}" alt="${item.product_name}" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'">
            `).join('')}
            ${o.items?.length > 4 ? `<div style="width:48px;height:48px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">+${o.items.length - 4}</div>` : ''}
          </div>
          <div class="order-footer">
            <div class="order-total">${formatPrice(o.total)}</div>
            <div style="display:flex;gap:8px">
              ${o.status === 'pending' && !o.payment_proof ? `
                <button class="btn btn-outline btn-sm" onclick="openProofUploadForOrder(${o.id})">رفع إثبات الدفع</button>
              ` : ''}
              ${o.status === 'pending' ? `
                <button class="btn btn-danger btn-sm" onclick="cancelOrder(${o.id})">إلغاء</button>
              ` : ''}
              <button class="btn btn-outline btn-sm" onclick="navigate('/order', {id: '${o.id}'})">التفاصيل</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function cancelOrder(id) {
  if (!confirm('هل تريد إلغاء هذا الطلب؟')) return;
  const data = await apiPut(`/orders/${id}/cancel`, {});
  if (data.success) { showToast('تم إلغاء الطلب', 'info'); renderOrdersPage(); }
  else showToast(data.message, 'error');
}

/* ============================================================
   الملف الشخصي
   ============================================================ */
async function renderProfilePage() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }

  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';

  const [profileData, statsData] = await Promise.all([
    apiGet('/auth/profile'),
    apiGet('/auth/stats')
  ]);

  const user = profileData.user || App.user;
  const stats = statsData.stats || {};

  main.innerHTML = `
    <div class="user-page">
      <div class="loyalty-card" style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="user-avatar" style="width:64px;height:64px;font-size:22px;border:3px solid rgba(255,255,255,0.3)">
            ${user.profile_image ? `<img src="${user.profile_image}" alt="${user.full_name}">` : user.full_name[0]}
          </div>
          <div>
            <div style="font-size:18px;font-weight:900;color:white">${user.full_name}</div>
            <div style="font-size:12px;opacity:0.8;color:white">${user.email || user.phone}</div>
            <div class="loyalty-level" style="margin-top:4px">${loyaltyLabel(user.loyalty_level)}</div>
          </div>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-icon orange">🛍️</div><div><div class="stat-value">${stats.orders_count || 0}</div><div class="stat-label">الطلبات المكتملة</div></div></div>
        <div class="stat-card"><div class="stat-icon green">⭐</div><div><div class="stat-value">${user.points || 0}</div><div class="stat-label">نقاط المكافآت</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">❤️</div><div><div class="stat-value">${stats.favorites_count || 0}</div><div class="stat-label">المفضلة</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">🎫</div><div><div class="stat-value">${stats.available_coupons || 0}</div><div class="stat-label">كوبونات متاحة</div></div></div>
      </div>

      <div class="user-tabs">
        <div class="user-tab active" onclick="switchProfileTab('edit', this)">تعديل البيانات</div>
        <div class="user-tab" onclick="switchProfileTab('password', this)">كلمة المرور</div>
        <div class="user-tab" onclick="switchProfileTab('prefs', this)">التفضيلات</div>
      </div>

      <div id="profile-edit-tab" class="admin-form" style="max-width:100%">
        <div class="form-group">
          <label class="form-label">${t('full_name')}</label>
          <input class="form-input" id="edit-name" value="${user.full_name}" placeholder="${t('full_name')}">
        </div>
        <div class="form-group">
          <label class="form-label">${t('phone')}</label>
          <input class="form-input" id="edit-phone" value="${user.phone || ''}" placeholder="${t('phone')}">
        </div>
        <div class="form-group">
          <label class="form-label">${t('email')}</label>
          <input class="form-input" value="${user.email || ''}" disabled style="opacity:0.5">
        </div>
        <button class="btn btn-primary" onclick="saveProfile()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          ${t('save')}
        </button>
      </div>

      <div id="profile-password-tab" style="display:none" class="admin-form" style="max-width:100%">
        <div class="form-group">
          <label class="form-label">كلمة المرور الحالية</label>
          <input class="form-input" id="current-pass" type="password" placeholder="كلمة المرور الحالية">
        </div>
        <div class="form-group">
          <label class="form-label">${t('password')}</label>
          <input class="form-input" id="new-pass" type="password" placeholder="كلمة المرور الجديدة">
        </div>
        <div class="form-group">
          <label class="form-label">${t('confirm_password')}</label>
          <input class="form-input" id="confirm-pass" type="password" placeholder="${t('confirm_password')}">
        </div>
        <button class="btn btn-primary" onclick="changePassword()">تغيير كلمة المرور</button>
      </div>

      <div id="profile-prefs-tab" style="display:none" class="admin-form" style="max-width:100%">
        <div class="form-group">
          <label class="form-label">اللغة المفضلة</label>
          <select class="form-select" id="pref-lang" onchange="setLanguage(this.value)">
            <option value="ar" ${App.currentLang === 'ar' ? 'selected' : ''}>العربية</option>
            <option value="en" ${App.currentLang === 'en' ? 'selected' : ''}>English</option>
            <option value="tr" ${App.currentLang === 'tr' ? 'selected' : ''}>Türkçe</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">العملة المفضلة</label>
          <select class="form-select" id="pref-currency" onchange="setCurrency(this.value)">
            ${App.currencies.map(c => `<option value="${c.code}" ${App.currentCurrency === c.code ? 'selected' : ''}>${c.name} (${c.symbol})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">المظهر</label>
          <div style="display:flex;gap:10px">
            <button class="btn ${document.documentElement.getAttribute('data-theme') !== 'light' ? 'btn-primary' : 'btn-outline'}" onclick="setTheme('dark')">الوضع الليلي</button>
            <button class="btn ${document.documentElement.getAttribute('data-theme') === 'light' ? 'btn-primary' : 'btn-outline'}" onclick="setTheme('light')">الوضع النهاري</button>
          </div>
        </div>
      </div>

      <div style="margin-top:20px">
        <button class="btn btn-danger" onclick="logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          ${t('logout')}
        </button>
      </div>
    </div>
  `;
}

function switchProfileTab(tab, el) {
  ['edit', 'password', 'prefs'].forEach(t => {
    document.getElementById(`profile-${t}-tab`).style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

async function saveProfile() {
  const data = await apiPut('/auth/profile', {
    full_name: document.getElementById('edit-name')?.value,
    phone: document.getElementById('edit-phone')?.value,
    language: App.currentLang,
    currency: App.currentCurrency,
  });
  if (data.success) { showToast('تم حفظ البيانات بنجاح', 'success'); }
  else showToast(data.message, 'error');
}

async function changePassword() {
  const current = document.getElementById('current-pass')?.value;
  const newPass = document.getElementById('new-pass')?.value;
  const confirm = document.getElementById('confirm-pass')?.value;
  if (newPass !== confirm) { showToast('كلمتا المرور غير متطابقتين', 'error'); return; }
  const data = await apiPut('/auth/change-password', { current_password: current, new_password: newPass });
  if (data.success) { showToast('تم تغيير كلمة المرور', 'success'); }
  else showToast(data.message, 'error');
}

/* ============================================================
   المفضلة
   ============================================================ */
function toggleFavorite(e, productId) {
  e.stopPropagation();
  const idx = App.favorites.indexOf(productId);
  if (idx > -1) {
    App.favorites.splice(idx, 1);
    showToast('تم الحذف من المفضلة', 'info');
  } else {
    App.favorites.push(productId);
    showToast('تم الإضافة للمفضلة', 'success');
  }
  localStorage.setItem('favorites', JSON.stringify(App.favorites));
  updateFavBadge();

  /* مزامنة مع السيرفر إن كان المستخدم مسجلاً */
  if (App.user) apiPost(`/favorites/${productId}`, {}).catch(() => {});

  /* تحديث أيقونة القلب في البطاقة */
  const cards = document.querySelectorAll(`.product-card[data-id="${productId}"] .fav-btn`);
  cards.forEach(btn => {
    const isFav = App.favorites.includes(productId);
    btn.classList.toggle('active', isFav);
    btn.querySelector('svg').setAttribute('fill', isFav ? '#EF4444' : 'none');
    btn.querySelector('svg').setAttribute('stroke', isFav ? '#EF4444' : 'currentColor');
  });
}

function loadFavoritesFromStorage() {
  try { App.favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); } catch (e) { App.favorites = []; }
  if (App.user) {
    apiGet('/favorites').then(data => {
      if (data.success) {
        App.favorites = (data.favorites || []).map(p => p.id);
        localStorage.setItem('favorites', JSON.stringify(App.favorites));
        updateFavBadge();
      }
    }).catch(() => {});
  }
}

function updateFavBadge() {
  document.querySelectorAll('.fav-badge').forEach(el => {
    el.textContent = App.favorites.length;
    el.style.display = App.favorites.length > 0 ? 'flex' : 'none';
  });
}

async function renderFavoritesPage() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet('/favorites');
  main.innerHTML = `
    <div class="container">
      <div class="section">
        <h2 class="section-title">${t('favorites')}</h2>
        <div class="products-grid" style="margin-top:20px">
          ${(data.favorites || []).map(p => renderProductCard(p)).join('') || '<div class="empty-state"><h3>لا توجد منتجات مفضلة</h3></div>'}
        </div>
      </div>
    </div>
  `;
  attachProductEvents();
}

/* ============================================================
   الإشعارات
   ============================================================ */
function setupNotifDropdown() {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = document.getElementById('notif-dropdown');
    dd?.classList.toggle('open');
    if (dd?.classList.contains('open') && App.user) loadNotifications();
  });
  document.addEventListener('click', () => document.getElementById('notif-dropdown')?.classList.remove('open'));
}

async function loadNotifications() {
  if (!App.user) return;
  const dd = document.getElementById('notif-dropdown');
  if (!dd) return;
  const data = await apiGet('/notifications');
  const notifs = data.notifications || [];
  const notifList = dd.querySelector('.notif-list');
  if (!notifList) return;

  document.querySelectorAll('.notif-badge').forEach(el => {
    el.textContent = data.unread || 0;
    el.style.display = data.unread > 0 ? 'flex' : 'none';
  });

  notifList.innerHTML = notifs.length === 0 ? `
    <div style="text-align:center;padding:30px;color:var(--text3)">لا توجد إشعارات</div>
  ` : notifs.map(n => `
    <div class="notif-item ${!n.is_read ? 'unread' : ''}" onclick="markNotifRead(${n.id})">
      <div class="notif-icon-wrap">🔔</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        ${n.description ? `<div class="notif-desc">${n.description}</div>` : ''}
        <div class="notif-time">${timeAgo(n.created_at)}</div>
      </div>
    </div>
  `).join('');
}

async function markNotifRead(id) {
  await apiPut(`/notifications/${id}/read`, {});
  loadNotifications();
}

async function renderNotificationsPage() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet('/notifications');
  main.innerHTML = `
    <div class="container">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${t('notifications')}</h2>
          ${data.notifications?.length ? `<button class="btn btn-outline btn-sm" onclick="markAllRead()">تعليم الكل كمقروء</button>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(data.notifications || []).map(n => `
            <div style="background:var(--card);border:1px solid ${!n.is_read ? 'var(--primary)' : 'var(--border)'};border-radius:var(--radius);padding:16px;display:flex;gap:14px;cursor:pointer" onclick="markNotifRead(${n.id})">
              <div class="notif-icon-wrap">🔔</div>
              <div>
                <div style="font-weight:700;font-size:14px;margin-bottom:4px">${n.title}</div>
                ${n.description ? `<div style="font-size:13px;color:var(--text2)">${n.description}</div>` : ''}
                <div style="font-size:11px;color:var(--text3);margin-top:6px">${timeAgo(n.created_at)}</div>
              </div>
            </div>
          `).join('') || '<div class="empty-state"><h3>لا توجد إشعارات</h3></div>'}
        </div>
      </div>
    </div>
  `;
}

async function markAllRead() {
  await apiPut('/notifications/read-all', {});
  renderNotificationsPage();
}

/* ============================================================
   صفحة الولاء والنقاط
   ============================================================ */
async function renderLoyaltyPage() {
  if (!App.user) { showLoginModal(); navigate('/'); return; }
  const main = document.getElementById('main-view');
  const statsData = await apiGet('/auth/stats');
  const stats = statsData.stats || {};
  const levels = [
    { name: 'برونزي', min: 0, max: 499, color: '#CD7F32' },
    { name: 'فضي', min: 500, max: 1999, color: '#C0C0C0' },
    { name: 'ذهبي', min: 2000, max: 4999, color: '#FFD700' },
    { name: 'بلاتيني', min: 5000, max: 9999, color: '#E5E4E2' },
    { name: 'ماسي', min: 10000, max: Infinity, color: '#B9F2FF' },
  ];

  main.innerHTML = `
    <div class="user-page">
      <div class="loyalty-card">
        <div class="loyalty-level">${loyaltyLabel(App.user.loyalty_level)}</div>
        <div class="loyalty-points">${App.user.points || 0}</div>
        <div class="loyalty-points-label">${t('my_points')}</div>
      </div>

      <div class="admin-form" style="max-width:100%;margin-bottom:20px">
        <div class="admin-form-title">مستويات الولاء</div>
        ${levels.map(lv => `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="width:36px;height:36px;border-radius:50%;background:${lv.color};display:flex;align-items:center;justify-content:center;font-size:18px">⭐</div>
            <div style="flex:1">
              <div style="font-weight:700">${lv.name}</div>
              <div style="font-size:12px;color:var(--text2)">إجمالي مشتريات من ${lv.min} إلى ${lv.max === Infinity ? '∞' : lv.max} ج.م</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="admin-form" style="max-width:100%">
        <div class="admin-form-title">سجل النقاط</div>
        ${(stats.points_history || []).map(ph => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:13px;font-weight:600">${ph.description}</div>
              <div style="font-size:11px;color:var(--text3)">${formatDate(ph.created_at)}</div>
            </div>
            <div style="font-weight:800;color:${ph.points > 0 ? 'var(--success)' : 'var(--danger)'}">
              ${ph.points > 0 ? '+' : ''}${ph.points}
            </div>
          </div>
        `).join('') || '<div style="text-align:center;padding:20px;color:var(--text3)">لا يوجد سجل</div>'}
      </div>
    </div>
  `;
}

function loyaltyLabel(level) {
  const map = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', diamond: 'ماسي' };
  return map[level] || 'برونزي';
}

/* ============================================================
   صفحات أخرى
   ============================================================ */
async function renderFAQPage() {
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet('/faq');
  main.innerHTML = `<div class="container"><div class="section"><h2 class="section-title">${t('faq')}</h2><div style="margin-top:20px">${renderFAQSection(data.faq || '')}</div></div></div>`;
}

async function renderStaticPage() {
  const path = location.pathname.replace('/', '');
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet(`/pages/${path}`);
  main.innerHTML = `
    <div class="container">
      <div class="section" style="max-width:800px;margin:0 auto">
        <h2 class="section-title">${data.page?.title || path}</h2>
        <div style="margin-top:20px;line-height:1.9;font-size:14px;color:var(--text2)">${data.page?.content || '<p>المحتوى غير متوفر حالياً</p>'}</div>
      </div>
    </div>
  `;
}

async function renderCategoriesPage() {
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet('/categories');
  main.innerHTML = `
    <div class="container">
      <div class="section">
        <h2 class="section-title">${t('categories')}</h2>
        <div class="products-grid" style="margin-top:20px">
          ${(data.categories || []).map(c => `
            <div class="product-card" onclick="navigate('/products', {category: '${c.id}'})">
              <div class="product-img-wrap">
                <img src="${c.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'}" alt="${c.name}" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'">
              </div>
              <div class="product-info">
                <div class="product-name">${c.name}</div>
                <div class="product-desc">${c.products_count} ${t('products')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function renderSearchPage() {
  const q = new URLSearchParams(location.search).get('q') || '';
  const main = document.getElementById('main-view');
  main.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await apiGet(`/products?search=${encodeURIComponent(q)}&limit=40`);
  main.innerHTML = `
    <div class="container">
      <div class="section">
        <h2 class="section-title">نتائج: "${q}"</h2>
        <div class="products-grid" style="margin-top:20px">
          ${(data.products || []).map(p => renderProductCard(p)).join('') || '<div class="empty-state"><h3>لا توجد نتائج</h3></div>'}
        </div>
      </div>
    </div>
  `;
  attachProductEvents();
}

function renderOffers() { navigate('/products', { sort: 'popular' }); }
async function renderCartPage() { openCart(); }
async function renderPaymentPage() { renderCheckout(); }
async function renderOrderDetail() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return navigate('/orders');
  const main = document.getElementById('main-view');
  const data = await apiGet(`/orders/${id}`);
  if (!data.success) return navigate('/orders');
  const o = data.order;
  main.innerHTML = `
    <div class="user-page">
      <div class="admin-form" style="max-width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <button class="btn btn-outline btn-sm" onclick="navigate('/orders')">← رجوع</button>
          <span class="status-pill pill-${o.status}">${statusLabel(o.status)}</span>
        </div>
        <div class="admin-form-title">تفاصيل الطلب #${o.order_number}</div>
        ${(data.order?.items || []).map(item => `
          <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <img src="${item.product_image || ''}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;background:var(--bg3)" onerror="this.style.display='none'">
            <div style="flex:1"><div style="font-weight:600">${item.product_name}</div><div style="font-size:12px;color:var(--text2)">${item.quantity} × ${formatPrice(item.price)}</div></div>
            <div style="font-weight:700;color:var(--primary)">${formatPrice(item.total)}</div>
          </div>
        `).join('')}
        <div style="margin-top:12px">
          <div class="cart-summary-row"><span>المجموع</span><span>${formatPrice(o.subtotal)}</span></div>
          ${o.discount > 0 ? `<div class="cart-summary-row" style="color:var(--success)"><span>الخصم</span><span>-${formatPrice(o.discount)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:900;margin-top:10px"><span>الإجمالي</span><span style="color:var(--primary)">${formatPrice(o.total)}</span></div>
        </div>
        ${o.payment_proof ? `<div style="margin-top:16px"><div class="form-label">إثبات الدفع</div><img src="${o.payment_proof}" style="max-width:100%;border-radius:8px;margin-top:8px"></div>` : ''}
        ${o.notes ? `<div style="margin-top:12px;padding:12px;background:var(--bg3);border-radius:8px;font-size:13px;color:var(--text2)">${o.notes}</div>` : ''}
        <div style="font-size:12px;color:var(--text3);margin-top:12px">${t('date')}: ${formatDate(o.created_at)}</div>
      </div>
    </div>
  `;
}

/* ============================================================
   نظام البحث
   ============================================================ */
function setupSearchBar() {
  const searchBtn = document.getElementById('search-btn');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  searchBtn?.addEventListener('click', () => {
    searchModal?.classList.add('active');
    searchInput?.focus();
  });

  document.getElementById('search-close')?.addEventListener('click', () => {
    searchModal?.classList.remove('active');
  });

  let searchTimer;
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(searchTimer);
    if (q.length < 2) { searchResults.innerHTML = ''; return; }
    searchTimer = setTimeout(async () => {
      searchResults.innerHTML = '<div class="loading-spinner" style="width:24px;height:24px;margin:16px auto"></div>';
      const data = await apiGet(`/products?search=${encodeURIComponent(q)}&limit=8`);
      const products = data.products || [];
      searchResults.innerHTML = products.length ? products.map(p => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition)"
          onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''"
          onclick="navigate('/product', {id: '${p.id}'});searchModal?.classList.remove('active')">
          <img src="${p.main_image || ''}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;background:var(--bg3)" onerror="this.style.display='none'">
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${p.name}</div>
            <div style="font-size:13px;color:var(--primary);font-weight:700">${formatPrice(p.price)}</div>
          </div>
        </div>
      `).join('') : `<div style="text-align:center;padding:20px;color:var(--text3)">لا توجد نتائج لـ "${q}"</div>`;
    }, 400);
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate('/search', { q: searchInput.value.trim() });
  });
}

/* ============================================================
   المصادقة — Auth System
   ============================================================ */
function showLoginModal() {
  openModal(`
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px">🍽️</div>
      <h2 style="font-size:20px;font-weight:900">${t('login')}</h2>
      <p style="font-size:12px;color:var(--text2);margin-top:4px">سجل دخولك للمتابعة</p>
    </div>

    <div class="user-tabs" style="margin-bottom:20px">
      <div class="user-tab active" onclick="switchAuthTab('login', this)" id="login-tab-btn">تسجيل الدخول</div>
      <div class="user-tab" onclick="switchAuthTab('register', this)" id="register-tab-btn">إنشاء حساب</div>
    </div>

    <div id="login-form">
      <div class="form-group">
        <label class="form-label">البريد الإلكتروني أو رقم الهاتف</label>
        <input class="form-input" id="login-identifier" type="text" placeholder="البريد أو الهاتف">
      </div>
      <div class="form-group">
        <label class="form-label">${t('password')}</label>
        <input class="form-input" id="login-password" type="password" placeholder="${t('password')}">
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <label style="display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer">
          <input type="checkbox" id="remember-me"> ${t('remember_me')}
        </label>
        <span style="font-size:12px;color:var(--primary);cursor:pointer" onclick="showForgotPassword()">${t('forgot_password')}</span>
      </div>
      <button class="btn btn-primary btn-block" onclick="doLogin()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        ${t('login')}
      </button>
    </div>

    <div id="register-form" style="display:none">
      <div class="form-group">
        <label class="form-label">${t('full_name')}</label>
        <input class="form-input" id="reg-name" placeholder="${t('full_name')}">
      </div>
      <div class="form-group">
        <label class="form-label">رقم الهاتف (مصري 20...)</label>
        <input class="form-input" id="reg-phone" type="tel" placeholder="201012345678">
      </div>
      <div class="form-group">
        <label class="form-label">${t('email')} (اختياري)</label>
        <input class="form-input" id="reg-email" type="email" placeholder="${t('email')}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('password')}</label>
        <input class="form-input" id="reg-password" type="password" placeholder="8 أحرف على الأقل">
      </div>
      <div class="form-group">
        <label class="form-label">${t('confirm_password')}</label>
        <input class="form-input" id="reg-confirm" type="password" placeholder="${t('confirm_password')}">
      </div>
      <button class="btn btn-primary btn-block" onclick="doRegister()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        ${t('create_account')}
      </button>
    </div>
  `, t('login'));
}

function switchAuthTab(tab, el) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('#login-tab-btn, #register-tab-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

async function doLogin() {
  const identifier = document.getElementById('login-identifier')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const remember = document.getElementById('remember-me')?.checked;

  if (!identifier || !password) { showToast('أدخل البيانات المطلوبة', 'warning'); return; }

  const data = await apiPost('/auth/login', { identifier, password, remember });
  if (data.success) {
    App.token = data.token;
    App.user = data.user;
    localStorage.setItem('token', data.token);
    if (remember) localStorage.setItem('user', JSON.stringify(data.user));
    else sessionStorage.setItem('user', JSON.stringify(data.user));
    closeModal();
    updateAuthUI();
    loadFavoritesFromStorage();
    showToast(`مرحباً ${data.user.full_name}!`, 'success');
  } else {
    showToast(data.message, 'error');
  }
}

async function doRegister() {
  const full_name = document.getElementById('reg-name')?.value?.trim();
  const phone = document.getElementById('reg-phone')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  const confirm_password = document.getElementById('reg-confirm')?.value;

  if (!full_name) { showToast('أدخل اسمك الكامل', 'warning'); return; }

  const data = await apiPost('/auth/register', { full_name, phone, email, password, confirm_password });
  if (data.success) {
    App.token = data.token;
    localStorage.setItem('token', data.token);
    closeModal();
    /* إعادة جلب بيانات المستخدم */
    const profile = await apiGet('/auth/profile');
    if (profile.success) {
      App.user = profile.user;
      sessionStorage.setItem('user', JSON.stringify(profile.user));
    }
    updateAuthUI();
    showToast('تم إنشاء حسابك بنجاح!', 'success');
  } else {
    showToast(data.message, 'error');
  }
}

function logout() {
  if (App.token) apiPost('/auth/logout', {}).catch(() => {});
  App.token = null;
  App.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  updateAuthUI();
  showToast('تم تسجيل الخروج', 'info');
  navigate('/');
}

function loadAuthFromStorage() {
  App.token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  try { App.user = userStr ? JSON.parse(userStr) : null; } catch (e) { App.user = null; }
  loadCartFromStorage();

  if (App.token) {
    /* التحقق من صحة التوكن */
    apiGet('/auth/verify').then(data => {
      if (data.success) {
        App.user = data.user;
        updateAuthUI();
      } else {
        App.token = null;
        App.user = null;
        localStorage.removeItem('token');
        updateAuthUI();
      }
    }).catch(() => {});
  }
}

function updateAuthUI() {
  const loginBtns = document.querySelectorAll('.login-btn');
  const userMenu = document.querySelectorAll('.user-menu');
  const userNameEl = document.querySelectorAll('.user-name');

  if (App.user) {
    loginBtns.forEach(el => el.style.display = 'none');
    userMenu.forEach(el => el.style.display = 'flex');
    userNameEl.forEach(el => el.textContent = App.user.full_name);
  } else {
    loginBtns.forEach(el => el.style.display = 'flex');
    userMenu.forEach(el => el.style.display = 'none');
  }
}

/* ============================================================
   اللغة والعملة والمظهر
   ============================================================ */
function applyLanguage(lang) {
  App.currentLang = lang;
  document.documentElement.lang = lang;
  document.body.classList.toggle('ltr', lang !== 'ar');
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang);
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (key) el.textContent = t(key);
  });
}

function setLanguage(lang) {
  applyLanguage(lang);
  renderCurrentPage();
  if (App.user) apiPut('/auth/profile', { full_name: App.user.full_name, language: lang, currency: App.currentCurrency }).catch(() => {});
}

async function loadCurrencies() {
  const data = await apiGet('/currencies');
  App.currencies = data.currencies || [];
}

function applyCurrencyFromStorage() {
  App.currentCurrency = localStorage.getItem('currency') || 'EGP';
}

function setCurrency(code) {
  App.currentCurrency = code;
  localStorage.setItem('currency', code);
  /* تحديث الأسعار في الصفحة */
  renderCurrentPage();
  if (App.user) apiPut('/auth/profile', { full_name: App.user.full_name, language: App.currentLang, currency: code }).catch(() => {});
}

function formatPrice(amount) {
  const currency = App.currencies.find(c => c.code === App.currentCurrency);
  const rate = currency?.exchange_rate || 1;
  const converted = amount * rate;
  const symbol = currency?.symbol || 'ج.م';
  const formatted = converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  return `${formatted} ${symbol}`;
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'light' ? 'dark' : 'light');
}

/* ============================================================
   Sidebar
   ============================================================ */
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebar-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';

  /* تحميل عدد المتصلين */
  apiGet('/online-count').then(d => {
    if (d.success) {
      document.querySelectorAll('.online-count').forEach(el => el.textContent = d.count);
    }
  }).catch(() => {});
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   Modal
   ============================================================ */
let modalContent = '';
function openModal(content, title = '') {
  modalContent = content;
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  if (!overlay) return;
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = content;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function openImageModal(src) {
  openModal(`<img src="${src}" style="width:100%;border-radius:8px">`, 'صورة');
}

function openWriteReviewModal() {
  if (!App.user) { closeModal(); showLoginModal(); return; }
  openModal(`
    <div class="form-group">
      <label class="form-label">المنتج</label>
      <select class="form-select" id="review-product-id">
        <option value="">اختر منتجاً</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">${t('rating')}</label>
      <div style="display:flex;gap:8px;font-size:28px" id="star-rating">
        ${[1,2,3,4,5].map(i => `<span style="cursor:pointer;opacity:0.3" onclick="setStarRating(${i})" data-star="${i}">★</span>`).join('')}
      </div>
      <input type="hidden" id="review-rating" value="0">
    </div>
    <div class="form-group">
      <label class="form-label">التعليق</label>
      <textarea class="form-textarea" id="review-text" placeholder="اكتب تقييمك..."></textarea>
    </div>
    <button class="btn btn-primary btn-block" onclick="submitReview()">${t('send')}</button>
  `, t('write_review'));

  apiGet('/products?limit=50').then(d => {
    const sel = document.getElementById('review-product-id');
    if (sel) sel.innerHTML = '<option value="">اختر منتجاً</option>' + (d.products || []).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  });
}

function setStarRating(val) {
  document.getElementById('review-rating').value = val;
  document.querySelectorAll('#star-rating span').forEach((s, i) => {
    s.style.opacity = i < val ? '1' : '0.3';
    s.style.color = i < val ? '#F59E0B' : '';
  });
}

async function submitReview() {
  const product_id = document.getElementById('review-product-id')?.value;
  const rating = document.getElementById('review-rating')?.value;
  const review = document.getElementById('review-text')?.value;
  if (!product_id || !rating || rating === '0') { showToast('اختر المنتج والتقييم', 'warning'); return; }
  if (!review?.trim()) { showToast('اكتب تعليقك', 'warning'); return; }
  const data = await apiPost('/reviews', { product_id, rating, review });
  if (data.success) { closeModal(); showToast('تم إرسال تقييمك بنجاح!', 'success'); }
  else showToast(data.message, 'error');
}

function showForgotPassword() {
  openModal(`
    <p style="color:var(--text2);font-size:13px;margin-bottom:16px">أدخل بريدك الإلكتروني وسيتم إرسال كود التحقق</p>
    <div class="form-group">
      <label class="form-label">${t('email')}</label>
      <input class="form-input" id="forgot-email" type="email" placeholder="${t('email')}">
    </div>
    <button class="btn btn-primary btn-block" onclick="showToast('تم إرسال رابط الاستعادة على بريدك الإلكتروني','success');closeModal()">إرسال</button>
  `, t('forgot_password'));
}

function openProofUploadForOrder(orderId) {
  openModal(`
    <p style="color:var(--text2);font-size:13px;margin-bottom:16px">ارفع صورة إثبات الدفع لإتمام الطلب</p>
    <div class="upload-area" onclick="document.getElementById('proof-file-2').click()">
      <input type="file" id="proof-file-2" accept="image/*" style="display:none" onchange="previewProof2(this)">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 8px;opacity:0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <p style="font-size:13px;color:var(--text2)">اضغط لاختيار الصورة</p>
      <img id="proof-preview-2" style="display:none" class="upload-preview">
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="uploadProofForOrder(${orderId})">رفع الصورة</button>
  `, 'رفع إثبات الدفع');
}

function previewProof2(input) {
  const file = input.files[0];
  const preview = document.getElementById('proof-preview-2');
  if (!file || !preview) return;
  const reader = new FileReader();
  reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
  reader.readAsDataURL(file);
}

async function uploadProofForOrder(orderId) {
  const file = document.getElementById('proof-file-2')?.files[0];
  if (!file) { showToast('اختر صورة أولاً', 'warning'); return; }
  const formData = new FormData();
  formData.append('proof', file);
  const data = await apiFetch(`/orders/${orderId}/payment-proof`, { method: 'POST', body: formData });
  if (data.success) { closeModal(); showToast('تم رفع إثبات الدفع بنجاح', 'success'); }
  else showToast(data.message || 'حدث خطأ', 'error');
}

/* ============================================================
   Scroll to Top
   ============================================================ */
function setupScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   Bottom Navigation
   ============================================================ */
function setupBottomNav() {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ============================================================
   أحداث المنتجات
   ============================================================ */
function attachProductEvents() {
  /* لا حاجة لأحداث إضافية — كل شيء عبر onclick مباشرة */
}

/* ============================================================
   الإشعارات (Toast)
   ============================================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ============================================================
   مساعدات
   ============================================================ */
function t(key) { return App.t(key); }

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
}

function statusLabel(status) {
  const map = { pending: 'قيد المراجعة', processing: 'جاري التنفيذ', ready: 'جاهز', completed: 'مكتمل', rejected: 'مرفوض', cancelled: 'ملغي' };
  return map[status] || status;
}

function recordVisit() {
  apiPost('/visitor', {}).catch(() => {});
}

/* ============================================================
   API Helpers
   ============================================================ */
async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const headers = { ...options.headers };
  if (App.token) headers['Authorization'] = `Bearer ${App.token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body !== 'string') options.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(url, { ...options, headers });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'خطأ في الاتصال بالخادم' };
  }
}

const apiGet = (endpoint) => apiFetch(endpoint);
const apiPost = (endpoint, body) => apiFetch(endpoint, { method: 'POST', body });
const apiPut = (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body });
const apiDelete = (endpoint) => apiFetch(endpoint, { method: 'DELETE' });

/* ============================================================
   لوحة التحكم — Admin Panel
   ============================================================ */
function openAdminPanel() {
  const panel = document.getElementById('admin-panel');
  const loginPage = document.getElementById('admin-login-page');
  const adminToken = localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token');

  if (adminToken) {
    /* التحقق من صحة التوكن الإداري */
    fetch(API_BASE + '/auth/verify', { headers: { Authorization: `Bearer ${adminToken}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && ['admin', 'manager', 'employee'].includes(d.user.role)) {
          App.adminUser = d.user;
          App.adminToken = adminToken;
          loginPage?.classList.remove('active');
          panel?.classList.add('active');
          loadAdminDashboard();
        } else {
          loginPage?.classList.add('active');
        }
      }).catch(() => loginPage?.classList.add('active'));
  } else {
    loginPage?.classList.add('active');
  }
}

async function adminLogin() {
  const identifier = document.getElementById('admin-id')?.value?.trim();
  const password = document.getElementById('admin-password')?.value;
  const remember = document.getElementById('admin-remember')?.checked;

  if (!identifier || !password) { showToast('أدخل بيانات الدخول', 'warning'); return; }

  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { identifier, password, remember },
    headers: { 'Content-Type': 'application/json' }
  });

  if (data.success && ['admin', 'manager', 'employee'].includes(data.user.role)) {
    App.adminToken = data.token;
    App.adminUser = data.user;
    if (remember) localStorage.setItem('admin-token', data.token);
    else sessionStorage.setItem('admin-token', data.token);
    document.getElementById('admin-login-page')?.classList.remove('active');
    document.getElementById('admin-panel')?.classList.add('active');
    loadAdminDashboard();
    showToast(`أهلاً ${data.user.full_name}!`, 'success');
  } else {
    showToast(data.message || 'بيانات الدخول غير صحيحة أو لا تملك صلاحية إدارة', 'error');
    /* اهتزاز نموذج الدخول */
    document.querySelector('.admin-login-box')?.animate([
      { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }
    ], { duration: 300 });
  }
}

function closeAdminPanel() {
  document.getElementById('admin-panel')?.classList.remove('active');
  document.getElementById('admin-login-page')?.classList.remove('active');
}

function adminLogout() {
  App.adminToken = null;
  App.adminUser = null;
  localStorage.removeItem('admin-token');
  sessionStorage.removeItem('admin-token');
  closeAdminPanel();
  showToast('تم تسجيل الخروج من لوحة التحكم', 'info');
}

function adminNavTo(page) {
  document.querySelectorAll('.admin-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-page') === page);
  });
  document.querySelectorAll('.admin-page').forEach(el => el.classList.remove('active'));
  const pageEl = document.getElementById(`admin-page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  const titles = {
    dashboard: 'لوحة التحكم', products: 'المنتجات', categories: 'الأقسام',
    orders: 'الطلبات', customers: 'العملاء', reviews: 'التعليقات',
    notifications: 'الإشعارات', payments: 'طرق الدفع', coupons: 'الكوبونات',
    sliders: 'البنرات والسلايدر', analytics: 'التحليلات', logs: 'سجل النشاط',
    backup: 'النسخ الاحتياطية', settings: 'الإعدادات', messages: 'الرسائل', faq: 'الأسئلة الشائعة',
  };
  document.getElementById('admin-page-title').textContent = titles[page] || page;

  /* تحميل بيانات الصفحة */
  const loaders = {
    dashboard: loadAdminDashboard, products: loadAdminProducts, categories: loadAdminCategories,
    orders: loadAdminOrders, customers: loadAdminCustomers, reviews: loadAdminReviews,
    notifications: loadAdminNotifications, payments: loadAdminPayments, coupons: loadAdminCoupons,
    sliders: loadAdminSliders, analytics: loadAdminAnalytics, logs: loadAdminLogs,
    backup: loadAdminBackups, settings: loadAdminSettings, messages: loadAdminMessages, faq: loadAdminFAQ,
  };
  loaders[page]?.();

  /* إغلاق السايدبار في الموبايل */
  document.querySelector('.admin-sidebar')?.classList.remove('open');
}

/* ============================================================
   Dashboard — الإحصائيات
   ============================================================ */
async function loadAdminDashboard() {
  const el = document.getElementById('admin-page-dashboard');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/admin/dashboard');
  const s = data.stats || {};

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon orange"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg></div><div><div class="stat-value">${s.orders_today || 0}</div><div class="stat-label">طلبات اليوم</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-value">${formatPrice(s.revenue_today || 0)}</div><div class="stat-label">إيرادات اليوم</div></div></div>
      <div class="stat-card"><div class="stat-icon blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div><div class="stat-value">${s.customers_total || 0}</div><div class="stat-label">إجمالي العملاء</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div><div><div class="stat-value">${s.products_total || 0}</div><div class="stat-label">إجمالي المنتجات</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div><div class="stat-value">${s.pending_orders || 0}</div><div class="stat-label">طلبات معلقة</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="stat-value">${s.pending_reviews || 0}</div><div class="stat-label">تعليقات معلقة</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-value">${formatPrice(s.revenue_total || 0)}</div><div class="stat-label">إجمالي الإيرادات</div></div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:4px">
      <div class="admin-table-wrap">
        <div class="admin-table-header"><div class="admin-table-title">آخر الطلبات</div></div>
        <table class="admin-table">
          <thead><tr><th>رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th></tr></thead>
          <tbody>
            ${(s.recent_orders || []).map(o => `
              <tr>
                <td style="font-weight:600;color:var(--primary)">#${o.order_number}</td>
                <td>${o.full_name || '-'}</td>
                <td>${formatPrice(o.total)}</td>
                <td><span class="status-pill pill-${o.status}">${statusLabel(o.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header"><div class="admin-table-title">آخر العملاء</div></div>
        <table class="admin-table">
          <thead><tr><th>الاسم</th><th>الهاتف</th><th>التاريخ</th></tr></thead>
          <tbody>
            ${(s.recent_customers || []).map(c => `
              <tr>
                <td style="font-weight:600">${c.full_name}</td>
                <td style="direction:ltr">${c.phone || c.email || '-'}</td>
                <td style="font-size:11px">${formatDate(c.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================================
   إدارة المنتجات
   ============================================================ */
async function loadAdminProducts(page = 1, search = '') {
  const el = document.getElementById('admin-page-products');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const [data, catData] = await Promise.all([
    adminAPI(`/products?limit=20&page=${page}&search=${encodeURIComponent(search)}&status=all`),
    adminAPI('/categories')
  ]);

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">المنتجات (${data.total || 0})</div>
        <div class="admin-table-filters">
          <input class="admin-search" placeholder="بحث..." onkeyup="debounce(() => loadAdminProducts(1, this.value), 400)()">
          <button class="btn btn-primary btn-sm" onclick="showProductForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            إضافة منتج
          </button>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>الصورة</th><th>الاسم</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>الطلبات</th><th>الإجراءات</th></tr></thead>
          <tbody>
            ${(data.products || []).map(p => `
              <tr>
                <td><img src="${p.main_image || ''}" alt="" onerror="this.style.display='none'"></td>
                <td style="font-weight:600;max-width:180px">${p.name}</td>
                <td>${p.category_name || '-'}</td>
                <td style="color:var(--primary);font-weight:700">${formatPrice(p.price)}</td>
                <td><span class="status-pill pill-${p.status === 'available' ? 'active' : 'inactive'}">${p.status === 'available' ? 'متوفر' : p.status === 'out_of_stock' ? 'نفد' : 'غير متوفر'}</span></td>
                <td>${p.orders_count}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn" onclick="showProductForm(${p.id})" title="تعديل">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn danger" onclick="deleteProduct(${p.id}, '${p.name}')" title="حذف">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div id="product-form-section" style="margin-top:20px;display:none"></div>
  `;
}

async function showProductForm(id = null) {
  const catData = await adminAPI('/categories');
  const cats = catData.categories || [];
  let product = {};

  if (id) {
    const d = await adminAPI(`/products/${id}`);
    product = d.product || {};
  }

  const formSection = document.getElementById('product-form-section');
  if (!formSection) return;
  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth' });

  formSection.innerHTML = `
    <div class="admin-form">
      <div class="admin-form-title">${id ? 'تعديل منتج' : 'إضافة منتج جديد'}</div>
      <form id="product-form" onsubmit="saveProduct(event, ${id || 'null'})">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">اسم المنتج (عربي)</label>
            <input class="form-input" name="name" value="${product.name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">اسم المنتج (إنجليزي)</label>
            <input class="form-input" name="name_en" value="${product.name_en || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">القسم</label>
          <select class="form-select" name="category_id">
            <option value="">اختر قسم</option>
            ${cats.map(c => `<option value="${c.id}" ${product.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف المختصر</label>
          <textarea class="form-textarea" name="short_description" style="min-height:70px">${product.short_description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف الكامل</label>
          <textarea class="form-textarea" name="full_description">${product.full_description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">السعر</label>
            <input class="form-input" name="price" type="number" step="0.01" value="${product.price || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">السعر قبل الخصم</label>
            <input class="form-input" name="old_price" type="number" step="0.01" value="${product.old_price || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الكمية</label>
            <input class="form-input" name="quantity" type="number" value="${product.quantity || 100}">
          </div>
          <div class="form-group">
            <label class="form-label">الترتيب</label>
            <input class="form-input" name="sort_order" type="number" value="${product.sort_order || 0}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">الحالة</label>
          <select class="form-select" name="status">
            <option value="available" ${product.status === 'available' ? 'selected' : ''}>متوفر</option>
            <option value="unavailable" ${product.status === 'unavailable' ? 'selected' : ''}>غير متوفر</option>
            <option value="out_of_stock" ${product.status === 'out_of_stock' ? 'selected' : ''}>نفد المخزون</option>
            <option value="hidden" ${product.status === 'hidden' ? 'selected' : ''}>مخفي</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الصورة الرئيسية</label>
          <input class="form-input" name="main_image" placeholder="رابط الصورة" value="${product.main_image || ''}">
          <input type="file" name="main_image_file" accept="image/*" style="margin-top:8px;width:100%">
        </div>
        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn-primary">${id ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
          <button type="button" class="btn btn-outline" onclick="document.getElementById('product-form-section').style.display='none'">إلغاء</button>
        </div>
      </form>
    </div>
  `;
}

async function saveProduct(e, id) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  if (formData.get('main_image_file')?.size === 0) formData.delete('main_image_file');

  const url = id ? `/products/${id}` : '/products';
  const method = id ? 'PUT' : 'POST';
  const data = await adminAPIFormData(url, formData, method);

  if (data.success) {
    showToast(id ? 'تم تحديث المنتج' : 'تم إضافة المنتج', 'success');
    loadAdminProducts();
    document.getElementById('product-form-section').style.display = 'none';
  } else {
    showToast(data.message || 'حدث خطأ', 'error');
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`هل تريد حذف "${name}"؟`)) return;
  const data = await adminAPI(`/products/${id}`, 'DELETE');
  if (data.success) { showToast('تم حذف المنتج', 'success'); loadAdminProducts(); }
  else showToast(data.message, 'error');
}

/* ============================================================
   إدارة الأقسام
   ============================================================ */
async function loadAdminCategories() {
  const el = document.getElementById('admin-page-categories');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/categories?status=all');

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">الأقسام</div>
        <button class="btn btn-primary btn-sm" onclick="showCategoryForm()">إضافة قسم</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>الصورة</th><th>الاسم</th><th>المنتجات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          ${(data.categories || []).map(c => `
            <tr>
              <td><img src="${c.image || ''}" onerror="this.style.display='none'"></td>
              <td style="font-weight:600">${c.name}</td>
              <td>${c.products_count || 0}</td>
              <td><span class="status-pill ${c.status === 'active' ? 'pill-active' : 'pill-inactive'}">${c.status === 'active' ? 'نشط' : 'مخفي'}</span></td>
              <td><div class="action-btns">
                <button class="action-btn" onclick="showCategoryForm(${c.id})">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn danger" onclick="deleteCategory(${c.id}, '${c.name}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div id="category-form-section" style="margin-top:20px;display:none"></div>
  `;
}

function showCategoryForm(id = null) {
  const el = document.getElementById('category-form-section');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="admin-form">
      <div class="admin-form-title">${id ? 'تعديل قسم' : 'إضافة قسم'}</div>
      <form onsubmit="saveCategory(event, ${id || 'null'})">
        <div class="form-group"><label class="form-label">الاسم (عربي)</label><input class="form-input" name="name" required></div>
        <div class="form-group"><label class="form-label">الاسم (إنجليزي)</label><input class="form-input" name="name_en"></div>
        <div class="form-group"><label class="form-label">الصورة (رابط)</label><input class="form-input" name="image" placeholder="https://..."></div>
        <div class="form-group"><label class="form-label">الوصف</label><textarea class="form-textarea" name="description" style="min-height:70px"></textarea></div>
        <div class="form-group"><label class="form-label">الترتيب</label><input class="form-input" name="sort_order" type="number" value="0"></div>
        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn-primary">${id ? 'حفظ' : 'إضافة'}</button>
          <button type="button" class="btn btn-outline" onclick="document.getElementById('category-form-section').style.display='none'">إلغاء</button>
        </div>
      </form>
    </div>
  `;
}

async function saveCategory(e, id) {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  const url = id ? `/categories/${id}` : '/categories';
  const method = id ? 'PUT' : 'POST';
  const data = await adminAPI(url, method, body);
  if (data.success) { showToast('تم حفظ القسم', 'success'); loadAdminCategories(); document.getElementById('category-form-section').style.display = 'none'; }
  else showToast(data.message, 'error');
}

async function deleteCategory(id, name) {
  if (!confirm(`حذف "${name}"؟`)) return;
  const data = await adminAPI(`/categories/${id}`, 'DELETE');
  if (data.success) { showToast('تم الحذف', 'success'); loadAdminCategories(); }
}

/* ============================================================
   إدارة الطلبات
   ============================================================ */
async function loadAdminOrders(status = 'all', page = 1) {
  const el = document.getElementById('admin-page-orders');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI(`/admin/orders?status=${status}&page=${page}&limit=20`);

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">الطلبات (${data.total || 0})</div>
        <div class="admin-table-filters">
          <select class="form-select" style="width:auto;padding:8px 14px" onchange="loadAdminOrders(this.value)">
            <option value="all">الكل</option>
            <option value="pending">معلقة</option>
            <option value="processing">قيد التنفيذ</option>
            <option value="ready">جاهزة</option>
            <option value="completed">مكتملة</option>
            <option value="rejected">مرفوضة</option>
            <option value="cancelled">ملغية</option>
          </select>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>الرقم</th><th>العميل</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>إثبات الدفع</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
          <tbody>
            ${(data.orders || []).map(o => `
              <tr>
                <td style="font-weight:700;color:var(--primary)">#${o.order_number}</td>
                <td>${o.customer_name || '-'}<br><span style="font-size:11px;color:var(--text3)">${o.customer_phone || ''}</span></td>
                <td style="font-weight:700">${formatPrice(o.total)}</td>
                <td style="font-size:12px">${o.payment_method_name || '-'}</td>
                <td><span class="status-pill pill-${o.status}">${statusLabel(o.status)}</span></td>
                <td>
                  ${o.payment_proof ? `<a href="${o.payment_proof}" target="_blank" class="btn btn-outline btn-sm">عرض</a>` : '<span style="color:var(--text3);font-size:12px">لم يرفع</span>'}
                </td>
                <td style="font-size:11px">${formatDate(o.created_at)}</td>
                <td>
                  <select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onchange="updateOrderStatus(${o.id}, this.value)">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>معلق</option>
                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>قيد التنفيذ</option>
                    <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>جاهز</option>
                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                    <option value="rejected" ${o.status === 'rejected' ? 'selected' : ''}>مرفوض</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateOrderStatus(id, status) {
  const data = await adminAPI(`/admin/orders/${id}`, 'PUT', { status });
  if (data.success) showToast('تم تحديث الحالة', 'success');
  else showToast(data.message, 'error');
}

/* ============================================================
   إدارة العملاء
   ============================================================ */
async function loadAdminCustomers() {
  const el = document.getElementById('admin-page-customers');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/admin/customers?limit=30');

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">العملاء (${data.total || 0})</div>
        <input class="admin-search" placeholder="بحث..." onkeyup="searchCustomers(this.value)">
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>الاسم</th><th>التواصل</th><th>الطلبات</th><th>النقاط</th><th>المستوى</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
          <tbody>
            ${(data.customers || []).map(c => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px">${c.full_name[0]}</div>
                    <span style="font-weight:600">${c.full_name}</span>
                  </div>
                </td>
                <td style="font-size:12px">${c.email || ''}<br>${c.phone || ''}</td>
                <td>${c.orders_count}</td>
                <td style="color:var(--primary);font-weight:700">${c.points}</td>
                <td>${loyaltyLabel(c.loyalty_level)}</td>
                <td><span class="status-pill ${c.status === 'active' ? 'pill-active' : 'pill-rejected'}">${c.status === 'active' ? 'نشط' : 'محظور'}</span></td>
                <td>
                  <button class="action-btn ${c.status === 'active' ? 'danger' : 'success'}"
                    onclick="toggleCustomerStatus(${c.id}, '${c.status}', ${c.points})"
                    title="${c.status === 'active' ? 'حظر' : 'تفعيل'}">
                    ${c.status === 'active' ? '🚫' : '✅'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function toggleCustomerStatus(id, currentStatus, points) {
  const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
  const data = await adminAPI(`/admin/customers/${id}`, 'PUT', { status: newStatus, points });
  if (data.success) { showToast(newStatus === 'blocked' ? 'تم حظر العميل' : 'تم تفعيل العميل', 'success'); loadAdminCustomers(); }
}

async function searchCustomers(q) {
  const data = await adminAPI(`/admin/customers?search=${encodeURIComponent(q)}`);
  /* تحديث الجدول فقط */
}

/* ============================================================
   إدارة التعليقات
   ============================================================ */
async function loadAdminReviews(status = 'pending') {
  const el = document.getElementById('admin-page-reviews');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI(`/admin/reviews?status=${status}&limit=30`);

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">التعليقات</div>
        <select class="form-select" style="width:auto;padding:8px 14px" onchange="loadAdminReviews(this.value)">
          <option value="pending">معلقة</option>
          <option value="approved">مقبولة</option>
          <option value="rejected">مرفوضة</option>
          <option value="all">الكل</option>
        </select>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>العميل</th><th>المنتج</th><th>التقييم</th><th>التعليق</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
          <tbody>
            ${(data.reviews || []).map(r => `
              <tr>
                <td style="font-weight:600">${r.customer_name}</td>
                <td style="font-size:12px">${r.product_name || '-'}</td>
                <td style="color:#F59E0B">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
                <td style="max-width:200px;font-size:13px">${r.review}</td>
                <td><span class="status-pill pill-${r.status}">${r.status === 'pending' ? 'معلق' : r.status === 'approved' ? 'مقبول' : 'مرفوض'}</span></td>
                <td>
                  <div class="action-btns">
                    ${r.status !== 'approved' ? `<button class="action-btn success" onclick="updateReview(${r.id}, 'approved')">✓</button>` : ''}
                    ${r.status !== 'rejected' ? `<button class="action-btn danger" onclick="updateReview(${r.id}, 'rejected')">✗</button>` : ''}
                    <button class="action-btn danger" onclick="deleteReview(${r.id})">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateReview(id, status) {
  const data = await adminAPI(`/admin/reviews/${id}`, 'PUT', { status });
  if (data.success) { showToast('تم تحديث التعليق', 'success'); loadAdminReviews(); }
}

async function deleteReview(id) {
  if (!confirm('حذف التعليق؟')) return;
  const data = await adminAPI(`/admin/reviews/${id}`, 'DELETE');
  if (data.success) { showToast('تم الحذف', 'success'); loadAdminReviews(); }
}

/* ============================================================
   إدارة الإشعارات
   ============================================================ */
async function loadAdminNotifications() {
  const el = document.getElementById('admin-page-notifications');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/admin/notifications');

  el.innerHTML = `
    <div class="admin-form" style="max-width:100%;margin-bottom:20px">
      <div class="admin-form-title">إرسال إشعار جديد</div>
      <div class="form-group"><label class="form-label">العنوان</label><input class="form-input" id="notif-title" placeholder="عنوان الإشعار"></div>
      <div class="form-group"><label class="form-label">الوصف</label><textarea class="form-textarea" id="notif-desc" style="min-height:80px" placeholder="محتوى الإشعار"></textarea></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">الهدف</label>
          <select class="form-select" id="notif-target">
            <option value="all">جميع المستخدمين</option>
            <option value="user">مستخدم محدد</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">النوع</label>
          <select class="form-select" id="notif-type">
            <option value="text">نص فقط</option>
            <option value="text_image">نص وصورة</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" onclick="sendNotification()">إرسال الإشعار</button>
    </div>

    <div class="admin-table-wrap">
      <div class="admin-table-header"><div class="admin-table-title">الإشعارات السابقة</div></div>
      <table class="admin-table">
        <thead><tr><th>العنوان</th><th>الوصف</th><th>الهدف</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
        <tbody>
          ${(data.notifications || []).map(n => `
            <tr>
              <td style="font-weight:600">${n.title}</td>
              <td style="font-size:12px;max-width:200px">${n.description || '-'}</td>
              <td>${n.target === 'all' ? 'الكل' : 'مستخدم محدد'}</td>
              <td style="font-size:11px">${formatDate(n.created_at)}</td>
              <td><button class="action-btn danger" onclick="deleteNotification(${n.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function sendNotification() {
  const data = await adminAPI('/admin/notifications', 'POST', {
    title: document.getElementById('notif-title')?.value,
    description: document.getElementById('notif-desc')?.value,
    target: document.getElementById('notif-target')?.value,
    type: document.getElementById('notif-type')?.value,
  });
  if (data.success) { showToast('تم إرسال الإشعار', 'success'); loadAdminNotifications(); }
  else showToast(data.message, 'error');
}

async function deleteNotification(id) {
  await adminAPI(`/admin/notifications/${id}`, 'DELETE');
  loadAdminNotifications();
}

/* ============================================================
   طرق الدفع - ADMIN
   ============================================================ */
async function loadAdminPayments() {
  const el = document.getElementById('admin-page-payments');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/admin/payment-methods');

  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header">
        <div class="admin-table-title">طرق الدفع</div>
        <button class="btn btn-primary btn-sm" onclick="showPaymentForm()">إضافة طريقة</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>الاسم</th><th>صاحب الحساب</th><th>رقم الحساب</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          ${(data.methods || []).map(pm => `
            <tr>
              <td style="font-weight:600">${pm.name}</td>
              <td>${pm.account_name || '-'}</td>
              <td style="direction:ltr;font-weight:600;color:var(--primary)">${pm.account_number || '-'}</td>
              <td><span class="status-pill ${pm.status === 'active' ? 'pill-active' : 'pill-inactive'}">${pm.status === 'active' ? 'مفعل' : 'معطل'}</span></td>
              <td><div class="action-btns">
                <button class="action-btn" onclick="togglePaymentStatus(${pm.id}, '${pm.status}', ${JSON.stringify(pm).replace(/"/g, '&quot;')})">⚡</button>
                <button class="action-btn danger" onclick="deletePaymentMethod(${pm.id})">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div id="payment-form-section" style="display:none;margin-top:20px">
      <div class="admin-form">
        <div class="admin-form-title">إضافة طريقة دفع</div>
        <div class="form-group"><label class="form-label">الاسم</label><input class="form-input" id="pm-name"></div>
        <div class="form-group"><label class="form-label">وصف</label><input class="form-input" id="pm-desc"></div>
        <div class="form-group"><label class="form-label">صاحب الحساب</label><input class="form-input" id="pm-account-name"></div>
        <div class="form-group"><label class="form-label">رقم الحساب</label><input class="form-input" id="pm-account-number"></div>
        <div class="form-group"><label class="form-label">التعليمات</label><textarea class="form-textarea" id="pm-instructions"></textarea></div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" onclick="savePaymentMethod()">إضافة</button>
          <button class="btn btn-outline" onclick="document.getElementById('payment-form-section').style.display='none'">إلغاء</button>
        </div>
      </div>
    </div>
  `;
}

function showPaymentForm() {
  const el = document.getElementById('payment-form-section');
  if (el) el.style.display = 'block';
}

async function savePaymentMethod() {
  const data = await adminAPI('/admin/payment-methods', 'POST', {
    name: document.getElementById('pm-name')?.value,
    description: document.getElementById('pm-desc')?.value,
    account_name: document.getElementById('pm-account-name')?.value,
    account_number: document.getElementById('pm-account-number')?.value,
    instructions: document.getElementById('pm-instructions')?.value,
  });
  if (data.success) { showToast('تم إضافة طريقة الدفع', 'success'); loadAdminPayments(); }
}

async function togglePaymentStatus(id, status) {
  const newStatus = status === 'active' ? 'inactive' : 'active';
  await adminAPI(`/admin/payment-methods/${id}`, 'PUT', { status: newStatus });
  loadAdminPayments();
}

async function deletePaymentMethod(id) {
  if (!confirm('حذف طريقة الدفع؟')) return;
  await adminAPI(`/admin/payment-methods/${id}`, 'DELETE');
  loadAdminPayments();
}

/* ============================================================
   الكوبونات - ADMIN
   ============================================================ */
async function loadAdminCoupons() {
  const el = document.getElementById('admin-page-coupons');
  if (!el) return;
  const data = await adminAPI('/admin/coupons');
  el.innerHTML = `
    <div class="admin-form" style="max-width:100%;margin-bottom:20px">
      <div class="admin-form-title">إضافة كوبون</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">كود الكوبون</label><input class="form-input" id="cp-code" placeholder="WELCOME20"></div>
        <div class="form-group"><label class="form-label">النوع</label><select class="form-select" id="cp-type"><option value="percentage">نسبة %</option><option value="fixed">مبلغ ثابت</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">القيمة</label><input class="form-input" id="cp-value" type="number"></div>
        <div class="form-group"><label class="form-label">الحد الأدنى للطلب</label><input class="form-input" id="cp-min" type="number" value="0"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">حد الاستخدام</label><input class="form-input" id="cp-limit" type="number" value="0" placeholder="0 = غير محدود"></div>
        <div class="form-group"><label class="form-label">تاريخ الانتهاء</label><input class="form-input" id="cp-end" type="date"></div>
      </div>
      <button class="btn btn-primary" onclick="saveCoupon()">إضافة الكوبون</button>
    </div>
    <div class="admin-table-wrap">
      <div class="admin-table-header"><div class="admin-table-title">الكوبونات</div></div>
      <table class="admin-table">
        <thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>المستخدم</th><th>الانتهاء</th><th>الحالة</th><th>حذف</th></tr></thead>
        <tbody>
          ${(data.coupons || []).map(c => `
            <tr>
              <td style="font-weight:700;color:var(--primary);direction:ltr">${c.code}</td>
              <td>${c.type === 'percentage' ? 'نسبة' : 'ثابت'}</td>
              <td>${c.type === 'percentage' ? c.value + '%' : formatPrice(c.value)}</td>
              <td>${c.used_count}/${c.usage_limit || '∞'}</td>
              <td style="font-size:12px">${c.end_date || 'بدون تاريخ'}</td>
              <td><span class="status-pill ${c.status === 'active' ? 'pill-active' : 'pill-inactive'}">${c.status === 'active' ? 'نشط' : 'معطل'}</span></td>
              <td><button class="action-btn danger" onclick="deleteCoupon(${c.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function saveCoupon() {
  const data = await adminAPI('/admin/coupons', 'POST', {
    code: document.getElementById('cp-code')?.value?.toUpperCase(),
    type: document.getElementById('cp-type')?.value,
    value: document.getElementById('cp-value')?.value,
    minimum_order: document.getElementById('cp-min')?.value || 0,
    usage_limit: document.getElementById('cp-limit')?.value || 0,
    end_date: document.getElementById('cp-end')?.value || null,
  });
  if (data.success) { showToast('تم إضافة الكوبون', 'success'); loadAdminCoupons(); }
  else showToast(data.message, 'error');
}

async function deleteCoupon(id) {
  await adminAPI(`/admin/coupons/${id}`, 'DELETE');
  loadAdminCoupons();
}

/* ============================================================
   البنرات
   ============================================================ */
async function loadAdminSliders() {
  const el = document.getElementById('admin-page-sliders');
  if (!el) return;
  const data = await adminAPI('/sliders');
  el.innerHTML = `
    <div class="admin-form" style="max-width:100%;margin-bottom:20px">
      <div class="admin-form-title">إضافة بنر</div>
      <div class="form-group"><label class="form-label">العنوان</label><input class="form-input" id="sl-title"></div>
      <div class="form-group"><label class="form-label">الوصف</label><input class="form-input" id="sl-desc"></div>
      <div class="form-group"><label class="form-label">رابط الصورة</label><input class="form-input" id="sl-image" placeholder="https://..."></div>
      <div class="form-group"><label class="form-label">نص الزر</label><input class="form-input" id="sl-btn"></div>
      <div class="form-group"><label class="form-label">رابط الزر</label><input class="form-input" id="sl-url" placeholder="/products"></div>
      <button class="btn btn-primary" onclick="saveSlider()">إضافة</button>
    </div>
    <div class="products-grid" style="margin-top:4px">
      ${(data.sliders || []).map(s => `
        <div class="product-card">
          <div class="product-img-wrap"><img src="${s.image}" alt="${s.title}" style="height:160px;object-fit:cover"></div>
          <div class="product-info">
            <div class="product-name">${s.title || 'بنر'}</div>
            <div class="product-footer">
              <span class="status-pill ${s.status === 'active' ? 'pill-active' : 'pill-inactive'}">${s.status === 'active' ? 'نشط' : 'مخفي'}</span>
              <button class="action-btn danger" onclick="deleteSlider(${s.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function saveSlider() {
  const data = await adminAPI('/sliders', 'POST', {
    title: document.getElementById('sl-title')?.value,
    description: document.getElementById('sl-desc')?.value,
    image: document.getElementById('sl-image')?.value,
    button_text: document.getElementById('sl-btn')?.value,
    button_url: document.getElementById('sl-url')?.value,
  });
  if (data.success) { showToast('تم إضافة البنر', 'success'); loadAdminSliders(); }
}

async function deleteSlider(id) {
  await adminAPI(`/sliders/${id}`, 'DELETE');
  loadAdminSliders();
}

/* ============================================================
   التحليلات
   ============================================================ */
async function loadAdminAnalytics() {
  const el = document.getElementById('admin-page-analytics');
  if (!el) return;
  el.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div></div>';
  const data = await adminAPI('/admin/analytics');
  const a = data.analytics || {};

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon orange">📊</div><div><div class="stat-value">${a.today?.orders || 0}</div><div class="stat-label">طلبات اليوم</div></div></div>
      <div class="stat-card"><div class="stat-icon green">💰</div><div><div class="stat-value">${formatPrice(a.today?.revenue || 0)}</div><div class="stat-label">إيرادات اليوم</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">📅</div><div><div class="stat-value">${a.month?.orders || 0}</div><div class="stat-label">طلبات الشهر</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow">💵</div><div><div class="stat-value">${formatPrice(a.month?.revenue || 0)}</div><div class="stat-label">إيرادات الشهر</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">👥</div><div><div class="stat-value">${a.customers || 0}</div><div class="stat-label">إجمالي العملاء</div></div></div>
      <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">${formatPrice(a.total?.revenue || 0)}</div><div class="stat-label">إجمالي الإيرادات</div></div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px">
      <div class="admin-table-wrap">
        <div class="admin-table-header"><div class="admin-table-title">أكثر المنتجات مبيعاً</div></div>
        <table class="admin-table">
          <thead><tr><th>المنتج</th><th>المبيعات</th><th>الإيرادات</th></tr></thead>
          <tbody>
            ${(a.top_products || []).map(p => `
              <tr>
                <td style="font-weight:600">${p.name}</td>
                <td>${p.total_sold}</td>
                <td style="color:var(--primary)">${formatPrice(p.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header"><div class="admin-table-title">المبيعات الأخيرة (7 أيام)</div></div>
        <div class="admin-content" style="padding:16px">
          <div class="chart-bar-wrap">
            ${(a.sales_by_day || []).map(d => `
              <div class="chart-bar-item">
                <div class="chart-bar-val">${formatPrice(d.revenue).split(' ')[0]}</div>
                <div class="chart-bar" style="height:${Math.max(4, (d.revenue / Math.max(...(a.sales_by_day || [{}]).map(x => x.revenue || 1), 1)) * 80)}px"></div>
                <div class="chart-bar-label">${d.day?.split('-').slice(1).join('/')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   سجل النشاط
   ============================================================ */
async function loadAdminLogs() {
  const el = document.getElementById('admin-page-logs');
  if (!el) return;
  const data = await adminAPI('/admin/activity-logs');
  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header"><div class="admin-table-title">سجل النشاط</div></div>
      <table class="admin-table">
        <thead><tr><th>المستخدم</th><th>العملية</th><th>التفاصيل</th><th>IP</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${(data.logs || []).map(l => `
            <tr>
              <td style="font-weight:600">${l.full_name || 'نظام'}</td>
              <td><span class="status-pill pill-active">${l.action}</span></td>
              <td style="font-size:12px;max-width:200px">${l.description || '-'}</td>
              <td style="direction:ltr;font-size:11px">${l.ip_address || '-'}</td>
              <td style="font-size:11px">${formatDate(l.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ============================================================
   النسخ الاحتياطية
   ============================================================ */
async function loadAdminBackups() {
  const el = document.getElementById('admin-page-backup');
  if (!el) return;
  const data = await adminAPI('/admin/backups');
  el.innerHTML = `
    <div class="admin-form" style="max-width:100%;margin-bottom:20px">
      <div class="admin-form-title">النسخ الاحتياطية</div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:16px">إنشاء نسخة احتياطية من قاعدة البيانات بضغطة واحدة</p>
      <button class="btn btn-primary" onclick="createBackup()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        إنشاء نسخة احتياطية الآن
      </button>
    </div>
    <div class="admin-table-wrap">
      <div class="admin-table-header"><div class="admin-table-title">النسخ المحفوظة</div></div>
      <table class="admin-table">
        <thead><tr><th>اسم الملف</th><th>الحجم</th><th>التاريخ</th><th>حذف</th></tr></thead>
        <tbody>
          ${(data.backups || []).map(b => `
            <tr>
              <td style="font-weight:600;direction:ltr">${b.name}</td>
              <td>${b.size}</td>
              <td style="font-size:11px">${formatDate(b.created_at)}</td>
              <td><button class="action-btn danger" onclick="deleteBackup('${b.name}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function createBackup() {
  const data = await adminAPI('/admin/backups', 'POST', {});
  if (data.success) { showToast('تم إنشاء النسخة الاحتياطية', 'success'); loadAdminBackups(); }
}

async function deleteBackup(name) {
  if (!confirm('حذف النسخة الاحتياطية؟')) return;
  await adminAPI(`/admin/backups/${name}`, 'DELETE');
  loadAdminBackups();
}

/* ============================================================
   الإعدادات
   ============================================================ */
async function loadAdminSettings() {
  const el = document.getElementById('admin-page-settings');
  if (!el) return;
  const data = await adminAPI('/settings');
  const s = data.settings || {};

  el.innerHTML = `
    <div class="settings-tabs">
      <div class="settings-tab active" onclick="switchSettingsTab('general', this)">الإعدادات العامة</div>
      <div class="settings-tab" onclick="switchSettingsTab('contact', this)">التواصل</div>
      <div class="settings-tab" onclick="switchSettingsTab('social', this)">التواصل الاجتماعي</div>
      <div class="settings-tab" onclick="switchSettingsTab('store', this)">إعدادات المتجر</div>
      <div class="settings-tab" onclick="switchSettingsTab('points', this)">النقاط</div>
      <div class="settings-tab" onclick="switchSettingsTab('security', this)">الأمان</div>
    </div>

    <div id="settings-general" class="admin-form" style="max-width:100%">
      <div class="admin-form-title">الإعدادات العامة</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">اسم المتجر (عربي)</label><input class="form-input" name="store_name" value="${s.store_name || ''}"></div>
        <div class="form-group"><label class="form-label">اسم المتجر (إنجليزي)</label><input class="form-input" name="store_name_en" value="${s.store_name_en || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">وصف المتجر</label><textarea class="form-textarea" name="store_description">${s.store_description || ''}</textarea></div>
      <div class="form-group"><label class="form-label">رابط الشعار</label><input class="form-input" name="store_logo" value="${s.store_logo || ''}"></div>
      <button class="btn btn-primary" onclick="saveSettings('general')">حفظ الإعدادات</button>
    </div>

    <div id="settings-contact" class="admin-form" style="max-width:100%;display:none">
      <div class="admin-form-title">بيانات التواصل</div>
      <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input class="form-input" name="email" value="${s.email || ''}"></div>
      <div class="form-group"><label class="form-label">رقم الهاتف</label><input class="form-input" name="phone" value="${s.phone || ''}"></div>
      <div class="form-group"><label class="form-label">رقم واتساب</label><input class="form-input" name="whatsapp" value="${s.whatsapp || ''}"></div>
      <div class="form-group"><label class="form-label">العنوان</label><input class="form-input" name="address" value="${s.address || ''}"></div>
      <button class="btn btn-primary" onclick="saveSettings('contact')">حفظ</button>
    </div>

    <div id="settings-social" class="admin-form" style="max-width:100%;display:none">
      <div class="admin-form-title">التواصل الاجتماعي</div>
      <div class="form-group"><label class="form-label">فيسبوك</label><input class="form-input" name="facebook" value="${s.facebook || ''}"></div>
      <div class="form-group"><label class="form-label">إنستجرام</label><input class="form-input" name="instagram" value="${s.instagram || ''}"></div>
      <div class="form-group"><label class="form-label">تيليجرام</label><input class="form-input" name="telegram" value="${s.telegram || ''}"></div>
      <div class="form-group"><label class="form-label">تيك توك</label><input class="form-input" name="tiktok" value="${s.tiktok || ''}"></div>
      <button class="btn btn-primary" onclick="saveSettings('social')">حفظ</button>
    </div>

    <div id="settings-store" class="admin-form" style="max-width:100%;display:none">
      <div class="admin-form-title">إعدادات المتجر</div>
      <div class="form-group"><label class="form-label">وضع الصيانة</label>
        <div style="display:flex;gap:10px">
          <button class="btn ${s.maintenance_mode === '1' ? 'btn-primary' : 'btn-outline'}" onclick="toggleMaintenance(true)">تفعيل الصيانة</button>
          <button class="btn ${s.maintenance_mode !== '1' ? 'btn-primary' : 'btn-outline'}" onclick="toggleMaintenance(false)">إيقاف الصيانة</button>
        </div>
      </div>
      <div class="form-group"><label class="form-label">الحد الأدنى للطلب (ج.م)</label><input class="form-input" name="min_order" type="number" value="${s.min_order || 50}"></div>
      <div class="form-group"><label class="form-label">ساعات العمل</label><input class="form-input" name="working_hours" value="${s.working_hours || ''}"></div>
      <button class="btn btn-primary" onclick="saveSettings('store')">حفظ</button>
    </div>

    <div id="settings-points" class="admin-form" style="max-width:100%;display:none">
      <div class="admin-form-title">إعدادات النقاط</div>
      <div class="form-group"><label class="form-label">نقاط لكل 100 ج.م</label><input class="form-input" name="points_per_100" type="number" value="${s.points_per_100 || 10}"></div>
      <div class="form-group"><label class="form-label">قيمة النقطة (ج.م)</label><input class="form-input" name="points_value" type="number" step="0.01" value="${s.points_value || 1}"></div>
      <button class="btn btn-primary" onclick="saveSettings('points')">حفظ</button>
    </div>

    <div id="settings-security" class="admin-form" style="max-width:100%;display:none">
      <div class="admin-form-title">إعدادات الأمان</div>
      <div class="form-group"><label class="form-label">تغيير كلمة مرور الأدمن</label>
        <input class="form-input" id="admin-new-pass" type="password" placeholder="كلمة المرور الجديدة" style="margin-bottom:8px">
        <button class="btn btn-primary btn-sm" onclick="changeAdminPassword()">تغيير كلمة المرور</button>
      </div>
    </div>
  `;
}

function switchSettingsTab(tab, el) {
  ['general', 'contact', 'social', 'store', 'points', 'security'].forEach(t => {
    const tabEl = document.getElementById(`settings-${t}`);
    if (tabEl) tabEl.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

async function saveSettings(section) {
  const sectionEl = document.getElementById(`settings-${section}`);
  if (!sectionEl) return;
  const inputs = sectionEl.querySelectorAll('[name]');
  const body = {};
  inputs.forEach(inp => { if (inp.name) body[inp.name] = inp.value; });
  const data = await adminAPI('/admin/settings', 'PUT', body);
  if (data.success) { showToast('تم حفظ الإعدادات', 'success'); await loadSettings(); }
  else showToast(data.message, 'error');
}

async function toggleMaintenance(enable) {
  await adminAPI('/admin/settings', 'PUT', { maintenance_mode: enable ? '1' : '0' });
  showToast(enable ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف الصيانة', enable ? 'warning' : 'success');
  loadAdminSettings();
}

async function changeAdminPassword() {
  const newPass = document.getElementById('admin-new-pass')?.value;
  if (!newPass || newPass.length < 8) { showToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'warning'); return; }
  const data = await apiPut('/auth/change-password', { current_password: 'SmartMenu@2026', new_password: newPass });
  if (data.success) showToast('تم تغيير كلمة المرور', 'success');
  else showToast(data.message, 'error');
}

/* ============================================================
   الرسائل وFAQ - ADMIN
   ============================================================ */
async function loadAdminMessages() {
  const el = document.getElementById('admin-page-messages');
  if (!el) return;
  const data = await adminAPI('/admin/messages');
  el.innerHTML = `
    <div class="admin-table-wrap">
      <div class="admin-table-header"><div class="admin-table-title">الرسائل</div></div>
      <table class="admin-table">
        <thead><tr><th>المرسل</th><th>المستقبل</th><th>الرسالة</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${(data.messages || []).map(m => `
            <tr>
              <td style="font-weight:600">${m.sender_name}</td>
              <td>${m.receiver_name}</td>
              <td style="max-width:250px;font-size:13px">${m.message}</td>
              <td style="font-size:11px">${formatDate(m.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadAdminFAQ() {
  const el = document.getElementById('admin-page-faq');
  if (!el) return;
  const data = await apiGet('/faq');
  el.innerHTML = `
    <div class="admin-form" style="max-width:100%;margin-bottom:20px">
      <div class="admin-form-title">إضافة سؤال</div>
      <div class="form-group"><label class="form-label">السؤال (عربي)</label><input class="form-input" id="faq-q"></div>
      <div class="form-group"><label class="form-label">الإجابة</label><textarea class="form-textarea" id="faq-a"></textarea></div>
      <div class="form-group"><label class="form-label">التصنيف</label>
        <select class="form-select" id="faq-cat">
          <option value="orders">الطلبات</option>
          <option value="payment">الدفع</option>
          <option value="support">الدعم</option>
          <option value="general">عام</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="saveFAQ()">إضافة</button>
    </div>
    <div class="faq-list">
      ${(data.faq || []).map((item, i) => `
        <div class="faq-item">
          <div class="faq-q">
            <span>${item.question}</span>
            <button class="action-btn danger" onclick="deleteFAQ(${item.id})" style="margin-right:auto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
          </div>
          <div class="faq-a" style="max-height:none;padding:0 20px 16px">${item.answer}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function saveFAQ() {
  const data = await adminAPI('/admin/faq', 'POST', {
    question: document.getElementById('faq-q')?.value,
    answer: document.getElementById('faq-a')?.value,
    category: document.getElementById('faq-cat')?.value,
  });
  if (data.success) { showToast('تم إضافة السؤال', 'success'); loadAdminFAQ(); }
}

async function deleteFAQ(id) {
  await adminAPI(`/admin/faq/${id}`, 'DELETE');
  loadAdminFAQ();
}

/* ============================================================
   Admin API Helpers
   ============================================================ */
async function adminAPI(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (App.adminToken) headers['Authorization'] = `Bearer ${App.adminToken}`;
  const options = { method, headers };
  if (body && method !== 'GET') options.body = JSON.stringify(body);
  try {
    const res = await fetch(API_BASE + endpoint, options);
    return await res.json();
  } catch (e) {
    return { success: false, message: 'خطأ في الاتصال' };
  }
}

async function adminAPIFormData(endpoint, formData, method = 'POST') {
  const headers = {};
  if (App.adminToken) headers['Authorization'] = `Bearer ${App.adminToken}`;
  try {
    const res = await fetch(API_BASE + endpoint, { method, headers, body: formData });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'خطأ في الاتصال' };
  }
}

/* ============================================================
   أدوات مساعدة
   ============================================================ */
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}