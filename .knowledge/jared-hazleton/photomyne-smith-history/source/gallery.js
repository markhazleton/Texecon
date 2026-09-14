// ========== GALLERY.JS ==========
document.addEventListener('DOMContentLoaded', function() {

const viewedPhotos = new Set();

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatPhotoDate(year, month, day) {
    if (!year) return '';
    let dateStr = '';
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    if (!isNaN(dayNum) && dayNum > 0) dateStr += dayNum + ' ';
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) dateStr += MONTH_NAMES[monthNum - 1] + ' ';
    return dateStr + year;
}

// ========== LANDING OVERLAY ==========
const landingOverlay = document.getElementById('landingOverlay');
if (landingOverlay) {
    // Check if this is an expired landing (no enter button)
    const enterBtn = document.getElementById('enterGalleryBtn');
    const isExpired = !enterBtn;

    // Skip landing if coming from albums page
    const skipLanding = window.SKIP_LANDING === true;

    if (!isExpired && skipLanding) {
        landingOverlay.remove();
    } else if (!isExpired) {
        const dismissLanding = () => {
            landingOverlay.classList.add('fade-out');
            setTimeout(() => landingOverlay.remove(), 700);
            if (window.campaignEvents) {
                window.campaignEvents.sendGtagEvent('ENTER_GALLERY', {
                    total_photos: (window.TOTAL_PHOTOS || 0)
                }, 'Share');
            }
        };
        const handler = window.ALBUMS_URL
            ? () => { window.location.href = window.ALBUMS_URL; }
            : dismissLanding;
        enterBtn.addEventListener('click', handler);
        const coverWrapper = document.querySelector('.landing-cover-wrapper');
        if (coverWrapper) coverWrapper.addEventListener('click', handler);
    }
    // If expired, landing stays visible permanently (no dismiss)
}

// Settings Panel
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');

        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                settingsBtn.classList.toggle('active');
                settingsPanel.classList.toggle('open');
            });

            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
                    settingsBtn.classList.remove('active');
                    settingsPanel.classList.remove('open');
                }
            });

            // Font options
            document.querySelectorAll('.font-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    document.querySelectorAll('.font-option').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    document.documentElement.style.setProperty('--font-family', opt.dataset.font);
                    localStorage.setItem('pm-font', opt.dataset.font);
                });
            });
        }

        // Top-bar shadow on scroll
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            const updateTopBarShadow = () => {
                topBar.classList.toggle('scrolled', window.scrollY > 4);
            };
            window.addEventListener('scroll', updateTopBarShadow, { passive: true });
            updateTopBarShadow();
        }

        // Copy Link Button
        const copyBtn = document.getElementById('copyBtn');
        const copyTooltip = document.getElementById('copyTooltip');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                if (window.campaignEvents) {
                    window.campaignEvents.sendGtagEvent('COPY_LINK', {}, 'Share');
                }
                const url = window.location.href;
                try {
                    await navigator.clipboard.writeText(url);
                    copyTooltip.classList.add('show');
                    setTimeout(() => {
                        copyTooltip.classList.remove('show');
                    }, 2000);
                } catch (err) {
                    // Fallback for browsers without clipboard API
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    copyTooltip.classList.add('show');
                    setTimeout(() => {
                        copyTooltip.classList.remove('show');
                    }, 2000);
                }
            });
        }


        // Photo loading
        let currentPhotoCount = 0;

        function onImageLoad(img) {
            img.parentElement.classList.add('loaded');
        }

        function updatePhotoCount() {
            // Recount visible photos and renumber them
            const items = document.querySelectorAll('.grid-item:not(.download-tile)');
            totalPhotos = items.length;
            items.forEach((item, index) => {
                const numberEl = item.querySelector('.photo-number');
                if (numberEl) {
                    numberEl.textContent = '#' + (index + 1);
                }
            });
            // Update top album header count
            const countEl = document.querySelector('.album-header-count');
            if (countEl) {
                countEl.textContent = totalPhotos;
            }
            // Recompute per-album separator counts (multi-album view)
            const galleryEl = document.getElementById('gallery');
            if (galleryEl) {
                const separators = galleryEl.querySelectorAll('.album-separator');
                separators.forEach((sep, idx) => {
                    let count = 0;
                    let node = sep.nextElementSibling;
                    while (node && !node.classList.contains('album-separator')) {
                        if (node.classList.contains('grid-item') && !node.classList.contains('download-tile')) {
                            count++;
                        }
                        node = node.nextElementSibling;
                    }
                    const metaEl = sep.querySelector('.album-separator-meta');
                    if (metaEl) {
                        const parts = metaEl.textContent.split(' · ');
                        const yearPart = parts.length > 1 ? parts[0] : '';
                        const countText = count + ' photos';
                        metaEl.textContent = yearPart ? (yearPart + ' · ' + countText) : countText;
                    } else if (count >= 0) {
                        const newMeta = document.createElement('div');
                        newMeta.className = 'album-separator-meta';
                        newMeta.textContent = count + ' photos';
                        sep.appendChild(newMeta);
                    }
                });
            }
            currentPhotoCount = items.length;
        }

        // Parallel batch loading (6 at a time, in order)
        const loadQueue = [];
        const loadQueueSet = new Set();
        let activeLoads = 0;
        const MAX_PARALLEL = 6;
        let lightboxOpen = false;
        let loadedCount = 0;

        function processQueue() {
            const maxLoads = lightboxOpen ? 4 : MAX_PARALLEL;
            while (activeLoads < maxLoads && loadQueue.length > 0) {
                const img = loadQueue.shift();
                loadQueueSet.delete(img);
                if (!img || !img.dataset.src || img.src) continue;

                activeLoads++;
                img.onload = () => {
                    img.parentElement.classList.add('loaded');
                    activeLoads--;
                    loadedCount++;
                    processQueue();
                    // Update lightbox thumb if strip exists
                    const gridIdx = parseInt(img.parentElement.dataset.index) - 1;
                    const thumbEl = document.querySelector(`#lightboxThumbs [data-index="${gridIdx}"] img`);
                    if (thumbEl && !thumbEl.hasAttribute('src')) thumbEl.src = img.src;
                };
                img.onerror = () => {
                    // Missing thumb = photo deleted from S3; drop the tile.
                    activeLoads--;
                    const gridItem = img.closest('.grid-item');
                    if (gridItem) gridItem.remove();
                    updatePhotoCount();
                    processQueue();
                };
                img.src = img.dataset.src;
            }
        }

        function queueImage(img) {
            if (!img.dataset.src || img.src || loadQueueSet.has(img)) return;
            loadQueueSet.add(img);
            loadQueue.push(img);
            processQueue();
        }

        // Observer for loading images when near viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.closest('.grid-item').classList.add('near-viewport');
                    queueImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '800px' });

        // ========== GRID: skeleton + progressive paging ==========
        // The server ships no photo URLs — only the total count and album
        // boundaries. We render placeholder tiles instantly, then page in
        // thumb/full URLs + metadata from /share/api/photos, start to finish.
        // Image bytes still load lazily by viewport (IntersectionObserver).
        const gallery = document.getElementById('gallery');
        const albumBoundaries = window.ALBUM_BOUNDARIES || [];
        const TOTAL_PHOTOS = window.TOTAL_PHOTOS || 0;
        const PAGE_SIZE = 40;
        let totalPhotos = TOTAL_PHOTOS;

        // start index -> {title, count, year} for album separators
        const albumStartMap = {};
        albumBoundaries.forEach((b) => {
            albumStartMap[b.start] = { title: b.title, count: b.count, year: b.year || '' };
        });

        // The multi-album landing screen never shows the grid (Enter navigates
        // to the albums page), so don't build thousands of skeleton tiles there.
        const skipGrid = !!window.ALBUMS_URL && window.SKIP_LANDING !== true;

        if (!skipGrid && TOTAL_PHOTOS > 0) {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < TOTAL_PHOTOS; i++) {
                if (albumBoundaries.length >= 1 && i in albumStartMap) {
                    const separator = document.createElement('div');
                    separator.className = 'album-separator';
                    const meta = albumStartMap[i] || {};
                    const title = meta.title || 'Untitled Album';
                    const subParts = [];
                    if (meta.year) subParts.push(meta.year);
                    if (meta.count) subParts.push(meta.count + ' photos');
                    const subStr = subParts.join(' · ');
                    // textContent (not innerHTML) — album titles are
                    // creator-controlled and would otherwise allow HTML/script
                    // injection into every viewer's grid.
                    const titleEl = document.createElement('div');
                    titleEl.className = 'album-separator-title';
                    titleEl.textContent = title;
                    separator.appendChild(titleEl);
                    if (subStr) {
                        const metaEl = document.createElement('div');
                        metaEl.className = 'album-separator-meta';
                        metaEl.textContent = subStr;
                        separator.appendChild(metaEl);
                    }
                    fragment.appendChild(separator);
                }
                const div = document.createElement('div');
                div.className = 'grid-item skeleton';
                div.dataset.gindex = i;
                div.dataset.index = i + 1;
                const img = document.createElement('img');
                img.alt = 'Photo';
                div.appendChild(img);
                const numDiv = document.createElement('div');
                numDiv.className = 'photo-number';
                numDiv.textContent = '#' + (i + 1);
                div.appendChild(numDiv);
                fragment.appendChild(div);
            }
            gallery.appendChild(fragment);
        }

        // ----- Progressive page loading -----
        // window.location.search already carries ?u=&s=&album=&… so the photos
        // endpoint stays album-scoped; we only append offset/limit.
        const photosQuery = window.location.search;
        const pagePromises = {};  // page index -> in-flight/settled promise

        function buildCaption(photo) {
            const parts = [];
            if (photo.title) parts.push(photo.title.substring(0, 60) + (photo.title.length > 60 ? '...' : ''));
            if (photo.location) parts.push(photo.location);
            if (photo.year) parts.push(formatPhotoDate(photo.year, photo.month, photo.day));
            let caption = parts.join(', ');
            if (photo.tags && photo.tags.length > 0) caption += ' with ' + photo.tags.join(', ');
            return caption;
        }

        function populatePhoto(gindex, photo) {
            const div = gallery.querySelector('.grid-item[data-gindex="' + gindex + '"]');
            if (!div) return;  // tile was removed (broken thumb) — skip
            div.dataset.full = photo.url;
            div.dataset.thumb = photo.thumb_url;
            if (photo.thumb2_url) div.dataset.thumb2 = photo.thumb2_url;
            if (photo.back_url) div.dataset.back = photo.back_url;
            if (photo.title) div.dataset.title = photo.title;
            if (photo.year) div.dataset.year = photo.year;
            if (photo.month) div.dataset.month = photo.month;
            if (photo.day) div.dataset.day = photo.day;
            if (photo.location) div.dataset.location = photo.location;
            if (photo.tags) div.dataset.tags = JSON.stringify(photo.tags);

            if (photo.title || photo.year || photo.location || (photo.tags && photo.tags.length)) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'photo-title';
                titleDiv.textContent = buildCaption(photo);
                div.appendChild(titleDiv);
            }

            const img = div.querySelector('img');
            img.dataset.src = photo.thumb_url;
            div.classList.remove('skeleton');
            observer.observe(img);  // viewport-driven byte load
        }

        function loadPage(p) {
            if (skipGrid) return Promise.resolve();
            if (pagePromises[p]) return pagePromises[p];
            const offset = p * PAGE_SIZE;
            const promise = fetch('/share/api/photos' + photosQuery + '&offset=' + offset + '&limit=' + PAGE_SIZE)
                .then((r) => r.json())
                .then((data) => {
                    (data.photos || []).forEach((photo, k) => populatePhoto(offset + k, photo));
                })
                .catch(() => { pagePromises[p] = null; });  // allow retry
            pagePromises[p] = promise;
            return promise;
        }

        function ensurePhotoLoaded(gindex) {
            return loadPage(Math.floor(gindex / PAGE_SIZE));
        }

        // Stream every page sequentially, first album to last — one request in
        // flight so clicking into a photo never queues behind a fetch burst.
        (function loadAllPages() {
            if (skipGrid || TOTAL_PHOTOS === 0) return;
            const pages = Math.ceil(TOTAL_PHOTOS / PAGE_SIZE);
            let p = 0;
            (function next() {
                if (p >= pages) return;
                loadPage(p++).then(next);
            })();
        })();

        // ========== LIGHTBOX ==========
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxCounter = document.getElementById('lightboxCounter');
        const lightboxDetails = document.getElementById('lightboxDetails');
        const lightboxThumbs = document.getElementById('lightboxThumbs');
        let currentLightboxIndex = 0;
        let detailsVisible = false;
        let thumbsInitialized = false;

        function getGridItems() {
            return Array.from(document.querySelectorAll('.grid-item:not(.download-tile)'));
        }

        function initThumbnails() {
            if (thumbsInitialized) return;
            const items = getGridItems();
            lightboxThumbs.innerHTML = '';
            items.forEach((item, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'lightbox-thumb';
                thumb.dataset.index = idx;
                const img = document.createElement('img');
                const thumbImg = item.querySelector('img');
                const fullUrl = item.dataset.full;
                // Use src if loaded, otherwise fall back to data-src for lazy-loaded images
                const actualSrc = thumbImg.getAttribute('src');
                if (actualSrc && actualSrc.startsWith('http')) {
                    img.src = actualSrc;
                } else if (thumbImg.dataset.src) {
                    img.src = thumbImg.dataset.src;
                }
                // Fallback to full URL if thumbnail fails to load
                img.onerror = () => {
                    if (fullUrl && img.src !== fullUrl) {
                        img.src = fullUrl;
                    }
                };
                thumb.appendChild(img);
                thumb.addEventListener('click', () => openLightbox(idx));
                lightboxThumbs.appendChild(thumb);
            });
            thumbsInitialized = true;
        }

        function updateActiveThumbnail(index) {
            document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
                t.classList.toggle('active', i === index);
            });
            // Scroll to active thumbnail
            const activeThumb = lightboxThumbs.querySelector('.lightbox-thumb.active');
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }

        // UI visibility toggle for lightbox
        let lightboxUIVisible = true;

        function toggleLightboxUI() {
            lightboxUIVisible = !lightboxUIVisible;
            if (lightboxUIVisible) {
                lightbox.classList.remove('ui-hidden');
            } else {
                lightbox.classList.add('ui-hidden');
            }
        }

        // Rotation handling - store rotation per photo
        const photoRotations = {};

        function applyRotation(rotation) {
            lightboxImg.classList.remove('rotate-90', 'rotate-180', 'rotate-270');
            if (rotation === 90) lightboxImg.classList.add('rotate-90');
            else if (rotation === 180) lightboxImg.classList.add('rotate-180');
            else if (rotation === 270) lightboxImg.classList.add('rotate-270');
        }

        let stashedAccessibility = [];
        function stashAccessibilityBadge() {
            if (stashedAccessibility.length) return;
            ['INDshadowRootWrap', 'INDShadowRootHost', 'INDbtnWrap'].forEach(function (id) {
                const el = document.getElementById(id);
                if (el) {
                    stashedAccessibility.push({ el: el, parent: el.parentNode, next: el.nextSibling });
                    el.parentNode.removeChild(el);
                }
            });
        }
        function restoreAccessibilityBadge() {
            stashedAccessibility.forEach(function (s) {
                s.parent.insertBefore(s.el, s.next);
            });
            stashedAccessibility = [];
        }

        function openLightbox(index, updateUrl = true, animate = true) {
            const items = getGridItems();
            if (index < 0 || index >= items.length) return;

            // Tile not paged in yet — load its page, then open it.
            const targetItem = items[index];
            if (!targetItem.dataset.full) {
                ensurePhotoLoaded(parseInt(targetItem.dataset.gindex, 10)).then(() => {
                    if (targetItem.dataset.full) openLightbox(index, updateUrl, animate);
                });
                return;
            }

            lightboxOpen = true;
            document.body.classList.add('lightbox-open');
            stashAccessibilityBadge();
            currentLightboxIndex = index;

            if (window.campaignEvents && !viewedPhotos.has(index)) {
                viewedPhotos.add(index);
                window.campaignEvents.sendGtagEvent('VIEW_PHOTO', {
                    photo_index: index + 1,
                    total_photos: items.length
                }, 'Share');
            }

            const item = items[index];
            const fullUrl = item.dataset.full;
            const smallThumbUrl = item.dataset.thumb;
            const thumb2Url = item.dataset.thumb2;
            const backUrl = item.dataset.back;
            let title = item.dataset.title || '';
            let year = item.dataset.year;
            let month = item.dataset.month;
            let day = item.dataset.day;
            let location = item.dataset.location || '';
            let tags = [];
            try { if (item.dataset.tags) tags = JSON.parse(item.dataset.tags); } catch (e) { /* ignore corrupt tags */ }
            // Demo metadata: ?metaDemo=1 — long title + year/location/tags for visual testing
            if (new URLSearchParams(window.location.search).get('metaDemo') === '1') {
                title = 'A summer afternoon in the garden when everyone gathered for the family reunion barbecue and the kids ran around in the sprinklers while Grandma told stories';
                year = '1987';
                month = '7';
                day = '15';
                location = 'Tel Aviv';
                tags = ['Mom', 'Dad', 'Sister Sarah'];
            }

            // Show/hide flip button based on whether photo has back
            const flipBtn = document.getElementById('lightboxFlip');
            if (backUrl) {
                flipBtn.style.display = 'flex';
                flipBtn.dataset.front = fullUrl;
                flipBtn.dataset.back = backUrl;
                flipBtn.dataset.showing = 'front';
                flipBtn.title = 'Flip to back';
            } else {
                flipBtn.style.display = 'none';
                flipBtn.dataset.showing = 'front';
            }

            // Apply saved rotation for this photo (or reset if none) - without animation
            const savedRotation = photoRotations[index] || 0;
            lightboxImg.style.transition = 'none';
            lightboxImg.classList.remove('thumb-scale'); // Reset any previous effects
            applyRotation(savedRotation);
            // Re-enable transition after a frame
            requestAnimationFrame(() => {
                lightboxImg.style.transition = '';
            });

            // Remove loaded class to ensure clean state for new image
            lightboxImg.classList.remove('loaded');
            lightboxImg.classList.remove('thumb-blur');
            // Hide and clear photo info immediately to prevent old metadata flashing over new image
            let pendingPhotoInfo = null;
            const photoInfoEl = document.getElementById('lightboxPhotoInfo');
            if (photoInfoEl) {
                photoInfoEl.classList.remove('visible');
                const prevTitle = document.getElementById('lightboxPhotoTitle');
                const prevYear = document.getElementById('lightboxPhotoYear');
                if (prevTitle) prevTitle.textContent = '';
                if (prevYear) prevYear.textContent = '';
            }

            // Calculate what size the full image will display at.
            // Mobile uses a tighter height budget (matches CSS calc(100dvh - 210px))
            // so the image never extends under the thumb strip / counter or behind
            // the top controls.
            const calculateDisplaySize = (naturalW, naturalH) => {
                const isMobile = window.innerWidth <= 600;
                const maxW = window.innerWidth * (isMobile ? 0.96 : 0.9);
                const maxH = isMobile
                    ? window.innerHeight - 210
                    : window.innerHeight * 0.85;
                const ratio = Math.min(maxW / naturalW, maxH / naturalH);
                return {
                    width: Math.round(naturalW * ratio),
                    height: Math.round(naturalH * ratio)
                };
            };

            // Progressive ladder: tier 0 = small thumb, 1 = thumb2, 2 = full.
            // Higher tier always wins; a later-arriving lower tier is ignored.
            // Failures of any tier are silent — keep whatever currently shows.
            let currentTier = -1;
            let dimsLocked = false;

            // Clear any previous fixed dimensions and image
            lightboxImg.style.width = '';
            lightboxImg.style.height = '';
            lightboxImg.removeAttribute('src');

            lightboxImg.onload = () => {
                lightboxImg.classList.add('loaded');
                if (currentLightboxIndex === index && pendingPhotoInfo) {
                    pendingPhotoInfo();
                    pendingPhotoInfo = null;
                }
            };
            lightboxImg.onerror = null;

            const lockDims = (w, h) => {
                if (!w || !h) return;
                const d = calculateDisplaySize(w, h);
                lightboxImg.style.width = d.width + 'px';
                lightboxImg.style.height = d.height + 'px';
                dimsLocked = true;
            };

            const setTier = (tier, url, w, h) => {
                if (currentLightboxIndex !== index) return;
                if (tier <= currentTier) return;
                // Only lock dims from thumb tiers if full hasn't already locked them.
                if (tier === 2 || !dimsLocked) lockDims(w, h);
                if (tier >= 2) lightboxImg.classList.remove('thumb-blur');
                else lightboxImg.classList.add('thumb-blur');
                lightboxImg.src = url;
                currentTier = tier;
            };

            // Tier 0 — small thumb, instant from grid <img> if cached.
            const gridImg = item.querySelector('img');
            if (gridImg && gridImg.complete && gridImg.naturalWidth > 0) {
                lockDims(gridImg.naturalWidth, gridImg.naturalHeight);
                lightboxImg.classList.add('thumb-blur');
                lightboxImg.src = gridImg.src;
                currentTier = 0;
            } else if (smallThumbUrl) {
                const t0 = new Image();
                t0.onload = () => setTier(0, smallThumbUrl, t0.naturalWidth, t0.naturalHeight);
                t0.src = smallThumbUrl;
            }

            // Tier 1 — thumb2 (backend always emits URL; may 404 in S3).
            if (thumb2Url) {
                const t1 = new Image();
                t1.onload = () => setTier(1, thumb2Url, t1.naturalWidth, t1.naturalHeight);
                t1.src = thumb2Url;
            }

            // Tier 2 — full resolution.
            const fullImg = new Image();
            fullImg.onload = () => {
                if (currentLightboxIndex !== index) return;
                const w = fullImg.naturalWidth;
                const h = fullImg.naturalHeight;
                const detailSize = document.getElementById('detailSize');
                const detailSizeValue = document.getElementById('detailSizeValue');
                if (w && h) {
                    detailSizeValue.textContent = `${w}×${h}`;
                    detailSize.style.display = 'flex';
                }
                const detailOrientation = document.getElementById('detailOrientation');
                const detailOrientationValue = document.getElementById('detailOrientationValue');
                if (w && h) {
                    const orientation = w > h ? 'Landscape' : w < h ? 'Portrait' : 'Square';
                    detailOrientationValue.textContent = orientation;
                    detailOrientation.style.display = 'flex';
                }
                // Full dims are authoritative — override any earlier thumb-based lock.
                dimsLocked = false;
                setTier(2, fullUrl, w, h);
            };
            fullImg.src = fullUrl;

            // Failsafe — onload may not fire if src was already cached.
            setTimeout(() => {
                if (currentLightboxIndex === index && !lightboxImg.classList.contains('loaded')) {
                    lightboxImg.classList.add('loaded');
                }
            }, 100);

            lightboxCounter.textContent = `${index + 1} / ${items.length}`;

            // Update photo info overlay
            const photoInfo = document.getElementById('lightboxPhotoInfo');
            const photoYear = document.getElementById('lightboxPhotoYear');
            const photoTitle = document.getElementById('lightboxPhotoTitle');

            if (year || title || location || (tags && tags.length)) {
                photoYear.style.display = 'none';

                // Build parts: [title, location, date]
                const infoParts = [];
                if (title) infoParts.push(title);
                if (location) infoParts.push(location);
                if (year) {
                    infoParts.push(formatPhotoDate(year, month, day));
                }

                let displayText = infoParts.join(', ');
                if (tags && tags.length > 0) {
                    displayText += ' with ' + tags.join(', ');
                }

                // Defer applying text + visibility until the new image is on screen
                pendingPhotoInfo = () => {
                    if (currentLightboxIndex !== index) return;
                    photoTitle.textContent = displayText;
                    photoTitle.style.display = displayText ? 'block' : 'none';
                    photoInfo.classList.add('visible');
                };
                // If image is already loaded (cached), apply immediately
                if (lightboxImg.classList.contains('loaded')) {
                    pendingPhotoInfo();
                    pendingPhotoInfo = null;
                }
            } else {
                photoInfo.classList.remove('visible');
            }

            // Initialize and update thumbnails
            initThumbnails();
            updateActiveThumbnail(index);

            // Update details panel
            const detailDate = document.getElementById('detailDate');
            const detailTitle = document.getElementById('detailTitle');
            const detailDateValue = document.getElementById('detailDateValue');
            const detailTitleValue = document.getElementById('detailTitleValue');

            if (year) {
                detailDateValue.textContent = formatPhotoDate(year, month, day);
                detailDate.style.display = 'flex';
            } else {
                detailDate.style.display = 'none';
            }

            if (title) {
                detailTitleValue.textContent = title;
                detailTitle.style.display = 'flex';
            } else {
                detailTitle.style.display = 'none';
            }

            // Update location
            const detailLocation = document.getElementById('detailLocation');
            const detailLocationValue = document.getElementById('detailLocationValue');
            if (location) {
                detailLocationValue.textContent = location;
                detailLocation.style.display = 'flex';
            } else {
                detailLocation.style.display = 'none';
            }

            // Update people tags
            const detailTags = document.getElementById('detailTags');
            const detailTagsValue = document.getElementById('detailTagsValue');
            if (tags && tags.length > 0) {
                detailTagsValue.textContent = tags.join(', ');
                detailTags.style.display = 'flex';
            } else {
                detailTags.style.display = 'none';
            }

            lightbox.classList.add('open');
            lightbox.classList.remove('ui-hidden');
            lightboxUIVisible = true;
            document.body.style.overflow = 'hidden';

            // Update URL with photo parameter
            if (updateUrl) {
                const url = new URL(window.location);
                url.searchParams.set('photo', index + 1);
                history.replaceState({}, '', url);
            }
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightboxDetails.classList.remove('show');
            detailsVisible = false;
            thumbsInitialized = false; // Reset so thumbnails refresh if more photos loaded
            document.body.style.overflow = '';
            document.body.classList.remove('lightbox-open');
            restoreAccessibilityBadge();
            lightboxOpen = false;
            processQueue();

            // Remove photo parameter from URL
            const url = new URL(window.location);
            url.searchParams.delete('photo');
            history.replaceState({}, '', url);
        }

        function navigateLightbox(direction) {
            const items = getGridItems();
            if (items.length === 0) return;

            // Simple wrap-around navigation
            currentLightboxIndex += direction;
            if (currentLightboxIndex < 0) {
                currentLightboxIndex = items.length - 1;
            } else if (currentLightboxIndex >= items.length) {
                currentLightboxIndex = 0;
            }

            const wasUIHidden = lightbox.classList.contains('ui-hidden');
            openLightbox(currentLightboxIndex);
            if (wasUIHidden) {
                lightbox.classList.add('ui-hidden');
                lightboxUIVisible = false;
            }
        }

        // Click on photo to open lightbox
        document.getElementById('gallery').addEventListener('click', (e) => {
            const item = e.target.closest('.grid-item');
            if (item && !item.classList.contains('download-tile')) {
                const items = getGridItems();
                const index = items.indexOf(item);
                openLightbox(index);
            }
        });

        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightbox) return;
            // Click outside image toggles UI; never closes (close via X or Escape only)
            toggleLightboxUI();
        });

        // Click on lightbox image toggles UI visibility
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLightboxUI();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'i' || e.key === 'I') toggleDetails();
        });

        // Swipe gestures for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let swipeTarget = null;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            swipeTarget = e.target;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            // Don't handle swipe if it started on the thumbnail strip
            const thumbsContainer = document.getElementById('lightboxThumbs');
            if (swipeTarget && thumbsContainer && thumbsContainer.contains(swipeTarget)) {
                return; // Let thumbnails scroll naturally
            }

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const minSwipeDistance = 50;

            // Only handle horizontal swipes (ignore vertical)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Swipe right - previous photo
                    navigateLightbox(-1);
                } else {
                    // Swipe left - next photo
                    navigateLightbox(1);
                }
            }
        }

        // Lightbox action buttons
        document.getElementById('lightboxShare').addEventListener('click', async () => {
            if (window.campaignEvents) {
                window.campaignEvents.sendGtagEvent('SHARE_PHOTO', {
                    photo_index: currentLightboxIndex + 1
                }, 'Share');
            }
            const url = new URL(window.location);
            url.searchParams.set('photo', currentLightboxIndex + 1);
            url.searchParams.set('skip_landing', '1');
            const shareUrl = url.toString();
            const tooltip = document.querySelector('#lightboxShare .action-tooltip');

            try {
                await navigator.clipboard.writeText(shareUrl);
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 2000);
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 2000);
            }
        });

        // Download button. iOS WKWebView (the in-app webview, ?webview=True)
        // can't navigate to the blob: URL an <a download> creates, so the
        // download fails with "WebKitBlobResource error 1". Hide the button
        // there — the native app handles saving.
        const inAppWebview = (new URLSearchParams(window.location.search).get('webview') || '').toLowerCase() === 'true';
        const lightboxDownloadBtn = document.getElementById('lightboxDownload');
        if (inAppWebview) {
            lightboxDownloadBtn.style.display = 'none';
        }
        async function downloadCurrentPhoto(wantBack) {
            const albumParam = new URLSearchParams(window.location.search).get('album');
            const albumQuery = albumParam !== null ? `&album=${encodeURIComponent(albumParam)}` : '';
            const backQuery = wantBack ? '&back=1' : '';
            // Index into the server's album-scoped photo list = tile data-gindex,
            // which is stable even if broken-thumb tiles were removed.
            const curItem = getGridItems()[currentLightboxIndex];
            const photoIndex = curItem ? parseInt(curItem.dataset.gindex, 10) : currentLightboxIndex;
            const downloadUrl = `/share/api/download-photo?u=${encodeURIComponent(window.SHARE_USER_ID)}&s=${encodeURIComponent(window.SHARE_ID)}&index=${photoIndex}${albumQuery}${backQuery}`;
            try {
                const response = await fetch(downloadUrl);
                if (!response.ok) throw new Error('Download failed');
                const cd = response.headers.get('Content-Disposition') || '';
                let serverName = '';
                const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
                if (star) {
                    serverName = decodeURIComponent(star[1]);
                } else {
                    const plain = cd.match(/filename="?([^";]+)"?/i);
                    if (plain) serverName = plain[1];
                }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = serverName || `photo_${currentLightboxIndex + 1}${wantBack ? '_back' : ''}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                console.error('Download failed:', err);
                window.open(downloadUrl, '_blank');
            }
        }

        lightboxDownloadBtn.addEventListener('click', async () => {
            if (window.campaignEvents) {
                window.campaignEvents.sendGtagEvent('DOWNLOAD_PHOTO', {
                    photo_index: currentLightboxIndex + 1
                }, 'Share');
            }
            const tooltip = document.querySelector('#lightboxDownload .action-tooltip');
            // Photos with a back side download both front and back at once.
            const flipBtn = document.getElementById('lightboxFlip');
            const hasBack = flipBtn && flipBtn.style.display !== 'none';

            await downloadCurrentPhoto(false);
            if (hasBack) {
                await downloadCurrentPhoto(true);
            }

            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
        });

        function toggleDetails() {
            detailsVisible = !detailsVisible;
            lightboxDetails.classList.toggle('show', detailsVisible);
        }

        document.getElementById('lightboxInfo').addEventListener('click', toggleDetails);

        // Rotate button click handler
        document.getElementById('lightboxRotate').addEventListener('click', () => {
            const currentRotation = photoRotations[currentLightboxIndex] || 0;
            const newRotation = (currentRotation + 90) % 360;
            photoRotations[currentLightboxIndex] = newRotation;
            applyRotation(newRotation);
        });

        // Flip button click handler (for photos with back)
        document.getElementById('lightboxFlip').addEventListener('click', () => {
            const flipBtn = document.getElementById('lightboxFlip');
            const frontUrl = flipBtn.dataset.front;
            const backUrl = flipBtn.dataset.back;
            const showing = flipBtn.dataset.showing;

            // Fade out current image
            lightboxImg.classList.remove('loaded');

            setTimeout(() => {
                if (showing === 'front') {
                    lightboxImg.src = backUrl;
                    flipBtn.dataset.showing = 'back';
                    flipBtn.title = 'Flip to front';
                } else {
                    lightboxImg.src = frontUrl;
                    flipBtn.dataset.showing = 'front';
                    flipBtn.title = 'Flip to back';
                }
                lightboxImg.onload = () => lightboxImg.classList.add('loaded');
            }, 200);
        });

        // Direct photo link: if ?photo=N is in URL, open lightbox on that photo
        (function() {
            const photoParam = parseInt(new URLSearchParams(window.location.search).get('photo'), 10);
            if (!photoParam || photoParam < 1) return;
            const items = getGridItems();
            if (photoParam > items.length) return;
            // Defer to next tick so grid is fully ready
            requestAnimationFrame(() => openLightbox(photoParam - 1, false));
        })();

        // Cleanup on page unload (prevent memory leaks)
        window.addEventListener('beforeunload', () => {
            observer.disconnect();
            loadQueue.length = 0;
        });


        // Get Photomyne CTA event
        const getPhotomyneBtn = document.querySelector('.footer-get-photomyne');
        if (getPhotomyneBtn && window.campaignEvents) {
            getPhotomyneBtn.addEventListener('click', () => {
                window.campaignEvents.sendGtagEvent('GET_PHOTOMYNE', {}, 'Share');
            });
        }

}); // End DOMContentLoaded