/* ============================================================
   script.js — Interaksi tambahan agar website lebih "hidup"
   Semua fitur menghormati preferensi prefers-reduced-motion
   dan perangkat layar sentuh (pointer: coarse).
   ============================================================ */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    /* ---------- 1. Scroll Reveal (fade-up saat di-scroll) ---------- */
    function initScrollReveal() {
        const targets = document.querySelectorAll(
            '.feature-card, .method-card, .download-links, .title-box, .info-card, .root-card, .section-title, .hero-note, .stat'
        );

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (t) { t.classList.add('revealed'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        targets.forEach(function (t) {
            t.classList.add('reveal');
            observer.observe(t);
        });
    }

    /* ---------- 2. Tombol Kembali ke Atas ---------- */
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Kembali ke atas');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 400) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        }, { passive: true });
    }

    /* ---------- 3. Cahaya kursor mengikuti mouse ---------- */
    function initCursorGlow() {
        if (prefersReducedMotion || isTouch) return;

        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        let x = window.innerWidth / 2, y = window.innerHeight / 2;
        let tx = x, ty = y;

        window.addEventListener('mousemove', function (e) {
            tx = e.clientX;
            ty = e.clientY;
        });

        function loop() {
            x += (tx - x) * 0.15;
            y += (ty - y) * 0.15;
            glow.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- 4. Efek mengetik pada judul hero ---------- */
    function initTyping() {
        const el = document.querySelector('.hero-text h1');
        if (!el || prefersReducedMotion) return;

        const text = el.textContent.trim();
        el.textContent = '';
        el.classList.add('typing');

        let i = 0;
        function type() {
            if (i <= text.length) {
                el.textContent = text.slice(0, i);
                i++;
                setTimeout(type, 70);
            } else {
                el.classList.remove('typing');
            }
        }
        // Mulai setelah overlay pembuka (5 detik) selesai
        setTimeout(type, 5200);
    }

    /* ---------- 5. Efek 3D tilt pada kartu ---------- */
    function initTilt() {
        if (prefersReducedMotion || isTouch) return;

        const cards = document.querySelectorAll('.method-card, .feature-card');
        cards.forEach(function (card) {
            card.classList.add('tilt');
            card.addEventListener('mousemove', function (e) {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(800px) rotateY(' + (px * 8) + 'deg) rotateX(' + (-py * 8) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /* ---------- 6. Toast notifikasi saat klik unduhan ---------- */
    function initToast() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);

        function showToast(msg) {
            const t = document.createElement('div');
            t.className = 'toast';
            t.textContent = msg;
            container.appendChild(t);
            requestAnimationFrame(function () { t.classList.add('show'); });
            setTimeout(function () {
                t.classList.remove('show');
                setTimeout(function () { t.remove(); }, 300);
            }, 2500);
        }

        document.querySelectorAll('.download-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showToast('Mengalihkan ke tautan unduhan…');
            });
        });
    }

    /* ---------- 7. Sorot navigasi aktif sesuai section ---------- */
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const links = document.querySelectorAll('nav a[href^="#"]');
        if (!sections.length || !links.length) return;

        const map = {};
        links.forEach(function (l) {
            const id = l.getAttribute('href').slice(1);
            if (id) map[id] = l;
        });

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    links.forEach(function (l) { l.classList.remove('active'); });
                    const link = map[entry.target.id];
                    if (link) link.classList.add('active');
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(function (s) { observer.observe(s); });
    }

    /* ---------- 8. Hitungan angka animasi (counters) ---------- */
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10) || 0;
                const suffix = el.dataset.suffix || '';

                if (prefersReducedMotion) {
                    el.textContent = target + suffix;
                    observer.unobserve(el);
                    return;
                }

                let cur = 0;
                const step = Math.max(1, Math.ceil(target / 60));
                const timer = setInterval(function () {
                    cur += step;
                    if (cur >= target) {
                        cur = target;
                        clearInterval(timer);
                    }
                    el.textContent = cur + suffix;
                }, 25);

                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    /* ---------- 9. Efek kode jatuh (code rain background) ---------- */
    function initSnow() {
        if (prefersReducedMotion) return;

        const layer = document.getElementById('snowLayer');
        if (!layer) return;

        const SNIPPETS = [
            'function()', 'const x =', '=> { }', 'return;', 'import { }',
            'console.log', 'await fetch', 'if (true)', 'for (i++)', '=> void',
            'let a = 0', 'class {}', 'try {}', 'catch(e)', 'null;', 'true;',
            '0x1F', '&& ||', '===', '!==', 'async', 'yield', 'map()', 'filter',
            '</>', '{}', '[]', '=>', ';', '#', '$', '&&', '||', '=='
        ];
        const COUNT = 60;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < COUNT; i++) {
            const flake = document.createElement('span');
            const text = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
            const left = Math.random() * 100;            // posisi horizontal %
            const duration = Math.random() * 9 + 7;      // 7s - 16s
            const delay = Math.random() * 12;            // penundaan acak
            const drift = (Math.random() * 80 - 40) + 'px'; // ayunan horizontal

            flake.textContent = text;
            flake.style.left = left + '%';
            flake.style.opacity = (Math.random() * 0.5 + 0.35).toFixed(2);
            flake.style.animationDuration = duration + 's';
            flake.style.animationDelay = '-' + delay + 's';
            flake.style.setProperty('--drift', drift);

            fragment.appendChild(flake);
        }

        layer.appendChild(fragment);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initScrollReveal();
        initBackToTop();
        initCursorGlow();
        initTyping();
        initTilt();
        initToast();
        initActiveNav();
        initCounters();
        initSnow();
    });
})();
