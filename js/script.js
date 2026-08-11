// ============================================
// COFFEE CLHOE - script.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // MOBILE MENU TOGGLE
    // ----------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
            // Switch icon
            menuToggle.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        // Close when a link is clicked
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
                menuToggle.setAttribute('aria-expanded', false);
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }

    // ----------------------------------------
    // ACTIVE NAV LINK (based on current page)
    // ----------------------------------------
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ----------------------------------------
    // SCROLL REVEAL (Intersection Observer)
    // ----------------------------------------
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.offering-card, .detail-item, .whatsapp-contact-btn, .social-card-compact').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        revealObserver.observe(el);
    });

    // ----------------------------------------
    // PRODUCT MODAL (decoracion.html)
    // ----------------------------------------
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalImg = document.getElementById('modalImage');

    function openModal(src) {
        if (!modal) return;
        modalImg.src = src;
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Load products grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        fetch('data/products.json')
            .then(r => {
                if (!r.ok) throw new Error('products.json not found');
                return r.json();
            })
            .then(data => {
                productsGrid.innerHTML = '';
                data.muebles.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <div class="product-image-wrapper">
                            <img class="product-image" src="${item.image}" alt="Producto ${item.id}" loading="lazy">
                        </div>`;
                    card.addEventListener('click', () => openModal(item.image));
                    productsGrid.appendChild(card);
                });
            })
            .catch(err => {
                console.error('Error loading products:', err);
                productsGrid.innerHTML = '<p style="text-align:center;padding:3rem;color:#888">No se pudieron cargar los productos.</p>';
            });
    }

});