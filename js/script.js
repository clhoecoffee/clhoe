// ============================================
// COFFEE CLHOE - script.js (Optimizado)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Menú móvil ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        const setMenuState = (open) => {
            mobileMenu.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
        };

        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            setMenuState(!mobileMenu.classList.contains('open'));
        });
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => setMenuState(false));
        });
        document.addEventListener('click', (event) => {
            if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                setMenuState(false);
            }
        });
    }

    // --- Navegación activa ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
    });

    // --- Intersection Observer para animaciones ---
    const revealElements = document.querySelectorAll('.offering-card, .detail-item, .whatsapp-contact-btn, .social-card-compact');
    if ('IntersectionObserver' in window && revealElements.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity .55s ease, transform .55s ease';
            observer.observe(element);
        });
    }

    // --- Products Grid ---
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const detailPanel = document.getElementById('detailPanel');
    const panelClose = document.getElementById('panelClose');
    const panelOverlay = document.getElementById('panelOverlay');
    const panelBody = detailPanel?.querySelector('.panel-body');
    const panelImage = document.getElementById('panelImage');
    const panelName = document.getElementById('panelName');
    const panelPrice = document.getElementById('panelPrice');
    const panelDescription = document.getElementById('panelDescription');
    const btnCotizar = document.getElementById('btnCotizar');
    if (!detailPanel || !panelImage || !panelName || !panelPrice || !panelDescription || !btnCotizar) return;

    const PHONE_CLHOE = '573024601382';
    const PAGE_URL = window.location.href.split('?')[0];
    let activeCard = null;

    const setField = (element, value) => {
        element.textContent = value || '';
        element.classList.toggle('hidden-field', !value);
    };

    const closePanel = () => {
    detailPanel.classList.remove('open');
    panelOverlay?.classList.remove('active');
    if (activeCard) {
        activeCard.classList.remove('active');
        activeCard = null;
    }
    document.body.classList.remove('panel-open');
    // SOLO en móvil evitamos el scroll
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
};

const openPanel = (item, card) => {
    panelImage.src = item.image;
    panelImage.alt = item.name || 'Producto Clhoe';
    setField(panelName, item.name);
    setField(panelPrice, item.price ? '$ ' + Number(item.price).toLocaleString('es-CO') : null);
    setField(panelDescription, item.description);

    const productRef = item.name ? `*${item.name}*` : `el producto en esta imagen: ${item.image}`;
    const message = encodeURIComponent(`Hola Clhoe! Estoy viendo su catálogo en línea y me gustaría cotizar ${productRef}.\n\nPágina: ${PAGE_URL}`);
    btnCotizar.href = `https://wa.me/${PHONE_CLHOE}?text=${message}`;

    if (activeCard) activeCard.classList.remove('active');
    activeCard = card;
    if (activeCard) activeCard.classList.add('active');
    
    detailPanel.classList.add('open');
    panelOverlay?.classList.add('active');
    if (panelBody) panelBody.scrollTop = 0;
    document.body.classList.add('panel-open');
    // SOLO en móvil evitamos el scroll
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
    }
};

// Manejar cambio de tamaño de ventana
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && document.body.classList.contains('panel-open')) {
        document.body.style.overflow = '';
    }
});

    panelClose?.addEventListener('click', closePanel);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && detailPanel.classList.contains('open')) closePanel();
    });

    // Cerrar panel al hacer clic fuera (pero no en productos)
    document.addEventListener('click', event => {
        if (!detailPanel.classList.contains('open')) return;
        if (detailPanel.contains(event.target)) return;
        if (event.target.closest('.product-card')) return;
        closePanel();
    });

    // --- Cargar productos ---
    fetch('data/productos.json')
        .then(response => {
            if (!response.ok) throw new Error(`productos.json no encontrado (${response.status})`);
            return response.json();
        })
        .then(data => {
            productsGrid.replaceChildren();
            const items = data.muebles || [];
            
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                const hasInfo = Boolean(item.name || item.price);
                const priceDisplay = item.price ? '$ ' + Number(item.price).toLocaleString('es-CO') : '';
                
                card.innerHTML = `
                    <div class="product-image-wrapper">
                        <img class="product-image" src="${item.image}" alt="${item.name || 'Producto'}" loading="lazy">
                        <div class="product-card-info${hasInfo ? ' has-data' : ''}">
                            ${item.name ? `<p class="product-card-name">${item.name}</p>` : ''}
                            ${item.price ? `<p class="product-card-price">${priceDisplay}</p>` : ''}
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => openPanel(item, card));
                productsGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error(error);
            productsGrid.innerHTML = '<p class="products-error">No se pudieron cargar los productos.</p>';
        });
});