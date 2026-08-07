// ============================================
// COFFEE CLHOE - FUNCIONALIDAD
// ============================================

// MÓVIL MENU TOGGLE
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const navLinks = document.querySelectorAll('.nav-link');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

// Cerrar menú móvil al hacer click en un link
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
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
        
        if (scrollY >= (sectionTop - 200)) {
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
// ANIMACIÓN DE ENTRADA PARA ELEMENTOS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos que entran
const elementsToObserve = document.querySelectorAll(
    '.offering-card, .social-card, .detail-item'
);

elementsToObserve.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// CARGAR PRODUCTOS DINÁMICAMENTE (PLACEHOLDER)
// ============================================

// Esto será usado cuando cargues los JSON de productos
function loadProducts() {
    // Placeholder para cuando implementes JSON
    console.log('Estructura lista para cargar productos desde JSON');
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Función para hacer scroll suave a sección específica
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para copiar texto al clipboard (para compartir)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
}

// ============================================
// DETECTAR TEMA DEL SISTEMA (Para futuro dark mode)
// ============================================

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

if (prefersDarkScheme.matches) {
    // Aquí puedes agregar lógica para dark mode en el futuro
    console.log('Sistema prefiere modo oscuro');
}

// ============================================
// LOG DE DESARROLLO
// ============================================

console.log('✨ Coffee Clhoe - Sitio cargado correctamente');
console.log('📍 Ubicación: Calle 20 #25-104, La Ceja, Antioquia');
console.log('☕ Horarios: Lunes a Domingo 2:00 PM - 7:00 PM');
