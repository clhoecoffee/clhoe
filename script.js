// ============================================
// COFFEE CLHOE - FUNCIONALIDAD MEJORADA
// ============================================

// Remover clase loading cuando carga
window.addEventListener('load', () => {
    document.body.classList.remove('loading');
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const navLinks = document.querySelectorAll('.nav-link');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuToggle.style.opacity = mobileMenu.classList.contains('active') ? '0.6' : '1';
    });
}

// Cerrar menú móvil al hacer click en un link
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuToggle.style.opacity = '1';
    });
});

// ============================================
// ACTUALIZAR NAV LINK ACTIVO AL SCROLL
// ============================================

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ============================================
// SMOOTH SCROLL PARA NAVEGACIÓN
// ============================================

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// INTERSECTION OBSERVER - ANIMACIONES AL SCROLL
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos específicos
const elementsToObserve = document.querySelectorAll(
    '.offering-card, .social-card, .detail-item, .about-section'
);

elementsToObserve.forEach(el => {
    if (!el.style.animation) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    }
});

// ============================================
// PARALLAX SCROLL EFFECT
// ============================================

const heroImage = document.querySelector('.hero-image');

window.addEventListener('scroll', () => {
    if (heroImage) {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// ============================================
// SMOOTH ANIMATION AL CARGAR PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Coffee Clhoe - Sitio cargado exitosamente');
    console.log('📍 Ubicación: Calle 20 #25-104, La Ceja, Antioquia');
    console.log('☕ Horarios: Lunes a Domingo 2:00 PM - 7:00 PM');
    
    // Animar elementos al cargar
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'slideInLeft 0.8s ease forwards';
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Scroll a sección específica
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Copiar al clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
}

// ============================================
// LAZY LOADING DE IMÁGENES (cuando tengas fotos reales)
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// HOVER EFFECTS EN MOBILE
// ============================================

if (window.innerWidth <= 768) {
    document.querySelectorAll('.offering-card, .social-card').forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'translateY(-12px)';
            setTimeout(() => {
                card.style.transform = '';
            }, 300);
        });
    });
}

// ============================================
// DETECT DARK MODE PREFERENCE
// ============================================

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
if (prefersDarkScheme.matches) {
    // Para futuras mejoras de dark mode
    console.log('Sistema prefiere modo oscuro');
}
