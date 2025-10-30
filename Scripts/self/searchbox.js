// Search Box JavaScript with Autocomplete
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchAutocomplete = document.getElementById('search-autocomplete');
    const clearIcon = document.querySelector('.clear-icon');

    let searchTimeout;
    let currentSearchTerm = '';

    if (!searchInput) return;

    // ========================
    // Search Input Handler
    // ========================
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim();
        currentSearchTerm = searchTerm;

        // Clear timeout cũ
        clearTimeout(searchTimeout);

        // Nếu input rỗng hoặc quá ngắn, ẩn autocomplete
        if (searchTerm.length < 2) {
            hideAutocomplete();
            return;
        }

        // Debounce: Chờ 500ms sau khi người dùng ngừng gõ
        searchTimeout = setTimeout(() => {
            performQuickSearch(searchTerm);
        }, 500);
    });

    // ========================
    // Clear Search
    // ========================
    if (clearIcon) {
        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            hideAutocomplete();
            searchInput.focus();
        });
    }

    // ========================
    // Form Submit Handler
    // ========================
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();

            if (searchTerm.length < 2) {
                showNotification('warning', 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm');
                return;
            }

            // Chuyển đến trang kết quả tìm kiếm
            window.location.href = `/Search?q=${encodeURIComponent(searchTerm)}`;
        });
    }

    // ========================
    // Click outside to close
    // ========================
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchAutocomplete.contains(e.target)) {
            hideAutocomplete();
        }
    });

    // Focus vào search input hiển thị lại kết quả cũ (nếu có)
    searchInput.addEventListener('focus', () => {
        if (currentSearchTerm.length >= 2 && searchAutocomplete.children.length > 0) {
            showAutocomplete();
        }
    });

    // ========================
    // Perform Quick Search
    // ========================
    function performQuickSearch(searchTerm) {
        // Hiển thị loading
        showLoadingState();

        fetch(`/Search/QuickSearch?term=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.results.length > 0) {
                    displayResults(data.results, searchTerm);
                } else {
                    displayNoResults(searchTerm);
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                displayError();
            });
    }

    // ========================
    // Display Results
    // ========================
    function displayResults(results, searchTerm) {
        let html = `
            <div class="search-autocomplete-header">
                Kết quả tìm kiếm cho "${searchTerm}"
            </div>
            <div class="search-autocomplete-list">
        `;

        results.forEach(result => {
            const priceHtml = result.originalPrice > result.price
                ? `<span class="search-autocomplete-item-price">
                    ${formatCurrency(result.price)} ₫
                    <span class="search-autocomplete-item-original-price">
                        ${formatCurrency(result.originalPrice)} ₫
                    </span>
                   </span>`
                : `<span class="search-autocomplete-item-price">
                    ${formatCurrency(result.price)} ₫
                   </span>`;

            // Highlight search term in product name
            const highlightedName = highlightSearchTerm(result.name, searchTerm);

            html += `
                <a href="${result.url}" class="search-autocomplete-item">
                    <img src="/Content/Pic/images/${result.image}" 
                         alt="${result.name}" 
                         class="search-autocomplete-item-image"
                         onerror="this.src='/Content/Pic/images/no-image.jpg'">
                    <div class="search-autocomplete-item-info">
                        <div class="search-autocomplete-item-name">${highlightedName}</div>
                        <div class="search-autocomplete-item-category">
                            <i class="fas fa-tag"></i> ${result.category}
                        </div>
                        ${priceHtml}
                    </div>
                </a>
            `;
        });

        html += `
            </div>
            <div class="search-autocomplete-footer">
                <a href="/Search?q=${encodeURIComponent(searchTerm)}" 
                   class="search-autocomplete-view-all">
                    Xem tất cả kết quả
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        searchAutocomplete.innerHTML = html;
        showAutocomplete();
    }

    // ========================
    // Display No Results
    // ========================
    function displayNoResults(searchTerm) {
        const html = `
            <div class="search-autocomplete-empty">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sản phẩm phù hợp với "<strong>${searchTerm}</strong>"</p>
                <small>Vui lòng thử từ khóa khác</small>
            </div>
        `;
        searchAutocomplete.innerHTML = html;
        showAutocomplete();
    }

    // ========================
    // Display Loading State
    // ========================
    function showLoadingState() {
        const html = `
            <div class="search-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tìm kiếm...</p>
            </div>
        `;
        searchAutocomplete.innerHTML = html;
        showAutocomplete();
    }

    // ========================
    // Display Error
    // ========================
    function displayError() {
        const html = `
            <div class="search-autocomplete-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Có lỗi xảy ra khi tìm kiếm</p>
                <small>Vui lòng thử lại sau</small>
            </div>
        `;
        searchAutocomplete.innerHTML = html;
        showAutocomplete();
    }

    // ========================
    // Show/Hide Autocomplete
    // ========================
    function showAutocomplete() {
        searchAutocomplete.classList.add('show');
    }

    function hideAutocomplete() {
        searchAutocomplete.classList.remove('show');
    }

    // ========================
    // Utility Functions
    // ========================
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount);
    }

    function highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showNotification(type, message) {
        // Reuse notification function from product-filter.js if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(type, message);
        } else {
            alert(message);
        }
    }

    // ========================
    // Keyboard Navigation
    // ========================
    let selectedIndex = -1;
    const ARROW_UP = 38;
    const ARROW_DOWN = 40;
    const ENTER = 13;
    const ESC = 27;

    searchInput.addEventListener('keydown', (e) => {
        const items = searchAutocomplete.querySelectorAll('.search-autocomplete-item');

        if (items.length === 0) return;

        switch (e.keyCode) {
            case ARROW_DOWN:
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items);
                break;

            case ARROW_UP:
                e.preventDefault();
                selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
                updateSelection(items);
                break;

            case ENTER:
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    e.preventDefault();
                    items[selectedIndex].click();
                }
                break;

            case ESC:
                hideAutocomplete();
                searchInput.blur();
                break;
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.backgroundColor = 'var(--bg-tertiary)';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.style.backgroundColor = '';
            }
        });
    }
});

// ========================
// Mobile Search Toggle
// ========================
const mobileSearchBtn = document.getElementById('mobile-search-btn');
const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
const mobileSearchClose = document.getElementById('mobile-search-close');
const mobileSearchInput = document.getElementById('mobile-search-input');

if (mobileSearchBtn && mobileSearchOverlay) {
    mobileSearchBtn.addEventListener('click', () => {
        mobileSearchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => mobileSearchInput.focus(), 100);
    });
}

if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', () => {
        mobileSearchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Handle mobile search input (similar to desktop)
if (mobileSearchInput) {
    let mobileSearchTimeout;

    mobileSearchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim();

        clearTimeout(mobileSearchTimeout);

        if (searchTerm.length < 2) return;

        mobileSearchTimeout = setTimeout(() => {
            performMobileSearch(searchTerm);
        }, 500);
    });
}

function performMobileSearch(searchTerm) {
    const resultsContainer = document.querySelector('.mobile-search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i><p>Đang tìm kiếm...</p></div>';

    fetch(`/Search/QuickSearch?term=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.results.length > 0) {
                displayMobileResults(data.results, searchTerm, resultsContainer);
            } else {
                resultsContainer.innerHTML = `
                    <div class="search-autocomplete-empty">
                        <i class="fas fa-search"></i>
                        <p>Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="search-autocomplete-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Có lỗi xảy ra</p>
                </div>
            `;
        });
}

function displayMobileResults(results, searchTerm, container) {
    let html = '<div class="search-autocomplete-list">';

    results.forEach(result => {
        html += `
            <a href="${result.url}" class="search-autocomplete-item">
                <img src="/Content/Pic/images/${result.image}" 
                     alt="${result.name}" 
                     class="search-autocomplete-item-image"
                     onerror="this.src='/Content/Pic/images/no-image.jpg'">
                <div class="search-autocomplete-item-info">
                    <div class="search-autocomplete-item-name">${result.name}</div>
                    <div class="search-autocomplete-item-category">${result.category}</div>
                    <div class="search-autocomplete-item-price">
                        ${new Intl.NumberFormat('vi-VN').format(result.price)} ₫
                    </div>
                </div>
            </a>
        `;
    });

    html += '</div>';
    html += `
        <div class="search-autocomplete-footer">
            <a href="/Search?q=${encodeURIComponent(searchTerm)}" 
               class="search-autocomplete-view-all">
                Xem tất cả kết quả
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;

    container.innerHTML = html;
}