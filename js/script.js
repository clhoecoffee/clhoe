// ============================================
// COFFEE CLHOE - script.js (Masonry + Swiper + Fixes)
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

    // --- Products Grid con Masonry ---
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const detailPanel = document.getElementById('detailPanel');
    const panelClose = document.getElementById('panelClose');
    const panelOverlay = document.getElementById('panelOverlay');
    const panelBody = detailPanel?.querySelector('.panel-body');
    const panelName = document.getElementById('panelName');
    const panelPrice = document.getElementById('panelPrice');
    const panelDescription = document.getElementById('panelDescription');
    const btnCotizar = document.getElementById('btnCotizar');
    
    // Swiper elements
    const swiperWrapper = document.getElementById('swiperWrapper');
    const swiperContainer = document.getElementById('swiperContainer');
    const swiperPrev = document.getElementById('swiperPrev');
    const swiperNext = document.getElementById('swiperNext');
    
    if (!detailPanel || !panelName || !panelPrice || !panelDescription || !btnCotizar) return;

    const PHONE_CLHOE = '573024601382';
    const PAGE_URL = window.location.href.split('?')[0];
    let activeCard = null;
    let masonryInstance = null;
    let swiperInstance = null;
    let allProducts = [];
    let currentGroupProducts = [];
    let currentProductIndex = 0;

    const setField = (element, value) => {
        element.textContent = value || '';
        element.classList.toggle('hidden-field', !value);
    };

    // --- Update panel content based on product data ---
    const updatePanelContent = (product) => {
        setField(panelName, product.name);
        setField(panelPrice, product.price ? '$ ' + Number(product.price).toLocaleString('es-CO') : null);
        setField(panelDescription, product.description);

        // Update WhatsApp link
        const productRef = product.name ? `*${product.name}*` : `el producto en esta imagen`;
        const message = encodeURIComponent(`Hola Clhoe! Estoy viendo su catálogo en línea y me gustaría cotizar ${productRef}.\n\nPágina: ${PAGE_URL}`);
        btnCotizar.href = `https://wa.me/${PHONE_CLHOE}?text=${message}`;
    };

    // --- Find products in the same group ---
    const getGroupProducts = (product, allProducts) => {
        if (!product.group) {
            return [product];
        }
        return allProducts.filter(p => p.group === product.group);
    };

    // --- Re-layout Masonry helper ---
    const relayoutMasonry = () => {
        setTimeout(() => {
            if (masonryInstance) {
                masonryInstance.layout();
            }
        }, 50);
    };

    // --- Close panel ---
    const closePanel = () => {
        detailPanel.classList.remove('open');
        panelOverlay?.classList.remove('active');
        if (activeCard) {
            activeCard.classList.remove('active');
            activeCard = null;
        }
        document.body.classList.remove('panel-open');
        if (window.innerWidth <= 768) {
            document.body.style.overflow = '';
        }
        
        // Re-layout Masonry after panel closes
        relayoutMasonry();
        
        // Destroy Swiper instance
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
        if (swiperWrapper) {
            swiperWrapper.innerHTML = '';
        }
        currentGroupProducts = [];
        currentProductIndex = 0;
    };

    // --- Open panel with product ---
    const openPanel = (product, card) => {
        // Find all products in the same group
        currentGroupProducts = getGroupProducts(product, allProducts);
        currentProductIndex = currentGroupProducts.findIndex(p => p.id === product.id);
        if (currentProductIndex === -1) currentProductIndex = 0;

        // Build Swiper slides
        if (swiperWrapper) {
            swiperWrapper.innerHTML = '';
            currentGroupProducts.forEach((p, index) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.dataset.index = index;
                slide.innerHTML = `<img src="${p.image}" alt="${p.name || 'Producto'}" loading="lazy">`;
                swiperWrapper.appendChild(slide);
            });
        }

        // Update panel content for current product
        updatePanelContent(product);

        // Open panel
        if (activeCard) activeCard.classList.remove('active');
        activeCard = card;
        if (activeCard) activeCard.classList.add('active');
        
        detailPanel.classList.add('open');
        panelOverlay?.classList.add('active');
        if (panelBody) panelBody.scrollTop = 0;
        document.body.classList.add('panel-open');
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }

        // Re-layout Masonry after panel opens
        relayoutMasonry();

        // Initialize Swiper after a brief delay
        setTimeout(() => {
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }

            const hasMultiple = currentGroupProducts.length > 1;

            swiperInstance = new Swiper(swiperContainer, {
                initialSlide: currentProductIndex,
                loop: hasMultiple,
                slidesPerView: 1,
                centeredSlides: true,
                speed: 300,
                navigation: {
                    nextEl: swiperNext,
                    prevEl: swiperPrev,
                },
                on: {
                    slideChange: function() {
                        const realIndex = this.realIndex;
                        const product = currentGroupProducts[realIndex];
                        if (product) {
                            updatePanelContent(product);
                        }
                    }
                }
            });

            // If only one slide, hide arrows
            if (!hasMultiple) {
                swiperPrev.style.display = 'none';
                swiperNext.style.display = 'none';
            } else {
                swiperPrev.style.display = 'flex';
                swiperNext.style.display = 'flex';
            }

        }, 50);
    };

    // --- Window resize handler ---
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && document.body.classList.contains('panel-open')) {
            document.body.style.overflow = '';
        }
    });

    // --- Event listeners ---
    panelClose?.addEventListener('click', closePanel);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && detailPanel.classList.contains('open')) closePanel();
    });

    document.addEventListener('click', event => {
        if (!detailPanel.classList.contains('open')) return;
        if (detailPanel.contains(event.target)) return;
        if (event.target.closest('.product-card')) return;
        closePanel();
    });

    // --- Cargar productos y activar Masonry ---
    fetch('data/productos.json')
        .then(response => {
            if (!response.ok) throw new Error(`productos.json no encontrado (${response.status})`);
            return response.json();
        })
        .then(data => {
            productsGrid.replaceChildren();
            allProducts = data.muebles || [];
            
            allProducts.forEach(item => {
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

            imagesLoaded(productsGrid, function() {
                if (masonryInstance) {
                    masonryInstance.destroy();
                }
                masonryInstance = new Masonry(productsGrid, {
                    itemSelector: '.product-card',
                    columnWidth: '.product-card',
                    percentPosition: true,
                    gutter: 12
                });
                setTimeout(() => {
                    masonryInstance.layout();
                }, 100);
            });

        })
        .catch(error => {
            console.error(error);
            productsGrid.innerHTML = '<p class="products-error">No se pudieron cargar los productos.</p>';
        });
});