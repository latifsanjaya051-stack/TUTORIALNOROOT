/* ============================================================
   script.js — Professional Interactions & UI Controllers
   ============================================================ */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    /* ---------- 1. Pemuat Video YouTube Efisiensi Tinggi ---------- */
    function initVideoLoaders() {
        function extractYouTubeId(url) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return match && match[2].length === 11 ? match[2] : null;
        }

        function loadVideo(targetId, videoUrl) {
            const el = document.getElementById(targetId);
            const videoId = extractYouTubeId(videoUrl);
            if (el && videoId) {
                el.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="border-radius: 1rem; aspect-ratio: 16/9; display: block; background: #000;"></iframe>`;
            }
        }

        loadVideo('videoPreview', "https://youtu.be/nFo4WVc9ZX4?si=lo-ekDOfVK6zr8ZT");
        loadVideo('videoPreview2', "https://youtu.be/XmzBGlpB5Eg?si=SEooZMPBqBpqjsly");
    }

    /* ---------- 2. Generator Latar Belakang Partikel Dinamis ---------- */
    function initDynamicSnow() {
        const snowLayer = document.getElementById('snowLayer');
        if (!snowLayer || prefersReducedMotion) return;

        const symbols = ['1', '0', '•', '✦', '+', 'x', 'V', 'I', 'P'];
        const count = window.innerWidth > 768 ? 30 : 15;

        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            span.style.left = Math.random() * 100 + '%';
            span.style.animationDuration = (Math.random() * 8 + 6) + 's';
            span.style.animationDelay = (Math.random() * 5) + 's';
            span.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
            snowLayer.appendChild(span);
        }
    }

    /* ---------- 3. Intro Overlay Animation Controller ---------- */
    function initIntroOverlay() {
        const overlay = document.getElementById('introOverlay');
        if (!overlay) return;

        document.body.style.overflow = 'hidden';

        function dismissOverlay() {
            if (overlay.classList.contains('intro-hidden')) return;
            overlay.classList.add('intro-hidden');
            document.body.style.overflow = '';
            setTimeout(function () {
                if (overlay.parentNode) overlay.remove();
            }, 700);
        }

        // Customer harus mengklik tombol "Masuk" sebelum masuk ke website.
        // Overlay tidak lagi tertutup otomatis.
        const enterBtn = document.getElementById('introEnterBtn');
        if (enterBtn) {
            enterBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                dismissOverlay();
                // Setelah masuk, tampilkan modal pilihan Root / No Root
                setTimeout(function () { initChoiceModal(); }, 400);
            });
        }

        // Izinkan juga menutup dengan tombol keyboard (Enter / Spasi / Escape)
        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                dismissOverlay();
                setTimeout(function () { initChoiceModal(); }, 400);
            }
        });
    }

    /* ---------- 3b. Choice Modal: Root / No Root ---------- */
    function initChoiceModal() {
        const modal = document.getElementById('choiceModal');
        if (!modal || !modal.hasAttribute('hidden') === false) { /* noop */ }
        if (!modal) return;
        if (!modal.hasAttribute('hidden')) return; // sudah tampil

        const stepRoot = document.getElementById('stepRoot');
        const stepNoRoot = document.getElementById('stepNoRoot');
        const backBtn = document.getElementById('choiceBack');
        const header = document.getElementById('mainHeader');

        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';

        function closeModal() {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }

        function scrollToId(id) {
            const target = document.getElementById(id);
            if (!target) return;
            // Paksa render agar content-visibility:auto tidak salah hitung posisi
            target.style.contentVisibility = 'visible';
            const headerHeight = header ? header.offsetHeight : 64;
            const pos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
            window.scrollTo({ top: pos, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }

        // Pilihan ROOT / NO ROOT
        modal.querySelectorAll('[data-choice]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const choice = btn.getAttribute('data-choice');
                if (choice === 'root') {
                    closeModal();
                    scrollToId('root-tutorial');
                } else {
                    stepRoot.hidden = true;
                    stepNoRoot.hidden = false;
                }
            });
        });

        // Pilihan metode NO ROOT -> arahkan ke section
        modal.querySelectorAll('[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = btn.getAttribute('data-target');
                closeModal();
                setTimeout(function () { scrollToId(id); }, 250);
            });
        });

        if (backBtn) {
            backBtn.addEventListener('click', function () {
                stepNoRoot.hidden = true;
                stepRoot.hidden = false;
            });
        }
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    /* ---------- 4. Scroll Reveal (Fade-Up Animation) ---------- */
    function initScrollReveal() {
        // Map selector -> reveal variant class
        const map = [
            ['.hero-note', 'reveal'],
            ['.method-card', 'reveal'],
            ['.tutorial-card', 'reveal-scale'],
            ['.title-box', 'reveal'],
            ['.section-title', 'reveal'],
            ['.feature-card', 'reveal'],
            ['.download-links', 'reveal'],
            ['.stat', 'reveal'],
            ['.root-card', 'reveal'],
            ['.hero-visual', 'reveal-right'],
            ['.glass-panel', 'reveal-right'],
            ['.cta-card', 'reveal-scale']
        ];

        const targets = [];
        map.forEach(function (pair) {
            document.querySelectorAll(pair[0]).forEach(function (el) { targets.push([el, pair[1]]); });
        });

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (t) { t[0].classList.add('revealed'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                // Toggle on every scroll: animate in when visible, reset when out of view
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                } else {
                    entry.target.classList.remove('revealed');
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        targets.forEach(function (t) {
            const el = t[0];
            const variant = t[1];
            el.classList.add(variant);
            // Stagger items that share a parent (grids / lists)
            const parent = el.parentElement;
            if (parent) {
                const siblings = Array.prototype.filter.call(
                    parent.children,
                    function (c) { return c.classList.contains(variant); }
                );
                const idx = siblings.indexOf(el);
                if (idx > 0) el.style.setProperty('--reveal-delay', (idx * 0.12) + 's');
            }
            observer.observe(el);
        });
    }

    /* ---------- 5. Back to Top Button ---------- */
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Kembali ke atas halaman');
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

    /* ---------- 6. Cursor Glow Tracking ---------- */
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
        }, { passive: true });

        function loop() {
            x += (tx - x) * 0.15;
            y += (ty - y) * 0.15;
            glow.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- 7. Typing Effect pada Heading ---------- */
    function initTyping() {
        const el = document.querySelector('.hero h1');
        if (!el || prefersReducedMotion) return;

        const originalText = el.textContent.trim();
        el.textContent = '';
        el.classList.add('typing');

        let i = 0;
        function type() {
            if (i <= originalText.length) {
                el.textContent = originalText.slice(0, i);
                i++;
                setTimeout(type, 55);
            } else {
                el.classList.remove('typing');
            }
        }
        setTimeout(type, 1000);
    }

    /* ---------- 8. 3D Tilt Effect pada Kartu ---------- */
    function initTilt() {
        if (prefersReducedMotion || isTouch) return;

        const cards = document.querySelectorAll('.method-card, .feature-card');
        cards.forEach(function (card) {
            card.classList.add('tilt');
            card.addEventListener('mousemove', function (e) {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /* ---------- 9. Toast Notification Handler ---------- */
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
                showToast('Mengalihkan ke server unduhan resmi…');
            });
        });
    }

    /* ---------- 10. Active Nav & Smooth Anchor Scroll ---------- */
    function initNavigation() {
        const header = document.getElementById('mainHeader');
        let lastScroll = 0;

        window.addEventListener('scroll', function () {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (header) {
                if (currentScroll > lastScroll && currentScroll > 80) {
                    header.classList.add('nav-hidden');
                } else {
                    header.classList.remove('nav-hidden');
                }
            }
            lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        }, { passive: true });

        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || !targetId.startsWith('#')) return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 64;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }

    /* ---------- 11. Animated Counters pada Stat ---------- */
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
                const step = Math.max(1, Math.ceil(target / 40));
                const timer = setInterval(function () {
                    cur += step;
                    if (cur >= target) {
                        cur = target;
                        clearInterval(timer);
                    }
                    el.textContent = cur + suffix;
                }, 30);

                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    /* ---------- 12. Mobile Hamburger Nav & Theme Toggle ---------- */
    function initMobileNavAndTheme() {
        const toggle = document.getElementById('navToggle');
        const nav = document.getElementById('primaryNav');
        const themeToggle = document.getElementById('themeToggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch (e) {}
            });
        }

        if (!toggle || !nav) return;

        function close() {
            toggle.classList.remove('is-open');
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Buka menu navigasi');
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('click', function (e) {
            if (!nav.classList.contains('is-open')) return;
            const header = document.querySelector('header');
            if (header && !header.contains(e.target)) close();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 820) close();
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
        });
    }

    /* ---------- 13. Scroll Progress Bar ---------- */
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;
        function update() {
            const h = document.documentElement;
            const scrolled = h.scrollTop || document.body.scrollTop;
            const max = h.scrollHeight - h.clientHeight;
            const pct = max > 0 ? (scrolled / max) * 100 : 0;
            bar.style.width = pct + '%';
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    /* ---------- 14. Pengguna Online (Realtime Simulasi) ---------- */
    function initOnlineUsers() {
        const el = document.getElementById('onlineCount');
        if (!el) return;

        // Tanpa backend, angka disimulasikan berfluktuasi tiap beberapa detik
        // untuk memberi kesan "realtime". Ganti dengan WebSocket/API bila ada server.
        let count = 120 + Math.floor(Math.random() * 80);
        const min = 80, max = 320;

        function render() {
            el.textContent = count.toLocaleString('id-ID');
        }
        render();

        function tick() {
            const delta = Math.floor(Math.random() * 11) - 5; // -5 s.d +5
            count = Math.min(max, Math.max(min, count + delta));
            render();
            setTimeout(tick, 2500 + Math.random() * 2500);
        }
        setTimeout(tick, 2500);
    }

    /* ---------- Init All Modules ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        initVideoLoaders();
        initDynamicSnow();
        initIntroOverlay();
        initScrollReveal();
        initBackToTop();
        initCursorGlow();
        initTyping();
        initTilt();
        initToast();
        initNavigation();
        initCounters();
        initMobileNavAndTheme();
        initScrollProgress();
        initOnlineUsers();
    });
})();
