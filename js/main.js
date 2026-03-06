/* ============================================
   RACHIT BHARDWAJ — PORTFOLIO JS
   Scroll animations, nav, counters, parallax
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Intersection Observer: Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve — let them stay visible
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Tubelight Navbar: Click Handler ---
    const tubelightLinks = document.querySelectorAll('.tubelight-nav-link');
    const lampTemplate = document.querySelector('.tubelight-lamp');

    function setActiveNav(activeLink) {
        tubelightLinks.forEach(link => {
            // Remove lamp from all links
            const existingLamp = link.querySelector('.tubelight-lamp');
            if (existingLamp) existingLamp.remove();
            link.classList.remove('active');
        });
        // Add active class and lamp to the target
        activeLink.classList.add('active');
        if (lampTemplate) {
            const lamp = lampTemplate.cloneNode(true);
            activeLink.appendChild(lamp);
        }
    }

    tubelightLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActiveNav(link);
        });
    });

    // --- Premium Smooth Scroll (slow, eased) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const targetPos = target.getBoundingClientRect().top + window.scrollY - 80;
                const startPos = window.scrollY;
                const distance = targetPos - startPos;
                const duration = 800; // snappy premium scroll
                let startTime = null;

                function easeInOutCubic(t) {
                    return t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                }

                function scrollStep(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = easeInOutCubic(progress);
                    window.scrollTo(0, startPos + distance * ease);
                    if (progress < 1) {
                        requestAnimationFrame(scrollStep);
                    }
                }

                requestAnimationFrame(scrollStep);
            }
        });
    });

    // --- Stat Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, 0, target, 1500);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.round(start + (end - start) * easedProgress);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // --- Skill Bar Animation ---
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fills = entry.target.querySelectorAll('.skill-fill');
                fills.forEach((fill, i) => {
                    setTimeout(() => {
                        const w = fill.dataset.width;
                        fill.style.width = w + '%';
                    }, i * 150);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-category').forEach(cat => {
        skillObserver.observe(cat);
    });

    // --- Lazy-load Reel Videos (play only when visible) ---
    const reelVideos = document.querySelectorAll('.reel-card video');
    reelVideos.forEach(video => {
        video.removeAttribute('autoplay');
        video.pause();
    });

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (!video) return;
            if (entry.isIntersecting) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('.reel-card').forEach(card => {
        videoObserver.observe(card);
    });

    // --- Reels Gallery Drag-to-Scroll ---
    const reelsGallery = document.querySelector('.reels-gallery');
    if (reelsGallery) {
        let isDown = false;
        let startX;
        let scrollLeft;

        reelsGallery.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - reelsGallery.offsetLeft;
            scrollLeft = reelsGallery.scrollLeft;
        });

        reelsGallery.addEventListener('mouseleave', () => { isDown = false; });
        reelsGallery.addEventListener('mouseup', () => { isDown = false; });

        reelsGallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - reelsGallery.offsetLeft;
            const walk = (x - startX) * 2;
            reelsGallery.scrollLeft = scrollLeft - walk;
        });
    }

    // --- Card Mouse Tracking (Glow Effect) ---
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // --- Combined Parallax (rAF-throttled) ---
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const allSections = document.querySelectorAll('.section');
    let parallaxTicking = false;

    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.3;
                    const rect = el.parentElement.getBoundingClientRect();
                    if (rect.bottom > 0 && rect.top < window.innerHeight) {
                        el.style.transform = `translateY(${scrollY * speed}px)`;
                    }
                });
                allSections.forEach(sec => {
                    const rect = sec.getBoundingClientRect();
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    if (progress > 0 && progress < 1) {
                        sec.style.setProperty('--parallax-y', `${(progress - 0.5) * 20}px`);
                    }
                });
                parallaxTicking = false;
            });
            parallaxTicking = true;
        }
    }, { passive: true });

    // --- Active Nav Link Highlight (scroll-based) ---
    const sections = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.tubelight-nav-link');

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinkElements.forEach(link => {
                    if (link.dataset.section === id) {
                        setActiveNav(link);
                    }
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(sec => activeObserver.observe(sec));

    // --- Cursor custom trailing effect (desktop only) ---
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.classList.add('cursor-glow');
        cursor.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9990;
            background: radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%);
            will-change: transform;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
        });
    }



});
