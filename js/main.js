/* ==========================================================================
   Lalit Aditya Yanala · Pixel portfolio — interactions & atmosphere
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = reduceMQ.matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };

  const tok = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const isLight = () => root.getAttribute('data-theme') === 'light';

  /* ------------------------------------------------------------------
     1. Pixel bitmaps → SVG / canvas sprites
     ------------------------------------------------------------------ */
  const ICONS = {
    star: ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
    heart: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
    moon: ['..####.', '.###...', '###....', '###....', '###....', '.###...', '..####.'],
    sun: ['....#....', '.#.....#.', '...###...', '..#####..', '#.#####.#', '..#####..', '...###...', '.#.....#.', '....#....'],
    tv: ['..#...#..', '...#.#...', '#########', '#.......#', '#.......#', '#.......#', '#########', '.#.....#.'],
    pin: ['..###..', '.#####.', '##...##', '##...##', '.#####.', '..###..', '...#...'],
    mail: ['#########', '##.....##', '#.#...#.#', '#..#.#..#', '#...#...#', '#.......#', '#########'],
    linkedin: ['#########', '##.######', '#########', '##.#...##', '##.#.#.##', '##.#.#.##', '##.#.#.##', '#########'],
    github: ['.#.....#.', '.##...##.', '.#######.', '#########', '##.###.##', '#########', '.#######.', '..##.##..', '..#...#..'],
    download: ['...###...', '...###...', '...###...', '.#######.', '..#####..', '...###...', '....#....', '#.......#', '#########'],
    sword: ['.......##', '......###', '.....###.', '....###..', '#..###...', '.####....', '..##.....', '.#.##....', '#...#....'],
    shield: ['#########', '#...#...#', '#...#...#', '#########', '#...#...#', '.#..#..#.', '..#.#.#..', '...###...', '....#....'],
    gear: ['....#....', '.#.###.#.', '..#####..', '.##...##.', '###...###', '.##...##.', '..#####..', '.#.###.#.', '....#....'],
    chest: ['.#######.', '#.......#', '#.......#', '####.####', '#...#...#', '#########', '#.......#', '#########'],
    cloud: ['...##.....', '..####.##.', '.########.', '##########', '##########'],
    potion: ['..###..', '...#...', '..#.#..', '.#...#.', '#.....#', '#######', '#######', '#######', '.#####.'],
    trophy: ['#.#####.#', '#.#####.#', '.##.####.', '..#####..', '...###...', '....#....', '....#....', '..#####..', '..#####..'],
  };

  function bitmapToSVG(rows, colors, cssW, cssH) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    let rects = '';
    rows.forEach((row, y) => {
      // merge horizontal runs of the same color into one rect
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        const fill = colors[ch];
        if (!fill) { x++; continue; }
        let run = 1;
        while (row[x + run] === ch) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${fill}"/>`;
        x += run;
      }
    });
    const size = cssW ? ` width="${cssW}" height="${cssH}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size} shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  }

  function bitmapToDataURL(rows, colors) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (colors[ch]) { g.fillStyle = colors[ch]; g.fillRect(x, y, 1, 1); }
      });
    });
    return { url: c.toDataURL('image/png'), w, h };
  }

  document.querySelectorAll('[data-icon]').forEach((el) => {
    const rows = ICONS[el.getAttribute('data-icon')];
    if (rows) el.innerHTML = bitmapToSVG(rows, { '#': 'currentColor' });
    el.setAttribute('aria-hidden', 'true');
  });

  /* ------------------------------------------------------------------
     2. Custom pixel cursor
     ------------------------------------------------------------------ */
  const ARROW = [
    'B',
    'BB',
    'BWB',
    'BWWB',
    'BWWWB',
    'BWWWWB',
    'BWWWWWB',
    'BWWWWWWB',
    'BWWWWWWWB',
    'BWWWWWBBBB',
    'BWWBWWB',
    'BWB.BWWB',
    'BB..BWWB',
    'B....BWWB',
    '.....BWWB',
    '......BB',
  ];
  function cursorURL(fill) {
    const svg = bitmapToSVG(ARROW, { B: '#000000', W: fill }, 20, 32);
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0`;
  }
  root.style.setProperty('--cursor', `${cursorURL('#f4f4f4')}, auto`);
  root.style.setProperty('--cursor-pointer', `${cursorURL('#f77622')}, pointer`);

  /* ------------------------------------------------------------------
     3. Theme + CRT toggles
     ------------------------------------------------------------------ */
  const themeBtn = document.getElementById('theme-toggle');
  const crtBtn = document.getElementById('crt-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function syncThemeUI() {
    const light = isLight();
    themeBtn.setAttribute('aria-pressed', String(light));
    themeBtn.querySelector('.toggle__label').textContent = light ? 'Day' : 'Night';
    themeBtn.setAttribute('aria-label', light ? 'Day theme on. Switch to night' : 'Night theme on. Switch to day');
    if (metaTheme) metaTheme.setAttribute('content', light ? '#73eff7' : '#1a1c2c');
  }
  function syncCrtUI() {
    const on = !root.classList.contains('crt-off');
    crtBtn.setAttribute('aria-pressed', String(on));
    crtBtn.setAttribute('aria-label', on ? 'CRT scanlines on. Turn off' : 'CRT scanlines off. Turn on');
  }

  themeBtn.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store.set('lay-theme', next);
    syncThemeUI();
    sky.rebuild(true);
    clouds.recolor();
  });
  crtBtn.addEventListener('click', () => {
    root.classList.toggle('crt-off');
    store.set('lay-crt', root.classList.contains('crt-off') ? 'off' : 'on');
    syncCrtUI();
  });

  /* ------------------------------------------------------------------
     4. Pixel sky (dithered bands, stars, moon / sun)
     ------------------------------------------------------------------ */
  const sky = (() => {
    const cvs = document.getElementById('sky');
    const ctx = cvs.getContext('2d');
    const bg = document.createElement('canvas');
    const PX = 2; // 1 canvas pixel = 2 CSS pixels
    let w = 0, h = 0, stars = [], timer = null;

    function dither(g, a, b, level) {
      const c = document.createElement('canvas');
      c.width = c.height = 2;
      const x = c.getContext('2d');
      x.fillStyle = a; x.fillRect(0, 0, 2, 2);
      x.fillStyle = b;
      if (level >= 1) x.fillRect(0, 0, 1, 1);
      if (level >= 2) x.fillRect(1, 1, 1, 1);
      if (level >= 3) x.fillRect(1, 0, 1, 1);
      return g.createPattern(c, 'repeat');
    }

    function pixelDisc(g, cx, cy, r, color) {
      g.fillStyle = color;
      for (let y = -r; y <= r; y++) {
        const span = Math.floor(Math.sqrt(r * r - y * y));
        g.fillRect(cx - span, cy + y, span * 2 + 1, 1);
      }
    }

    function paintBackground() {
      bg.width = w; bg.height = h;
      const g = bg.getContext('2d');
      const light = isLight();
      const top = light ? tok('--c-sky') : tok('--c-night');
      const bot = light ? tok('--c-cyan') : tok('--c-surface');
      const bands = [
        [0, 0.42, top],
        [0.42, 0.52, dither(g, top, bot, 1)],
        [0.52, 0.62, dither(g, top, bot, 2)],
        [0.62, 0.72, dither(g, top, bot, 3)],
        [0.72, 1.01, bot],
      ];
      bands.forEach(([a, b, fill]) => {
        g.fillStyle = fill;
        const y0 = Math.floor(a * h);
        g.fillRect(0, y0, w, Math.ceil(b * h) - y0);
      });

      const cx = Math.max(24, w - 40), cy = 26;
      if (light) {
        pixelDisc(g, cx, cy, 10, tok('--c-gold'));
        pixelDisc(g, cx - 2, cy - 2, 6, tok('--c-white'));
        pixelDisc(g, cx, cy, 6, tok('--c-gold'));
      } else {
        pixelDisc(g, cx, cy, 9, tok('--c-white'));
        pixelDisc(g, cx + 4, cy - 3, 8, tok('--c-night'));
        g.fillStyle = tok('--c-muted');
        g.fillRect(cx - 6, cy + 2, 2, 2);
        g.fillRect(cx - 3, cy + 5, 1, 1);
      }
    }

    function makeStars() {
      stars = [];
      if (isLight()) return;
      const count = Math.floor((w * h) / 650);
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        stars.push({
          x: Math.floor(Math.random() * w),
          y: Math.floor(Math.random() * h * 0.82),
          big: r < 0.08,
          color: r < 0.04 ? '--c-gold' : r < 0.1 ? '--c-cyan' : r < 0.55 ? '--c-white' : '--c-muted',
          twinkle: Math.random() < 0.4,
          on: true,
        });
      }
    }

    function draw() {
      if (!bg.width || !bg.height) return;
      ctx.drawImage(bg, 0, 0);
      const dim = tok('--c-surface-2');
      const cache = {};
      for (const s of stars) {
        const col = s.twinkle && !s.on ? dim : (cache[s.color] || (cache[s.color] = tok(s.color)));
        ctx.fillStyle = col;
        ctx.fillRect(s.x, s.y, 1, 1);
        if (s.big && s.on) {
          ctx.fillStyle = cache['--c-muted'] || (cache['--c-muted'] = tok('--c-muted'));
          ctx.fillRect(s.x - 1, s.y, 1, 1); ctx.fillRect(s.x + 1, s.y, 1, 1);
          ctx.fillRect(s.x, s.y - 1, 1, 1); ctx.fillRect(s.x, s.y + 1, 1, 1);
        }
      }
    }

    function tick() {
      for (const s of stars) if (s.twinkle && Math.random() < 0.3) s.on = !s.on;
      draw();
    }

    function startTwinkle() {
      stopTwinkle();
      if (!reduceMotion && !isLight() && !document.hidden) timer = setInterval(tick, 450);
    }
    function stopTwinkle() { if (timer) { clearInterval(timer); timer = null; } }

    let lastW = 0, lastH = 0;
    function rebuild(force) {
      const nw = Math.ceil(window.innerWidth / PX);
      const nh = Math.ceil(window.innerHeight / PX);
      if (nw < 1 || nh < 1) return; // hidden / zero-size window
      // Ignore small height changes (mobile address bar) unless forced
      if (!force && nw === lastW && Math.abs(nh - lastH) < 60) return;
      lastW = w = nw; lastH = h = nh;
      cvs.width = w; cvs.height = h;
      ctx.imageSmoothingEnabled = false;
      paintBackground();
      makeStars();
      draw();
      startTwinkle();
    }

    document.addEventListener('visibilitychange', () => (document.hidden ? stopTwinkle() : startTwinkle()));
    return { rebuild, startTwinkle, stopTwinkle };
  })();

  /* ------------------------------------------------------------------
     5. Parallax pixel clouds + a little plane
     ------------------------------------------------------------------ */
  const clouds = (() => {
    const wrap = document.getElementById('clouds');
    const SHAPES = [
      [
        '..........mmmm..........',
        '.......mmmmmmmmm...mmm..',
        '.....mmmmmmmmmmmmmmmmmmm',
        '..mmmmmmmmmmmmmmmmmmmmmmmm',
        '.mmmmmmmmmmmmmmmmmmmmmmmmmm',
        'ssssssssssssssssssssssssssss',
        '..ssssssssssssssssssssssss..',
      ],
      [
        '.....mmmmm.......',
        '...mmmmmmmmm.mm..',
        '.mmmmmmmmmmmmmmmm',
        'mmmmmmmmmmmmmmmmmm',
        '.ssssssssssssssss.',
      ],
      [
        '........mmm...........',
        '...mmm.mmmmmm..mmmm...',
        '.mmmmmmmmmmmmmmmmmmmm.',
        'mmmmmmmmmmmmmmmmmmmmmm',
        'ssssssssssssssssssssss',
      ],
    ];
    const PLANE = [
      'oo..............',
      'ooo.............',
      'ooowwwwwwwwwww..',
      '.wwwwwwwwwwwwccw',
      '..wwwwwwwwwwwww.',
      '......ooo.......',
      '.....ooo........',
    ];
    const LAYERS = [
      { factor: 0.03, scale: 3, count: 4, dur: 170 },
      { factor: 0.07, scale: 4, count: 3, dur: 120 },
      { factor: 0.13, scale: 6, count: 2, dur: 85 },
    ];
    const layers = [];
    const cloudImgs = [];

    function cloudColors() {
      return isLight()
        ? { m: tok('--c-white'), s: tok('--c-muted') }
        : { m: tok('--c-surface-2'), s: tok('--c-surface') };
    }

    function recolor() {
      const colors = cloudColors();
      cloudImgs.forEach((img) => {
        img.src = bitmapToDataURL(SHAPES[img.dataset.shape], colors).url;
      });
    }

    function build() {
      const colors = cloudColors();
      LAYERS.forEach((cfg, li) => {
        const layer = document.createElement('div');
        layer.className = 'cloud-layer';
        for (let i = 0; i < cfg.count; i++) {
          const shape = (i + li) % SHAPES.length;
          const sprite = bitmapToDataURL(SHAPES[shape], colors);
          const c = document.createElement('div');
          c.className = 'cloud';
          const top = ((i + 0.3 + Math.random() * 0.5) / cfg.count) * 100;
          c.style.top = `${top}%`;
          c.style.animationDuration = `${cfg.dur + Math.random() * 30}s`;
          c.style.animationDelay = `${-Math.random() * cfg.dur}s`;
          c.style.setProperty('--x', `${Math.round(Math.random() * 80)}vw`);
          if (li === 0) c.style.opacity = '0.75';
          const img = document.createElement('img');
          img.alt = '';
          img.src = sprite.url;
          img.width = sprite.w * cfg.scale;
          img.height = sprite.h * cfg.scale;
          img.dataset.shape = String(shape);
          cloudImgs.push(img);
          c.appendChild(img);
          layer.appendChild(c);
        }
        wrap.appendChild(layer);
        layers.push({ el: layer, factor: cfg.factor });
      });

      // Plane
      const p = bitmapToDataURL(PLANE, { o: tok('--c-orange'), w: tok('--c-white'), c: tok('--c-cyan') });
      const plane = document.createElement('div');
      plane.className = 'plane';
      const pimg = document.createElement('img');
      pimg.alt = '';
      pimg.src = p.url;
      pimg.width = p.w * 3;
      pimg.height = p.h * 3;
      plane.appendChild(pimg);
      wrap.appendChild(plane);

      size();
    }

    function size() {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      layers.forEach((l) => { l.el.style.height = `${window.innerHeight * 0.85 + maxScroll * l.factor}px`; });
      update();
    }

    function update() {
      const y = window.scrollY;
      layers.forEach((l) => {
        const ty = -Math.round((y * l.factor) / 4) * 4; // move in 4px steps
        l.el.style.transform = `translate3d(0, ${ty}px, 0)`;
      });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });

    return { build, size, recolor };
  })();

  /* ------------------------------------------------------------------
     6. Mobile pause menu
     ------------------------------------------------------------------ */
  const menuBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('menu-close');

  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    const first = menu.querySelector('a');
    if (first) first.focus();
  }
  function closeMenu(returnFocus = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (returnFocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  menuClose.addEventListener('click', () => closeMenu());
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab' && !menu.hidden) {
      // keep focus inside the overlay
      const items = [...menu.querySelectorAll('a, button')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ------------------------------------------------------------------
     7. Active nav link (blinking ►)
     ------------------------------------------------------------------ */
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('main > section[id]').forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------
     8. Segmented bars + stepwise reveal on scroll
     ------------------------------------------------------------------ */
  const SEGMENTS = 20;
  document.querySelectorAll('.bar').forEach((bar) => {
    bar.style.setProperty('--segments', SEGMENTS);
    bar.innerHTML = '<i></i>'.repeat(SEGMENTS);
  });

  function fillBar(bar) {
    if (bar.dataset.filled) return;
    bar.dataset.filled = '1';
    const target = Math.round((parseFloat(bar.dataset.value) / parseFloat(bar.dataset.max)) * SEGMENTS);
    const cells = bar.querySelectorAll('i');
    if (reduceMotion) { for (let i = 0; i < target; i++) cells[i].classList.add('on'); return; }
    let i = 0;
    const t = setInterval(() => {
      if (i >= target) { clearInterval(t); return; }
      cells[i++].classList.add('on');
    }, 45);
  }

  const reveals = document.querySelectorAll('.reveal');
  function show(el) {
    el.classList.add('is-visible');
    el.querySelectorAll('.bar').forEach((b) => setTimeout(() => fillBar(b), reduceMotion ? 0 : 300));
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        io.unobserve(e.target);
        setTimeout(() => show(e.target), i * 90);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     9. Project filters
     ------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('[data-filter]');
  const projects = document.querySelectorAll('.project');
  const filterStatus = document.getElementById('filter-status');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('btn--ghost', !on);
      });
      let shown = 0;
      projects.forEach((p) => {
        const match = f === 'all' || p.dataset.cat.split(' ').includes(f);
        p.hidden = !match;
        if (match) {
          shown++;
          p.classList.add('is-visible');
        }
      });
      filterStatus.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}`;
      clouds.size();
    });
  });

  /* ------------------------------------------------------------------
     10. Avatar: pixel ↔ HD photo
     ------------------------------------------------------------------ */
  const avatar = document.getElementById('avatar');
  const avatarBtn = document.getElementById('avatar-switch');
  avatarBtn.addEventListener('click', () => {
    const hd = avatar.classList.toggle('is-hd');
    avatarBtn.setAttribute('aria-pressed', String(hd));
    avatarBtn.textContent = hd ? 'Show pixel' : 'Show HD';
  });

  /* ------------------------------------------------------------------
     11. Contact form → opens the visitor's email app
     ------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input, textarea')];
    let firstBad = null;
    fields.forEach((f) => {
      const bad = !f.value.trim();
      f.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      formStatus.textContent = `Please fill in: ${firstBad.labels[0].textContent}.`;
      formStatus.classList.add('is-error');
      firstBad.focus();
      return;
    }
    formStatus.classList.remove('is-error');
    const name = form.name.value.trim();
    const subject = form.subject.value.trim();
    const body = `${form.message.value.trim()}\n\n— ${name}`;
    formStatus.textContent = 'Opening your email app…';
    window.location.href = `mailto:lalitadityayanala@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.querySelectorAll('input, textarea').forEach((f) =>
    f.addEventListener('input', () => f.removeAttribute('aria-invalid')));

  /* ------------------------------------------------------------------
     12. Boot
     ------------------------------------------------------------------ */
  document.getElementById('year').textContent = String(new Date().getFullYear());
  syncThemeUI();
  syncCrtUI();
  sky.rebuild(true);
  clouds.build();

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      sky.rebuild(false);
      clouds.size();
      if (window.innerWidth > 1000) closeMenu(false);
    }, 150);
  });
  window.addEventListener('load', () => clouds.size());

  reduceMQ.addEventListener('change', (e) => {
    reduceMotion = e.matches;
    if (reduceMotion) { sky.stopTwinkle(); reveals.forEach(show); }
    else sky.startTwinkle();
  });
})();
