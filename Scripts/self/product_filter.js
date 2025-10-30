// ===============================================
// Product Filter, Sort, and Load More (Merged)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // === Variables ===
    let currentSort = getCurrentSortFromURL() || 'featured';
    let currentPage = 1;
    let isLoading = false;

    // === Element Refs ===
    const productGrid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const priceDropdown = document.getElementById('priceDropdown');
    const priceDropdownMenu = document.getElementById('priceDropdownMenu');

    // ========================
    // Sort Button Handlers (From product_filter.js)
    // ========================
    const sortButtons = document.querySelectorAll('.sort-btn:not(.dropdown-toggle)');
    sortButtons.forEach(button => {
        button.addEventListener('click', function () {
            const sortType = this.getAttribute('data-sort');
            if (sortType) {
                handleSort(sortType);
            }
        });
    });

    // ========================
    // Price Dropdown Handler (From product_filter.js)
    // ========================
    if (priceDropdown && priceDropdownMenu) {
        priceDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
            priceDropdownMenu.classList.toggle('show');
            this.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!priceDropdown.contains(e.target)) {
                priceDropdownMenu.classList.remove('show');
                priceDropdown.classList.remove('show');
            }
        });

        // Handle dropdown item clicks
        const dropdownItems = priceDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                const sortType = this.getAttribute('data-sort');
                priceDropdownMenu.classList.remove('show');
                priceDropdown.classList.remove('show');
                handleSort(sortType);
            });
        });
    }

    // ========================
    // Load More Handler (From temp.js - Advanced)
    // ========================
    if (loadMoreBtn && productGrid) {
        loadMoreBtn.addEventListener('click', function () {
            const nextPage = parseInt(this.getAttribute('data-page')) || 1;
            const typeProductId = this.dataset.typeId; // Lấy typeId từ dataset

            console.log(`▶ Gọi API LoadMoreProducts (typeProductId=${typeProductId}, page=${nextPage})`);
            loadMoreProducts(nextPage, typeProductId);
        });
    }

    // ========================
    // Sort Handler Function (From product_filter.js)
    // ========================
    function handleSort(sortType) {
        // Update URL and reload page
        const url = new URL(window.location);
        url.searchParams.set('sortBy', sortType);
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    }

    // ========================
    // Load More Products (From temp.js - Advanced)
    // ========================
    function loadMoreProducts(page, typeProductId) {
        if (isLoading) return;
        isLoading = true;

        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        // Gửi typeProductId trong URL
        fetch(`/Products/LoadMoreProducts?typeProductId=${typeProductId}&sortBy=${currentSort}&page=${page}`)
            .then(response => response.json())
            .then(data => {
                console.log('✅ API Response:', data);
                if (data.success && data.products && data.products.length > 0) {
                    data.products.forEach((product, index) => {
                        const productCard = createProductCard(product);
                        productGrid.appendChild(productCard);

                        // Hiệu ứng fade-in
                        setTimeout(() => {
                            productCard.classList.add('fade-in');
                        }, index * 40);
                    });

                    // Cập nhật trang hiện tại
                    currentPage = data.currentPage;

                    // Hiển thị lại nút nếu còn dữ liệu
                    if (data.hasMore) {
                        loadMoreBtn.setAttribute('data-page', currentPage + 1);
                        loadMoreBtn.style.display = 'inline-flex';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }

                    updateProductCount();
                } else {
                    console.warn('⚠ Không có sản phẩm nào để tải thêm.');
                    loadMoreBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('❌ Lỗi khi tải sản phẩm:', error);
                alert('Không thể tải thêm sản phẩm. Vui lòng thử lại!');
                if (loadMoreBtn) loadMoreBtn.style.display = 'inline-flex';
            })
            .finally(() => {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                isLoading = false;
            });
    }

    // ========================
    // Create Product Card HTML (Best of Both)
    // ========================
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        let badgesHTML = '';
        if (product.is_new)
            badgesHTML += '<div class="product-badge badge-new">Mới</div>';
        if (product.discount_percent > 0)
            badgesHTML += `<div class="product-badge badge-discount">-${product.discount_percent}%</div>`;

        let priceHTML = `<div class="product-price">${formatCurrency(product.sale_price)} ₫</div>`;
        if (product.original_price > product.sale_price)
            priceHTML += `<div class="product-original-price">${formatCurrency(product.original_price)} ₫</div>`;

        let descHTML = '<ul>';
        if (product.product_description && product.product_description.length > 0) {
            product.product_description.slice(0, 3).forEach(d => {
                descHTML += `<li>${d}</li>`;
            });
        }
        descHTML += '</ul>';

        // Sử dụng innerHTML từ product_filter.js (đầy đủ attribute hơn)
        card.innerHTML = `
            ${badgesHTML}
            <img src="/Content/Pic/images/${product.images}" 
                 alt="${product.product_name}" 
                 class="product-image"
                 onerror="this.src='/Content/Pic/images/no-image.jpg'">
            <div class="product-content">
                <h3 class="product-name">${product.product_name}</h3>
                <div class="product-price-section">
                    ${priceHTML}
                </div>
                <div class="product-description">
                    ${descHTML}
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" 
                            data-product-id="${product.product_id}"
                            onclick="addToCart(${product.product_id})">
                        <i class="fas fa-cart-plus"></i> Thêm giỏ hàng
                    </button>
                    <button class="btn btn-buy-now" 
                            data-product-id="${product.product_id}"
                            onclick="buyNow(${product.product_id})"
                            title="Mua ngay">
                        <i class="fas fa-bolt"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // ========================
    // Utility Functions
    // ========================
    function getCurrentSortFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sortBy') || 'featured';
    }

    function updateProductCount() {
        const productCards = document.querySelectorAll('.product-card');
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = `Đã hiển thị ${productCards.length} sản phẩm`;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount);
    }

    // Initialize product count on page load
    updateProductCount();
});

// ========================
// Global Functions (Called from HTML)
// ========================

/**
 * Thêm vào giỏ hàng (Từ temp.js - hiện đại)
 */
function addToCart(productId) {
    const button = event.target.closest('.btn-add-cart');
    if (!button) return; // Đảm bảo nút tồn tại

    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...';

    fetch('/Products/AddToCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification('success', data.message);
                updateCartBadge();
            } else if (data.requireLogin) {
                if (confirm(`${data.message}. Chuyển đến trang đăng nhập?`)) {
                    window.location.href = '/Account/Login?returnUrl=' + encodeURIComponent(window.location.pathname);
                }
            } else {
                showNotification('error', data.message);
            }
        })
        .catch(() => showNotification('error', 'Có lỗi xảy ra. Vui lòng thử lại!'))
        .finally(() => {
            button.disabled = false;
            button.innerHTML = originalHTML;
        });
}

/**
 * Mua ngay
 */
function buyNow(productId) {
    window.location.href = `/Checkout/Index?productId=${productId}&quantity=1`;
}

/**
 * Hiển thị thông báo (Từ product_filter.js - Tự chèn CSS)
 */
function showNotification(type, message) {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Thêm styles nếu chưa có
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 0.8rem;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                min-width: 300px;
            }
            .notification-success {
                border-left: 4px solid #10b981;
                color: #047857;
            }
            .notification-error {
                border-left: 4px solid #ef4444;
                color: #dc2626;
            }
            .notification i {
                font-size: 1.5rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Thêm vào body
    document.body.appendChild(notification);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Cập nhật số lượng giỏ hàng (Từ temp.js - hiện đại)
 */
function updateCartBadge() {
    fetch('/Home/GetCartCount')
        .then(res => res.json())
        .then(data => {
            const cartBadge = document.querySelector('#cart-toggle .badge');
            if (cartBadge) { // Xử lý cả trường hợp count = 0
                if (data.count > 0) {
                    cartBadge.textContent = data.count > 99 ? '99+' : data.count;
                    cartBadge.style.display = 'block'; // Đảm bảo nó hiển thị
                } else {
                    cartBadge.style.display = 'none'; // Ẩn nếu giỏ hàng rỗng
                }
            }
        })
        .catch(error => console.error('Error updating cart badge:', error));
}