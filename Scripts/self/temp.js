// ========================
// Product Filter & Load More (Fixed Version)
// ========================
document.addEventListener('DOMContentLoaded', () => {
    let currentSort = getCurrentSortFromURL() || 'featured';
    let currentPage = 1;
    let isLoading = false;

    const productGrid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // ========================
    // Load More Event Listener
    // ========================
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            const nextPage = parseInt(this.getAttribute('data-page')) || 1;
            const typeProductId = this.dataset.typeId; // ✅ luôn lấy tại thời điểm click
            console.log(`▶ Gọi API LoadMoreProducts (typeProductId=${typeProductId}, page=${nextPage})`);
            loadMoreProducts(nextPage, typeProductId);
        });
    }

    // ========================
    // Load More Products (AJAX)
    // ========================
    function loadMoreProducts(page, typeProductId) {
        if (isLoading) return;
        isLoading = true;

        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

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
                const loadingSpinner = document.getElementById('loadingSpinner');
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                isLoading = false;
            });
    }

    // ========================
    // Hàm tạo thẻ sản phẩm
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

        card.innerHTML = `
            ${badgesHTML}
            <img src="/Content/Pic/images/${product.images}" 
                 alt="${product.product_name}" 
                 class="product-image"
                 onerror="this.src='/Content/Pic/images/no-image.jpg'">
            <div class="product-content">
                <h3 class="product-name">${product.product_name}</h3>
                <div class="product-price-section">${priceHTML}</div>
                <div class="product-description">${descHTML}</div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" onclick="addToCart(${product.product_id})">
                        <i class="fas fa-cart-plus"></i> Thêm giỏ hàng
                    </button>
                    <button class="btn btn-buy-now" onclick="buyNow(${product.product_id})">
                        <i class="fas fa-bolt"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // ========================
    // Tiện ích chung
    // ========================
    function getCurrentSortFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sortBy') || 'featured';
    }

    function updateProductCount() {
        const count = document.querySelectorAll('.product-card').length;
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = `Đã hiển thị ${count} sản phẩm`;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount);
    }

    // Gọi cập nhật ban đầu
    updateProductCount();
});

// ========================
// Global functions
// ========================
function addToCart(productId) {
    const button = event.target.closest('.btn-add-cart');
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

function buyNow(productId) {
    window.location.href = `/Checkout/Index?productId=${productId}&quantity=1`;
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCartBadge() {
    fetch('/Home/GetCartCount')
        .then(res => res.json())
        .then(data => {
            const cartBadge = document.querySelector('#cart-toggle .badge');
            if (cartBadge && data.count > 0) {
                cartBadge.textContent = data.count > 99 ? '99+' : data.count;
            }
        })
        .catch(console.error);
}
