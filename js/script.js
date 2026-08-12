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
            menuToggle.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
                menuToggle.setAttribute('aria-expanded', false);
            });
        });

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
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ----------------------------------------
    // SCROLL REVEAL
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

    document.querySelectorAll(
        '.offering-card, .detail-item, .whatsapp-contact-btn, .social-card-compact'
    ).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        revealObserver.observe(el);
    });

    // ----------------------------------------
    // DECORACION PANEL
    // Only runs if elements exist (decoracion.html)
    // ----------------------------------------
    const pageWrapper  = document.getElementById('pageWrapper');
    const detailPanel  = document.getElementById('detailPanel');
    const panelClose   = document.getElementById('panelClose');
    const panelImage   = document.getElementById('panelImage');
    const panelName    = document.getElementById('panelName');
    const panelPrice   = document.getElementById('panelPrice');
    const panelDesc    = document.getElementById('panelDescription');
    const btnCotizar   = document.getElementById('btnCotizar');
    const productsGrid = document.getElementById('productsGrid');

    if (productsGrid) {

        const PHONE_CLHOE = '573024601382';
        const PAGE_URL    = window.location.href.split('?')[0];
        let activeCard    = null;

        function setField(el, value) {
            if (value) {
                el.textContent = value;
                el.classList.remove('hidden-field');
            } else {
                el.textContent = '';
                el.classList.add('hidden-field');
            }
        }

        function openPanel(item, cardEl) {
            panelImage.src = item.image;
            panelImage.alt = item.name || 'Producto Clhoe';

            setField(panelName, item.name || null);

            const priceText = item.price
                ? '$ ' + Number(item.price).toLocaleString('es-CO')
                : null;
            setField(panelPrice, priceText);
            setField(panelDesc, item.description || null);

            // WhatsApp message with product reference
            const productRef = item.name
                ? `*${item.name}*`
                : `el producto en esta imagen: ${item.image}`;
            const waMsg = encodeURIComponent(
                `Hola Clhoe! 👋 Estoy viendo su catálogo en línea y me gustaría cotizar ${productRef}.\n\nPágina: ${PAGE_URL}`
            );
            btnCotizar.href = `https://wa.me/${PHONE_CLHOE}?text=${waMsg}`;

            // Highlight card
            if (activeCard) activeCard.classList.remove('active');
            activeCard = cardEl;
            cardEl.classList.add('active');

            // Open panel and shift layout
            detailPanel.classList.add('open');
            pageWrapper.classList.add('panel-open');

            // Reset panel scroll
            detailPanel.querySelector('.panel-body').scrollTop = 0;
        }

        function closePanel() {
            detailPanel.classList.remove('open');
            pageWrapper.classList.remove('panel-open');
            if (activeCard) { activeCard.classList.remove('active'); activeCard = null; }
        }

        if (panelClose) panelClose.addEventListener('click', closePanel);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

        // Load products
        fetch('data/products.json')
            .then(r => {
                if (!r.ok) throw new Error('products.json not found – status ' + r.status);
                return r.json();
            })
            .then(data => {
                productsGrid.innerHTML = '';
                data.muebles.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'product-card';

                    const hasInfo = item.name || item.price;
                    const priceDisplay = item.price
                        ? '$ ' + Number(item.price).toLocaleString('es-CO')
                        : '';

                    card.innerHTML = `
                        <div class="product-image-wrapper">
                            <img class="product-image"
                                 src="${item.image}"
                                 alt="${item.name || 'Producto'}"
                                 loading="lazy">
                        </div>
                        <div class="product-card-info${hasInfo ? ' has-data' : ''}">
                            ${item.name  ? `<p class="product-card-name">${item.name}</p>` : ''}
                            ${item.price ? `<p class="product-card-price">${priceDisplay}</p>` : ''}
                        </div>`;

                    card.addEventListener('click', () => openPanel(item, card));
                    productsGrid.appendChild(card);
                });
            })
            .catch(err => {
                console.error(err);
                productsGrid.innerHTML =
                    '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#888">No se pudieron cargar los productos.</p>';
            });
    }

});
