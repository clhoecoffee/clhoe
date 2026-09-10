// ============================================
// COFFEE CLHOE - script.js
// CSS Grid Masonry + Swiper + Filters
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // MENU MÓVIL
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle && mobileMenu) {
        const setMenuState = (open) => {
            mobileMenu.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
        };
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenuState(!mobileMenu.classList.contains('open'));
        });
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => setMenuState(false));
        });
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                setMenuState(false);
            }
        });
    }

    // ==========================================
    // NAV LINK ACTIVO
    // ==========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
    });

    // ==========================================
    // REVEAL ANIMATIONS
    // ==========================================
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
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity .55s ease, transform .55s ease';
            observer.observe(el);
        });
    }

    // ==========================================
    // GRID SETUP
    // ==========================================
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const ROW_UNIT = 8;
    const GAP = 12;
    const WIDE_RATIO = 1.5;

    // ==========================================
    // ELEMENT REFERENCES
    // ==========================================
    const pageWrapper    = document.getElementById('pageWrapper');
    const detailPanel    = document.getElementById('detailPanel');
    const panelClose     = document.getElementById('panelClose');
    const panelOverlay   = document.getElementById('panelOverlay');
    const panelBody      = document.getElementById('panelBody');
    const panelName      = document.getElementById('panelName');
    const panelPrice     = document.getElementById('panelPrice');
    const panelDescription = document.getElementById('panelDescription');
    const btnCotizar     = document.getElementById('btnCotizar');

    const swiperWrapper  = document.getElementById('swiperWrapper');
    const swiperContainer = document.getElementById('swiperContainer');
    const swiperPrev     = document.getElementById('swiperPrev');
    const swiperNext     = document.getElementById('swiperNext');

    // Filters
    const filtersToggle  = document.getElementById('filtersToggle');
    const filtersDrawer  = document.getElementById('filtersDrawer');
    const filtersOverlay = document.getElementById('filtersOverlay');
    const filtersClose   = document.getElementById('filtersClose');
    const filtersBody    = document.getElementById('filtersBody');
    const filtersApply   = document.getElementById('filtersApply');
    const filtersReset   = document.getElementById('filtersReset');
    const filtersClear   = document.getElementById('filtersClear');
    const filtersCount   = document.getElementById('filtersCount');
    const productsEmpty  = document.getElementById('productsEmpty');

    const PHONE_CLHOE = '573024601382';
    const PAGE_URL = window.location.href.split('?')[0];

    // ==========================================
    // STATE
    // ==========================================
    let allProducts = [];
    let filteredProducts = [];
    let activeCard = null;
    let swiperInstance = null;
    let currentGroupProducts = [];
    let currentProductIndex = 0;
    let selectedFilters = new Set();
    let pendingFilters = new Set();
    let layoutRafId = null;

    // ==========================================
    // HELPERS
    // ==========================================
    const setField = (el, value) => {
        el.textContent = value || '';
        el.classList.toggle('hidden-field', !value);
    };

    const formatPrice = (p) => p ? '$ ' + Number(p).toLocaleString('es-CO') : '';

    // ==========================================
    // GRID LAYOUT - calculate row spans for masonry
    // ==========================================
    const layoutGrid = () => {
        const cards = productsGrid.querySelectorAll('.product-card:not(.filtered-out)');
        if (!cards.length) return;

        const gridWidth = productsGrid.clientWidth;
        const styles = getComputedStyle(productsGrid);
        const cols = styles.gridTemplateColumns.split(' ').filter(Boolean).length;
        const isMobile = window.innerWidth <= 768;

        if (!cols || !gridWidth) return;

        const colWidth = (gridWidth - (cols - 1) * GAP) / cols;

        cards.forEach(card => {
            const img = card.querySelector('.product-image');
            const ratio = (img && img.naturalWidth && img.naturalHeight)
                ? img.naturalWidth / img.naturalHeight
                : 1;

            // Span 2 columns if wide (and not on smallest mobile where cols=2 might overflow)
            const shouldSpan = ratio >= WIDE_RATIO && cols >= 3;
            const spanCols = shouldSpan ? 2 : 1;

            const itemWidth = spanCols * colWidth + (spanCols - 1) * GAP;
            const itemHeight = itemWidth / ratio;
            const rowSpan = Math.max(1, Math.ceil((itemHeight + GAP) / (ROW_UNIT + GAP)));

            card.style.gridColumnEnd = `span ${spanCols}`;
            card.style.gridRowEnd = `span ${rowSpan}`;
        });
    };

    // Smoothly re-layout during the CSS transition (400ms)
    const smoothRelayout = () => {
        if (layoutRafId) cancelAnimationFrame(layoutRafId);
        const duration = 420;
        const start = performance.now();
        const tick = (now) => {
            layoutGrid();
            if (now - start < duration) {
                layoutRafId = requestAnimationFrame(tick);
            } else {
                layoutGrid();
                layoutRafId = null;
            }
        };
        layoutRafId = requestAnimationFrame(tick);
    };

    // ==========================================
    // PANEL CONTENT
    // ==========================================
    const updatePanelContent = (product) => {
        setField(panelName, product.name);
        setField(panelPrice, formatPrice(product.price));
        setField(panelDescription, product.description);

        const ref = product.name ? `*${product.name}*` : 'un producto';
        const msg = encodeURIComponent(
            `Hola Clhoe! Estoy viendo su catálogo en línea y me gustaría cotizar ${ref}.\n\nPágina: ${PAGE_URL}`
        );
        btnCotizar.href = `https://wa.me/${PHONE_CLHOE}?text=${msg}`;
    };

    const getGroupProducts = (product) => {
        if (!product.group) return [product];
        return filteredProducts.filter(p => p.group === product.group);
    };

    // ==========================================
    // OPEN / CLOSE PANEL
    // ==========================================
    const closePanel = () => {
        detailPanel.classList.remove('open');
        panelOverlay.classList.remove('active');
        if (pageWrapper) pageWrapper.classList.remove('panel-open');
        if (activeCard) {
            activeCard.classList.remove('active');
            activeCard = null;
        }
        document.body.classList.remove('panel-open');

        if (window.innerWidth <= 768) {
            document.body.style.overflow = '';
        }

        smoothRelayout();

        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
        if (swiperWrapper) swiperWrapper.innerHTML = '';
        currentGroupProducts = [];
        currentProductIndex = 0;
    };

    const openPanel = (product, card) => {
        currentGroupProducts = getGroupProducts(product);
        currentProductIndex = currentGroupProducts.findIndex(p => p.id === product.id);
        if (currentProductIndex < 0) currentProductIndex = 0;

        // Build slides
        if (swiperWrapper) {
            swiperWrapper.innerHTML = '';
            currentGroupProducts.forEach((p, i) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<img src="${p.image}" alt="${p.name || 'Producto'}" loading="lazy">`;
                swiperWrapper.appendChild(slide);
            });
        }

        updatePanelContent(product);

        if (activeCard) activeCard.classList.remove('active');
        activeCard = card;
        if (activeCard) activeCard.classList.add('active');

        detailPanel.classList.add('open');
        panelOverlay.classList.add('active');
        if (panelBody) panelBody.scrollTop = 0;
        document.body.classList.add('panel-open');
        if (pageWrapper) pageWrapper.classList.add('panel-open');

        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }

        // Re-layout grid during panel transition
        smoothRelayout();

        // Init Swiper
        setTimeout(() => {
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }

            const multiple = currentGroupProducts.length > 1;

            swiperInstance = new Swiper(swiperContainer, {
                initialSlide: currentProductIndex,
                loop: multiple,
                slidesPerView: 1,
                speed: 300,
                autoHeight: true,
                navigation: {
                    nextEl: swiperNext,
                    prevEl: swiperPrev,
                },
                on: {
                    slideChange: function () {
                        const realIdx = this.realIndex;
                        const prod = currentGroupProducts[realIdx];
                        if (prod) updatePanelContent(prod);
                    }
                }
            });

            swiperPrev.style.display = multiple ? 'flex' : 'none';
            swiperNext.style.display = multiple ? 'flex' : 'none';
        }, 50);
    };

    // ==========================================
    // EVENTS: PANEL
    // ==========================================
    panelClose?.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (detailPanel.classList.contains('open')) closePanel();
            if (filtersDrawer.classList.contains('open')) closeFilters();
        }
    });
    document.addEventListener('click', (e) => {
        if (!detailPanel.classList.contains('open')) return;
        if (detailPanel.contains(e.target)) return;
        if (e.target.closest('.product-card')) return;
        closePanel();
    });

    // ==========================================
    // FILTERS
    // ==========================================
    const collectAllTags = () => {
        const tagSet = new Set();
        allProducts.forEach(p => {
            (p.tags || []).forEach(t => tagSet.add(t));
        });
        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    };

    const renderFilterChips = () => {
        const tags = collectAllTags();
        filtersBody.innerHTML = '';
        if (!tags.length) {
            filtersBody.innerHTML = '<p style="color:var(--light-text);font-size:0.9rem;">No hay filtros disponibles.</p>';
            return;
        }
        const wrap = document.createElement('div');
        wrap.className = 'filters-chips';
        tags.forEach(tag => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'filter-chip';
            chip.textContent = tag;
            chip.dataset.tag = tag;
            if (pendingFilters.has(tag)) chip.classList.add('selected');
            chip.addEventListener('click', () => {
                if (pendingFilters.has(tag)) {
                    pendingFilters.delete(tag);
                    chip.classList.remove('selected');
                } else {
                    pendingFilters.add(tag);
                    chip.classList.add('selected');
                }
            });
            wrap.appendChild(chip);
        });
        filtersBody.appendChild(wrap);
    };

    const openFilters = () => {
        pendingFilters = new Set(selectedFilters); // copy current selection
        renderFilterChips();
        filtersDrawer.classList.add('open');
        filtersOverlay.classList.add('active');
    };

    const closeFilters = () => {
        filtersDrawer.classList.remove('open');
        filtersOverlay.classList.remove('active');
    };

    const applyFilters = () => {
        selectedFilters = new Set(pendingFilters);
        filterGrid();
        closeFilters();
        updateFiltersBadge();
    };

    const resetFilters = () => {
        pendingFilters.clear();
        renderFilterChips();
    };

    const clearFilters = () => {
        selectedFilters.clear();
        pendingFilters.clear();
        filterGrid();
        updateFiltersBadge();
    };

    const updateFiltersBadge = () => {
        const count = selectedFilters.size;
        filtersCount.textContent = count;
        filtersCount.classList.toggle('hidden', count === 0);
        filtersClear.classList.toggle('hidden', count === 0);
    };

    const filterGrid = () => {
        const cards = productsGrid.querySelectorAll('.product-card');
        let visible = 0;
        cards.forEach(card => {
            const tags = (card.dataset.tags || '').split(',').filter(Boolean);
            // AND logic: item must have ALL selected tags
            const matches = selectedFilters.size === 0 ||
                Array.from(selectedFilters).every(f => tags.includes(f));
            if (matches) {
                card.classList.remove('filtered-out');
                card.style.display = '';
                visible++;
            } else {
                card.classList.add('filtered-out');
                card.style.display = 'none';
            }
        });

        productsEmpty.classList.toggle('hidden', visible > 0);

        // Re-layout because items removed
        requestAnimationFrame(() => layoutGrid());
    };

    filtersToggle?.addEventListener('click', openFilters);
    filtersClose?.addEventListener('click', closeFilters);
    filtersOverlay?.addEventListener('click', closeFilters);
    filtersApply?.addEventListener('click', applyFilters);
    filtersReset?.addEventListener('click', resetFilters);
    filtersClear?.addEventListener('click', clearFilters);

    // ==========================================
    // RESIZE
    // ==========================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            layoutGrid();
            if (window.innerWidth > 768 && document.body.classList.contains('panel-open')) {
                document.body.style.overflow = '';
            }
        }, 100);
    });

    // ==========================================
    // LOAD PRODUCTS
    // ==========================================
    fetch('data/productos.json')
        .then(r => {
            if (!r.ok) throw new Error(`productos.json (${r.status})`);
            return r.json();
        })
        .then(data => {
            allProducts = (data.muebles || []).map((item, i) => ({
                ...item,
                id: item.id || `item-${i}`
            }));
            filteredProducts = allProducts.slice();

            productsGrid.replaceChildren();
            productsEmpty.classList.add('hidden');

            allProducts.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = item.id;
                card.dataset.tags = (item.tags || []).join(',');

                const hasInfo = Boolean(item.name || item.price);
                const priceDisplay = formatPrice(item.price);

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

            // Wait for images to load, then layout
            const images = Array.from(productsGrid.querySelectorAll('.product-image'));
            Promise.all(images.map(img => {
                if (img.complete && img.naturalWidth) return Promise.resolve();
                return new Promise(res => {
                    img.addEventListener('load', res, { once: true });
                    img.addEventListener('error', res, { once: true });
                });
            })).then(() => {
                layoutGrid();
                // Second pass to catch any late-loading images
                setTimeout(layoutGrid, 200);
            });
        })
        .catch(err => {
            console.error(err);
            productsGrid.innerHTML = '<p class="products-error">No se pudieron cargar los productos.</p>';
        });
});