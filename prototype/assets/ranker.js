/* Ranker.vn prototype – shared behaviour: header, mega menu, drawer, search, theme, login, toast, votes */
(function () {
  var root = document.documentElement, body = document.body;

  /* ---------- data ---------- */
  var CATS = [
    { k: 'tech', name: 'Công nghệ', ic: '📱', count: 312, group: 'A', subs: ['Điện thoại', 'Laptop', 'Tai nghe', 'Đồng hồ thông minh', 'Máy ảnh', 'Ứng dụng'], trend: ['Top 10 Điện Thoại Tốt Nhất 2025', 'c', '📱'] },
    { k: 'food', name: 'Ẩm thực', ic: '🍜', count: 248, group: 'A', subs: ['Phở', 'Bún chả', 'Cà phê', 'Lẩu', 'Quán vỉa hè', 'Nhà hàng', 'Đồ ăn vặt'], trend: ['Quán Phở Ngon Nhất Hà Nội', 'b', '🍜'] },
    { k: 'film', name: 'Phim & Series', href: 'category.html', ic: '🎬', count: 205, group: 'B', subs: ['Phim Việt', 'Phim Hàn', 'Phim Mỹ', 'Hoạt hình', 'Series Netflix', 'Kinh dị'], trend: ['Phim Việt Hay Nhất Mọi Thời Đại', 'd', '🎬'] },
    { k: 'music', name: 'Ca sĩ', ic: '🎤', count: 88, group: 'B', subs: ['V-pop', 'Bolero', 'Rap Việt', 'Nhóm nhạc', 'Ca sĩ trẻ'], trend: ['Ca Sĩ Việt Hát Live Hay Nhất', 'f', '🎤'] },
    { k: 'education', name: 'Trường học', ic: '🎓', count: 58, group: 'B', subs: ['Đại học', 'THPT chuyên', 'Trung tâm tiếng Anh', 'Du học', 'Khóa học online'], trend: ['Đại Học Đáng Học Nhất Việt Nam', 'g', '🎓'] },
    { k: 'finance', name: 'Tài chính', ic: '💳', count: 74, group: 'A', subs: ['Ngân hàng', 'Ví điện tử', 'Thẻ tín dụng', 'Bảo hiểm', 'App chứng khoán'], trend: ['Ngân Hàng Có App Tốt Nhất', 'e', '🏦'] },
    { k: 'travel', name: 'Du lịch', ic: '✈️', count: 131, group: 'A', subs: ['Biển', 'Khách sạn', 'Resort', 'Homestay', 'Hãng bay'], trend: ['Bãi Biển Đẹp Nhất Việt Nam', 'h', '🏝️'] },
    { k: 'beauty', name: 'Làm đẹp', ic: '💄', count: 96, group: 'A', subs: ['Skincare', 'Kem chống nắng', 'Son môi', 'Nước hoa', 'Spa'], trend: ['Kem Chống Nắng Tốt Nhất Cho Da Dầu', 'f', '💄'] },
    { k: 'music', name: 'Diễn viên', ic: '⭐', count: 71, group: 'B', subs: ['Diễn viên Việt', 'Diễn viên Hàn', 'Hollywood'], trend: ['Diễn Viên Việt Được Yêu Thích Nhất', 'f', '⭐'] },
    { k: 'travel', name: 'Địa điểm', ic: '📍', count: 112, group: 'B', subs: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Check-in'], trend: ['Điểm Check-in Đẹp Nhất Đà Lạt', 'h', '📍'] }
  ];
  var MAIN = 6; // shown inline on desktop
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- category nav + mega menus ---------- */
  var cats = document.getElementById('cats'), megaHost = document.getElementById('megaHost');
  CATS.slice(0, MAIN).forEach(function (c, i) {
    cats.insertAdjacentHTML('beforeend', '<button class="cat-btn" aria-expanded="false" aria-controls="mega' + i + '" data-i="' + i + '"><i class="dot" style="--dot:var(--color-cat-' + c.k + ')"></i>' + esc(c.name) + '</button>');
    megaHost.insertAdjacentHTML('beforeend',
      '<div class="mega" id="mega' + i + '"><div class="mega-panel" style="background:var(--color-cat-' + c.k + ')">' +
      '<div class="mega-badge" aria-hidden="true">' + c.ic + '</div>' +
      '<div><h3>Khám phá ' + esc(c.name) + '</h3><div class="subs">' + c.subs.map(function (s) { return '<a href="#">' + esc(s) + '</a>'; }).join('') + '</div><a class="all" href="' + (c.href || '#') + '">Xem tất cả ' + c.count + ' bảng ' + esc(c.name.toLowerCase()) + ' →</a></div>' +
      '<a class="mega-trend" href="#"><span class="lbl">Thịnh hành ngay</span><div class="card"><div class="collage"><div class="ph ' + c.trend[1] + '" style="font-size:28px">' + c.trend[2] + '</div><div class="ph a" style="font-size:28px">' + c.trend[2] + '</div><div class="ph ' + c.trend[1] + '" style="font-size:28px">' + c.trend[2] + '</div></div><b>' + esc(c.trend[0]) + '</b></div></a>' +
      '</div></div>');
  });
  cats.insertAdjacentHTML('beforeend', '<button class="cat-btn" aria-expanded="false" aria-controls="megaMore" data-i="more"><i class="dot" style="--dot:var(--color-text-muted)"></i>Thêm</button>');
  megaHost.insertAdjacentHTML('beforeend', '<div class="mega mega-more" id="megaMore"><div class="mega-panel">' +
    CATS.slice(MAIN).map(function (c) { return '<a href="#"><span class="ic" style="background:var(--color-cat-' + c.k + ')">' + c.ic + '</span>' + esc(c.name) + '</a>'; }).join('') + '</div></div>');

  var openBtn = null, closeTimer = null;
  function closeMega() {
    if (!openBtn) return;
    openBtn.setAttribute('aria-expanded', 'false');
    document.getElementById(openBtn.getAttribute('aria-controls')).classList.remove('open');
    openBtn = null;
  }
  function openMega(btn) {
    clearTimeout(closeTimer);
    if (openBtn === btn) return;
    closeMega(); closeSearch();
    openBtn = btn; btn.setAttribute('aria-expanded', 'true');
    document.getElementById(btn.getAttribute('aria-controls')).classList.add('open');
  }
  cats.querySelectorAll('.cat-btn').forEach(function (b) {
    b.addEventListener('click', function () { openBtn === b ? closeMega() : openMega(b); });
    b.addEventListener('mouseenter', function () { if (matchMedia('(hover: hover)').matches) openMega(b); });
  });
  var header = document.querySelector('.site-header');
  header.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeMega, 180); });
  header.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.site-header')) { closeMega(); } });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (openBtn) { var b = openBtn; closeMega(); b.focus(); } closeSearch(); closeDrawer(); } });

  /* ---------- mobile drawer ---------- */
  var drawer = document.getElementById('drawer'), burger = document.getElementById('burger');
  document.getElementById('drawerBody').innerHTML = CATS.map(function (c) {
    return '<details><summary><span class="ic" style="background:var(--color-cat-' + c.k + ')">' + c.ic + '</span>' + esc(c.name) + '</summary><div class="subs">' + c.subs.map(function (s) { return '<a href="#">' + esc(s) + '</a>'; }).join('') + '</div></details>';
  }).join('') + '<div class="foot"><button class="btn button-primary js-login">Đăng Nhập</button><a class="btn button-secondary" href="#requested">Đề Xuất Chủ Đề</a></div>';
  function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); body.classList.add('no-scroll'); drawer.querySelector('[data-close].icon-btn').focus(); }
  function closeDrawer() { if (!drawer.classList.contains('open')) return; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); body.classList.remove('no-scroll'); }
  burger.addEventListener('click', openDrawer);
  drawer.addEventListener('click', function (e) { if (e.target.closest('[data-close]') || e.target.closest('.subs a') || e.target.closest('.foot a')) closeDrawer(); });

  /* ---------- category tiles ---------- */
  if (document.getElementById('tilesA')) CATS.forEach(function (c) {
    document.getElementById(c.group === 'A' ? 'tilesA' : 'tilesB').insertAdjacentHTML('beforeend',
      '<a class="category-tile" href="' + (c.href || '#') + '"><span class="ic" style="background:var(--color-cat-' + c.k + ')">' + c.ic + '</span><span><span class="nm">' + esc(c.name) + '</span><small>' + c.count + ' bảng xếp hạng</small></span></a>');
  });

  /* ---------- theme ---------- */
  var themeBtn = document.getElementById('themeBtn');
  function applyTheme(t) { root.setAttribute('data-theme', t); themeBtn.textContent = t === 'dark' ? '☀️ Giao diện sáng' : '🌙 Giao diện tối'; }
  var saved = null; try { saved = localStorage.getItem('rv-theme'); } catch (e) {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', function () { var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(t); try { localStorage.setItem('rv-theme', t); } catch (e) {} });

  addEventListener('scroll', function () { header.classList.toggle('is-scrolled', scrollY > 8); }, { passive: true });

  /* ---------- hero carousel (homepage only) ---------- */
  if (document.querySelector('.dots')) (function () {
  var slides = [].slice.call(document.querySelectorAll('.slide')), dots = document.querySelector('.dots'), cur = 0, timer = null;
  slides.forEach(function (s, i) { dots.insertAdjacentHTML('beforeend', '<button role="tab" aria-label="Slide ' + (i + 1) + '" aria-current="' + (i === 0) + '"></button>'); });
  var dotBtns = [].slice.call(dots.children);
  function show(i) { cur = (i + slides.length) % slides.length; slides.forEach(function (s, j) { s.classList.toggle('is-active', j === cur); }); dotBtns.forEach(function (d, j) { d.setAttribute('aria-current', j === cur); }); }
  dotBtns.forEach(function (d, i) { d.addEventListener('click', function () { show(i); restart(); }); });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 6000); }
  var slidesEl = document.getElementById('slides');
  slidesEl.addEventListener('mouseenter', function () { clearInterval(timer); });
  slidesEl.addEventListener('mouseleave', restart);
  restart();
  })();

  /* ---------- toast ---------- */
  var host = document.getElementById('toastHost');
  function toast(html, undo) {
    var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = '<span class="ok">✓</span><span>' + html + '</span>';
    if (undo) { var b = document.createElement('button'); b.className = 'undo'; b.textContent = 'Hoàn Tác'; b.onclick = function () { undo(); el.remove(); }; el.appendChild(b); }
    host.innerHTML = ''; host.appendChild(el); setTimeout(function () { el.remove(); }, 3800);
  }

  /* ---------- login (simulated) ---------- */
  var logged = false, pending = null, lastFocus = null, modal = document.getElementById('loginModal'), lead = document.getElementById('loginLead');
  function openLogin(reason) { closeDrawer(); lastFocus = document.activeElement; lead.innerHTML = reason || 'Mỗi người một phiếu cho mỗi mục, đổi ý bất cứ lúc nào.'; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.getElementById('googleBtn').focus(); }
  function closeLogin() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); pending = null; if (lastFocus) lastFocus.focus(); }
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.js-close')) closeLogin(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeLogin(); });
  document.addEventListener('click', function (e) { if (e.target.closest('.js-login')) openLogin(); });
  document.getElementById('googleBtn').addEventListener('click', function () {
    logged = true; body.classList.add('logged'); var job = pending; pending = null;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    job ? job() : toast('Đã đăng nhập. Chào mừng bạn đến Ranker.vn!');
  });
  function requireLogin(reason, job) { if (logged) return job(); pending = job; openLogin(reason); }

  /* ---------- votes ---------- */
  var UP = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  var DN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
  var fmt = function (n) { return n.toLocaleString('vi-VN'); };
  function bindVotes(scope) {
    (scope || document).querySelectorAll('.vote[data-count]:not([data-bound])').forEach(function (v) {
    v.setAttribute('data-bound', '');
    var base = +v.dataset.count, mine = 0, name = v.closest('[data-name]').dataset.name;
    v.innerHTML = '<button class="vote-button up" aria-pressed="false" aria-label="Vote lên ' + esc(name) + '">' + UP + '</button><span class="vote-count" aria-live="polite">' + fmt(base) + '</span><button class="vote-button down" aria-pressed="false" aria-label="Vote xuống ' + esc(name) + '">' + DN + '</button>';
    var up = v.querySelector('.up'), dn = v.querySelector('.down'), cnt = v.querySelector('.vote-count');
    function render() { up.classList.toggle('is-active', mine === 1); up.setAttribute('aria-pressed', mine === 1); dn.classList.toggle('is-active', mine === -1); dn.setAttribute('aria-pressed', mine === -1); cnt.textContent = fmt(base + mine); cnt.classList.toggle('is-up', mine === 1); }
    function cast(d) { var prev = mine; mine = mine === d ? 0 : d; render(); toast(mine === 0 ? 'Đã bỏ phiếu cho <b>' + esc(name) + '</b>' : 'Đã ghi nhận ' + (mine === 1 ? 'vote lên' : 'vote xuống') + ' cho <b>' + esc(name) + '</b>', function () { mine = prev; render(); }); }
    [[up, 1], [dn, -1]].forEach(function (p) { p[0].addEventListener('click', function () { requireLogin('Phiếu bạn vừa bấm cho <b>' + esc(name) + '</b> sẽ được ghi nhận ngay sau khi đăng nhập.', function () { cast(p[1]); }); }); });
  });
  }
  bindVotes(document);
  window.RVbindVotes = bindVotes;

  /* ---------- want / topic ---------- */
  document.querySelectorAll('.want').forEach(function (b) {
    var countEl = b.closest('.topic').querySelector('[data-want]'), base = +countEl.textContent.replace(/\./g, ''), on = false, title = b.closest('.topic').querySelector('h4').textContent;
    b.addEventListener('click', function () { requireLogin('Đăng nhập để ủng hộ chủ đề <b>' + esc(title) + '</b>.', function () { on = !on; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '✓ Đã Ủng Hộ' : 'Tôi Cũng Muốn Xem'; countEl.textContent = fmt(base + (on ? 1 : 0)); if (on) toast('Đã ủng hộ <b>' + esc(title) + '</b>. Bạn sẽ nhận thông báo khi bảng được đăng.'); }); });
  });
  var topicForm = document.getElementById('topicForm');
  if (topicForm) topicForm.addEventListener('submit', function (e) {
    e.preventDefault(); var input = document.getElementById('topicInput'), v = input.value.trim(); if (!v) { input.focus(); return; }
    requireLogin('Đăng nhập để gửi đề xuất <b>' + esc(v) + '</b>.', function () { input.value = ''; toast('Đã gửi đề xuất <b>' + esc(v) + '</b>. Ban biên tập sẽ duyệt trong 24 giờ.'); });
  });

  /* ---------- search drop + typeahead ---------- */
  var sb = document.getElementById('searchbar'), st = document.getElementById('searchToggle');
  function closeSearch() { sb.classList.remove('open'); st.setAttribute('aria-expanded', 'false'); list.classList.remove('open'); }
  st.addEventListener('click', function () { var o = !sb.classList.contains('open'); closeMega(); sb.classList.toggle('open', o); st.setAttribute('aria-expanded', o); if (o) q.focus(); });
  var LISTS = [['Top 10 Điện Thoại Tốt Nhất 2025', 'Công nghệ', 'tech'], ['Điện Thoại Chụp Ảnh Đẹp Nhất', 'Công nghệ', 'tech'], ['Laptop Cho Sinh Viên Đáng Mua Nhất', 'Công nghệ', 'tech'], ['Quán Phở Ngon Nhất Hà Nội', 'Ẩm thực', 'food'], ['Quán Bún Chả Ngon Nhất Phố Cổ', 'Ẩm thực', 'food'], ['Quán Cà Phê Đẹp Nhất Sài Gòn', 'Ẩm thực', 'food'], ['Phim Việt Hay Nhất Mọi Thời Đại', 'Phim & Series', 'film'], ['Ca Sĩ Việt Hát Live Hay Nhất', 'Ca sĩ', 'music'], ['Đại Học Đáng Học Nhất Việt Nam', 'Trường học', 'education'], ['Ngân Hàng Có App Tốt Nhất', 'Tài chính', 'finance'], ['Bãi Biển Đẹp Nhất Việt Nam', 'Du lịch', 'travel'], ['Kem Chống Nắng Tốt Nhất Cho Da Dầu', 'Làm đẹp', 'beauty']];
  var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); };
  var q = document.getElementById('q'), list = document.getElementById('qList'), sel = -1;
  function hl(t, nq) { var i = norm(t).indexOf(nq); if (i < 0) return esc(t); return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + nq.length)) + '</mark>' + esc(t.slice(i + nq.length)); }
  function renderSuggest() {
    var nq = norm(q.value.trim()); sel = -1;
    if (!nq) { list.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); return; }
    var hits = LISTS.filter(function (l) { return norm(l[0]).indexOf(nq) > -1 || norm(l[1]).indexOf(nq) > -1; }).slice(0, 6);
    list.innerHTML = hits.length ? hits.map(function (l, i) { return '<a href="#" role="option" id="opt' + i + '" aria-selected="false"><span>' + hl(l[0], nq) + '</span><span class="cat"><i class="dot" style="background:var(--color-cat-' + l[2] + ')"></i>' + esc(l[1]) + '</span></a>'; }).join('') : '<div class="empty">Chưa có bảng "' + esc(q.value.trim()) + '". <a href="#requested">Đề xuất chủ đề này →</a></div>';
    list.classList.add('open'); q.setAttribute('aria-expanded', 'true');
  }
  q.addEventListener('input', renderSuggest);
  window.RV = { bindVotes: bindVotes, toast: toast, requireLogin: requireLogin, esc: esc, fmt: fmt, isLogged: function () { return logged; } };

  q.addEventListener('keydown', function (e) {
    var opts = list.querySelectorAll('[role="option"]'); if (!opts.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === sel); }); q.setAttribute('aria-activedescendant', opts[sel].id); }
  });
})();
