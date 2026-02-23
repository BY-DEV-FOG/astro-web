document.addEventListener('DOMContentLoaded', function () {
    // Inicializar AOS
    if (window.AOS) {
        AOS.init({
            duration: 900,
            once: true,
            easing: 'ease-out-cubic',
            offset: 100
        });
    }

    // Toggle menú móvil
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('block');
            menuBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        });

        // Cerrar menú al seleccionar un enlace
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('block');
            menuBtn.setAttribute('aria-expanded', 'false');
        }));
    }

    // Navegación activa por scroll
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-nav') === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Animated counter for stats
    function animateCounter(element, target, duration = 2000) {
        const targetText = target.toString();
        const numberMatch = targetText.match(/[\d.]+/);
        const targetNumber = numberMatch ? parseFloat(numberMatch[0]) : 0;

        // Extract prefix (like +) and suffix (like %)
        const prefix = targetText.substring(0, targetText.indexOf(numberMatch[0]));
        const suffix = targetText.substring(targetText.indexOf(numberMatch[0]) + numberMatch[0].length);

        const startValue = 0;
        let startTime = null;

        function update(currentTime) {
            if (startTime === null) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                const value = Math.floor(startValue + (targetNumber - startValue) * progress);
                // Check if target has decimals (like 99.9%)
                const isDecimal = targetText.includes('.');
                const displayValue = isDecimal ? (value + (targetNumber - value) * progress).toFixed(1) : value;
                element.textContent = prefix + displayValue + suffix;
                requestAnimationFrame(update);
            } else {
                element.textContent = targetText;
            }
        }

        requestAnimationFrame(update);
    }

    // Trigger stats animation when section is visible
    const statsSection = document.querySelector('[aria-label="Stats"]');
    if (statsSection && 'IntersectionObserver' in window) {
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    entry.target.querySelectorAll('p:first-child').forEach(stat => {
                        const text = stat.textContent.trim();
                        animateCounter(stat, text);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // Lazy load de imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Performance: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedUpdate = debounce(updateActiveNav, 100);
    window.addEventListener('scroll', debouncedUpdate);

    // Add parallax effect to hero blob on scroll
    const heroSection = document.querySelector('[aria-label="Hero section"]');
    const blob = document.querySelector('.blob');

    if (heroSection && blob && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                blob.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
});
