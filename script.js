/* ============================================================
   script.js — Ultra-Fast & High-Performance UI Controller
   ============================================================ */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

    /* ---------- 1. Pemutar Video YouTube Facade & Lazy Load ---------- */
    function initVideoLoaders() {
        function extractYouTubeId(url) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return match && match[2].length === 11 ? match[2] : null;
        }

        function createVideoEmbed(targetId, videoUrl) {
            const el = document.getElementById(targetId);
            const videoId = extractYouTubeId(videoUrl);
            if (!el || !videoId) return;

            // Buat Facade Tampilan Video (Lebih Cepat & Hemat Memori)
            const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            el.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${thumbUrl})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.style.cursor = 'pointer';

            el.addEventListener('click', function handler() {
                el.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="YouTube video tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="border-radius: 0.85rem; aspect-ratio: 16/9; display: block; width:100%; height:100%; background: #000;"></iframe>`;
                el.removeEventListener('click', handler);
                el.style.backgroundImage = 'none';
            });
        }

        createVideoEmbed('videoPreview', "https://youtu.be/nFo4WVc9ZX4?si=lo-ekDOfVK6zr8ZT");
        createVideoEmbed('videoPreview2', "https://youtu.be/XmzBGlpB5Eg?si=SEooZMPBqBpqjsly");
    }

    /* ---------- 2. Dynamic Particles (Optimized) ---------- */
    function initDynamicSnow() {
        const snowLayer = document.getElementById('snowLayer');
        if (!snowLayer || prefersReducedMotion || isTouchDevice) return;

        const symbols = ['•', '✦'];
        const count = 12; // Hemat DOM node untuk performa maksimal

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.textContent = symbols[i % symbols.length];
            span.style.left = (Math.random() * 95) + '%';
            span.style.animationDuration = (Math.random() * 6 + 7) + 's';
            span.style.animationDelay = (Math.random() * 4) + 's';
            fragment.appendChild(span);
        }
        snowLayer.appendChild(fragment);
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
            }, 600);
        }

        const enterBtn = document.getElementById('introEnterBtn');
        if (enterBtn) {
            enterBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                dismissOverlay();
                setTimeout(function () { initChoiceModal(); }, 350);
            });
        }

        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                dismissOverlay();
                setTimeout(function () { initChoiceModal(); }, 350);
            }
        });
    }

    /* ---------- 3b. Choice Modal: Root / No Root ---------- */

    // Sembunyikan semua section tutorial saat halaman dimuat
    var TUTORIAL_IDS = ['blackbox-tutorial', 'gameassistant-tutorial', 'root-tutorial'];

    function hideTutorialSections() {
        TUTORIAL_IDS.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function showTutorialSection(id) {
        // Sembunyikan semua dulu
        TUTORIAL_IDS.forEach(function (otherId) {
            var el = document.getElementById(otherId);
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });
        // Tampilkan hanya yang dipilih
        var target = document.getElementById(id);
        if (target) {
            target.style.display = '';
            target.removeAttribute('aria-hidden');
        }
    }

    function initChoiceModal() {
        const modal = document.getElementById('choiceModal');
        if (!modal) return;

        const stepRoot = document.getElementById('stepRoot');
        const stepNoRoot = document.getElementById('stepNoRoot');
        const backBtn = document.getElementById('choiceBack');
        const closeBtn = document.getElementById('choiceModalClose');
        const backdrop = document.getElementById('choiceBackdrop');
        const openBtn = document.getElementById('openChoiceModalBtn');
        const header = document.getElementById('mainHeader');

        function openModal() {
            if (stepRoot) stepRoot.hidden = false;
            if (stepNoRoot) stepNoRoot.hidden = true;
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            const card = modal.querySelector('.choice-card');
            if (card) card.focus();
        }

        function closeModal() {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            if (stepRoot) stepRoot.hidden = false;
            if (stepNoRoot) stepNoRoot.hidden = true;
        }

        function scrollToSection(id) {
            var target = document.getElementById(id);
            if (!target) return;
            var headerHeight = header ? header.offsetHeight : 64;
            requestAnimationFrame(function () {
                var pos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
                window.scrollTo({ top: pos, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }

        if (modal.hasAttribute('hidden')) {
            openModal();
        }

        if (!modal.dataset.initialized) {
            modal.dataset.initialized = 'true';

            modal.querySelectorAll('[data-choice]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var choice = btn.getAttribute('data-choice');
                    if (choice === 'root') {
                        showTutorialSection('root-tutorial');
                        closeModal();
                        setTimeout(function () { scrollToSection('root-tutorial'); }, 120);
                    } else {
                        if (stepRoot) stepRoot.hidden = true;
                        if (stepNoRoot) stepNoRoot.hidden = false;
                    }
                });
            });

            modal.querySelectorAll('[data-target]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.getAttribute('data-target');
                    showTutorialSection(id);
                    closeModal();
                    setTimeout(function () { scrollToSection(id); }, 120);
                });
            });

            if (backBtn) {
                backBtn.addEventListener('click', function () {
                    if (stepNoRoot) stepNoRoot.hidden = true;
                    if (stepRoot) stepRoot.hidden = false;
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }

            if (backdrop) {
                backdrop.addEventListener('click', closeModal);
            }

            if (openBtn) {
                openBtn.addEventListener('click', openModal);
            }

            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
                    closeModal();
                }
            });
        }
    }

    /* ---------- 4. Scroll Reveal (Fast & Unobserve Once) ---------- */
    function initScrollReveal() {
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
            ['.glass-panel', 'reveal-right']
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
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Unobserve agar tidak makan resource saat scroll balik
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (t) {
            const el = t[0];
            const variant = t[1];
            el.classList.add(variant);
            observer.observe(el);
        });
    }

    /* ---------- 5. Back to Top Button ---------- */
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Kembali ke atas halaman');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        let ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.pageYOffset > 350) {
                        btn.classList.add('show');
                    } else {
                        btn.classList.remove('show');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---------- 6. Lightweight Cursor Glow Tracking ---------- */
    function initCursorGlow() {
        if (prefersReducedMotion || isTouchDevice) return;

        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        let ticking = false;
        window.addEventListener('mousemove', function (e) {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---------- 7. Toast Notification Handler ---------- */
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
                showToast('Mengalihkan ke tautan unduhan resmi…');
            });
        });
    }

    /* ---------- 8. Active Nav & Header Auto-hide ---------- */
    function initNavigation() {
        const header = document.getElementById('mainHeader');
        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                    if (header) {
                        if (currentScroll > lastScroll && currentScroll > 100) {
                            header.classList.add('nav-hidden');
                        } else {
                            header.classList.remove('nav-hidden');
                        }
                    }
                    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
                    ticking = false;
                });
                ticking = true;
            }
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

    /* ---------- 9. Animated Counters pada Stat ---------- */
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
                const step = Math.max(1, Math.ceil(target / 25));
                const timer = setInterval(function () {
                    cur += step;
                    if (cur >= target) {
                        cur = target;
                        clearInterval(timer);
                    }
                    el.textContent = cur + suffix;
                }, 35);

                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    /* ---------- 10. Mobile Navigation & Theme Toggle ---------- */
    function initMobileNavAndTheme() {
        const toggle = document.getElementById('navToggle');
        const nav = document.getElementById('primaryNav');
        const themeToggle = document.getElementById('themeToggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch (e) { }
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
    }

    /* ---------- 11. Scroll Progress Bar ---------- */
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;
        let ticking = false;

        function update() {
            const h = document.documentElement;
            const scrolled = h.scrollTop || document.body.scrollTop;
            const max = h.scrollHeight - h.clientHeight;
            const pct = max > 0 ? (scrolled / max) * 100 : 0;
            bar.style.width = pct + '%';
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    update();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        update();
    }

    /* ---------- 12. Pengguna Online (Simulasi Smooth) ---------- */
    function initOnlineUsers() {
        const el = document.getElementById('onlineCount');
        if (!el) return;

        let count = 145 + Math.floor(Math.random() * 50);
        function render() {
            el.textContent = count.toLocaleString('id-ID');
        }
        render();

        setInterval(function () {
            const delta = Math.floor(Math.random() * 7) - 3;
            count = Math.min(350, Math.max(90, count + delta));
            render();
        }, 4000);
    }

    /* ---------- Init Everything ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        hideTutorialSections(); // Sembunyikan semua section sampai user pilih metode
        initVideoLoaders();
        initDynamicSnow();
        initIntroOverlay();
        initScrollReveal();
        initBackToTop();
        initCursorGlow();
        initToast();
        initNavigation();
        initCounters();
        initMobileNavAndTheme();
        initScrollProgress();
        initOnlineUsers();
    });
})();
