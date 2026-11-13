/* ============================================================
   script.js — Ultra-Fast & Modern UI Controller
   ============================================================ */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    const TUTORIAL_IDS = ['blackbox-tutorial', 'gameassistant-tutorial', 'root-tutorial'];

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

            const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            el.style.backgroundImage = `linear-gradient(to bottom, rgba(3,6,15,0.25), rgba(3,6,15,0.72)), url(${thumbUrl})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';

            el.addEventListener('click', function handler() {
                el.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="YouTube video tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="aspect-ratio: 16/9; display: block; width: 100%; height: 100%; background: #000;"></iframe>`;
                el.classList.add('is-playing');
                el.style.backgroundImage = 'none';
                el.removeEventListener('click', handler);
            });
        }

        createVideoEmbed('videoPreview', 'https://youtu.be/nFo4WVc9ZX4?si=lo-ekDOfVK6zr8ZT');
        createVideoEmbed('videoPreview2', 'https://youtu.be/XmzBGlpB5Eg?si=SEooZMPBqBpqjsly');
    }

    /* ---------- 2. Subtle Ambient Particles ---------- */
    function initDynamicSnow() {
        const snowLayer = document.getElementById('snowLayer');
        if (!snowLayer || prefersReducedMotion || isTouchDevice) return;

        const count = 10;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.style.left = (Math.random() * 94 + 3) + '%';
            dot.style.animationDuration = (Math.random() * 8 + 10) + 's';
            dot.style.animationDelay = (Math.random() * 5) + 's';
            fragment.appendChild(dot);
        }
        snowLayer.appendChild(fragment);
    }

    /* ---------- 3. Tutorial Visibility & Switching ---------- */
    function hideTutorialSections() {
        TUTORIAL_IDS.forEach(function (id) {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function showTutorialSection(id) {
        TUTORIAL_IDS.forEach(function (otherId) {
            const el = document.getElementById(otherId);
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });

        const target = document.getElementById(id);
        if (target) {
            target.style.display = '';
            target.removeAttribute('aria-hidden');
            // Ensure cards inside newly shown section animate in smoothly
            requestAnimationFrame(function () {
                target.querySelectorAll('.reveal, .reveal-scale, .reveal-right').forEach(function (item) {
                    item.classList.add('revealed');
                });
            });
        }
    }

    function scrollToSection(id) {
        const target = document.getElementById(id);
        const header = document.getElementById('mainHeader');
        if (!target) return;
        const headerHeight = header ? header.offsetHeight : 64;
        requestAnimationFrame(function () {
            const pos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
            window.scrollTo({ top: pos, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- 4. Intro Overlay & Choice Modal ---------- */
    let openChoiceModalFn = null;

    function initChoiceModal() {
        const modal = document.getElementById('choiceModal');
        if (!modal) return;

        const stepRoot = document.getElementById('stepRoot');
        const stepNoRoot = document.getElementById('stepNoRoot');
        const backBtn = document.getElementById('choiceBack');
        const closeBtn = document.getElementById('choiceModalClose');
        const backdrop = document.getElementById('choiceBackdrop');
        const openBtn = document.getElementById('openChoiceModalBtn');

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

        openChoiceModalFn = openModal;

        modal.querySelectorAll('[data-choice]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const choice = btn.getAttribute('data-choice');
                if (choice === 'root') {
                    showTutorialSection('root-tutorial');
                    closeModal();
                    setTimeout(function () { scrollToSection('root-tutorial'); }, 120);
                } else if (choice === 'noroot') {
                    // Blackbox disembunyikan sementara: langsung arahkan ke Game Assistant
                    showTutorialSection('gameassistant-tutorial');
                    closeModal();
                    setTimeout(function () { scrollToSection('gameassistant-tutorial'); }, 120);
                }
            });
        });

        modal.querySelectorAll('[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = btn.getAttribute('data-target');
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

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);
        if (openBtn) openBtn.addEventListener('click', openModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
                closeModal();
            }
        });
    }

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
            }, 500);
        }

        const enterBtn = document.getElementById('introEnterBtn');
        if (enterBtn) {
            enterBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                dismissOverlay();
                setTimeout(function () {
                    if (openChoiceModalFn) openChoiceModalFn();
                }, 320);
            });
        }

        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                dismissOverlay();
                setTimeout(function () {
                    if (openChoiceModalFn) openChoiceModalFn();
                }, 320);
            }
        });

        document.addEventListener('keydown', function onIntroKey(e) {
            if (!document.body.contains(overlay)) {
                document.removeEventListener('keydown', onIntroKey);
                return;
            }
            if (e.key === 'Enter' && !overlay.classList.contains('intro-hidden')) {
                e.preventDefault();
                dismissOverlay();
                setTimeout(function () {
                    if (openChoiceModalFn) openChoiceModalFn();
                }, 320);
                document.removeEventListener('keydown', onIntroKey);
            }
        });
    }

    function initTutorialSwitchers() {
        document.querySelectorAll('[data-switch-tutorial]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const targetId = btn.getAttribute('data-switch-tutorial');
                if (!targetId) return;
                showTutorialSection(targetId);
                setTimeout(function () { scrollToSection(targetId); }, 80);
            });
        });
    }

    /* ---------- 5. Image Lightbox Preview ---------- */
    function initLightbox() {
        const modal = document.getElementById('lightboxModal');
        const backdrop = document.getElementById('lightboxBackdrop');
        const closeBtn = document.getElementById('lightboxClose');
        const imgEl = document.getElementById('lightboxImg');
        const captionEl = document.getElementById('lightboxCaption');
        if (!modal || !imgEl) return;

        function openLightbox(src, alt) {
            imgEl.src = src;
            imgEl.alt = alt || '';
            if (captionEl) captionEl.textContent = alt || '';
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            imgEl.src = '';
        }

        document.querySelectorAll('[data-lightbox]').forEach(function (wrap) {
            wrap.addEventListener('click', function () {
                const img = wrap.querySelector('img');
                if (img && img.src) {
                    openLightbox(img.src, img.alt);
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (backdrop) backdrop.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
                closeLightbox();
            }
        });
    }

    /* ---------- 6. Scroll Reveal ---------- */
    function initScrollReveal() {
        const map = [
            ['.hero-note', 'reveal'],
            ['.method-card', 'reveal'],
            ['.tutorial-card', 'reveal-scale'],
            ['.feature-card', 'reveal'],
            ['.download-links', 'reveal'],
            ['.stat', 'reveal'],
            ['.root-card', 'reveal'],
            ['.hero-visual', 'reveal-right']
        ];

        const targets = [];
        map.forEach(function (pair) {
            document.querySelectorAll(pair[0]).forEach(function (el) {
                targets.push([el, pair[1]]);
            });
        });

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (t) { t[0].classList.add('revealed'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        targets.forEach(function (t) {
            t[0].classList.add(t[1]);
            observer.observe(t[0]);
        });
    }

    /* ---------- 7. Back to Top with Circular Progress Ring ---------- */
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Kembali ke atas halaman');
        btn.innerHTML = `
            <svg class="back-to-top-ring" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="21"></circle>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>
        `;
        document.body.appendChild(btn);

        const ringCircle = btn.querySelector('.back-to-top-ring circle');
        const circumference = 2 * Math.PI * 21; // ~131.95
        if (ringCircle) {
            ringCircle.style.strokeDasharray = circumference;
            ringCircle.style.strokeDashoffset = circumference;
        }

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        let ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const scrolled = window.pageYOffset || document.documentElement.scrollTop;
                    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const ratio = max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0;

                    if (scrolled > 300) {
                        btn.classList.add('show');
                    } else {
                        btn.classList.remove('show');
                    }

                    if (ringCircle) {
                        ringCircle.style.strokeDashoffset = circumference * (1 - ratio);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---------- 8. Cursor Glow & Card Spotlight ---------- */
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

        document.querySelectorAll('.spotlight-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
            }, { passive: true });
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
            t.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
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

    /* ---------- 10. Active Nav & Header Auto-hide ---------- */
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
                const sectionId = targetId.substring(1);
                if (TUTORIAL_IDS.indexOf(sectionId) !== -1) {
                    showTutorialSection(sectionId);
                }
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    scrollToSection(sectionId);
                }
            });
        });
    }

    /* ---------- 11. Animated Counters ---------- */
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
                const step = Math.max(1, Math.ceil(target / 24));
                const timer = setInterval(function () {
                    cur += step;
                    if (cur >= target) {
                        cur = target;
                        clearInterval(timer);
                    }
                    el.textContent = cur + suffix;
                }, 32);

                observer.unobserve(el);
            });
        }, { threshold: 0.35 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    /* ---------- 12. Mobile Navigation & Theme Toggle ---------- */
    function initMobileNavAndTheme() {
        const toggle = document.getElementById('navToggle');
        const nav = document.getElementById('primaryNav');
        const themeToggle = document.getElementById('themeToggle');
        const metaTheme = document.querySelector('meta[name="theme-color"]');

        function syncThemeMeta(theme) {
            if (metaTheme) {
                metaTheme.setAttribute('content', theme === 'light' ? '#f5f7fb' : '#03060f');
            }
        }

        syncThemeMeta(document.documentElement.getAttribute('data-theme') || 'dark');

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                syncThemeMeta(next);
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

        nav.querySelectorAll('a, button:not(#themeToggle)').forEach(function (item) {
            item.addEventListener('click', close);
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

    /* ---------- 13. Scroll Progress Bar ---------- */
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

    /* ---------- 14. Pengguna Online ---------- */
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
        hideTutorialSections();
        initVideoLoaders();
        initDynamicSnow();
        initChoiceModal();
        initIntroOverlay();
        initTutorialSwitchers();
        initLightbox();
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
