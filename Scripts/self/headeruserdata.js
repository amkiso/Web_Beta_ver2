// Header User Data JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // ========================
    // Menu Toggle Functions
    // ========================

    // Avatar Menu Toggle
    const avatarToggle = document.getElementById('user-avatar-toggle');
    const userMenu = document.getElementById('user-menu');

    if (avatarToggle && userMenu) {
        avatarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
            // Close other menus
            closeMenu('notification-menu');
            closeMenu('cart-menu');
        });
    }

    // Notification Menu Toggle
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationMenu = document.getElementById('notification-menu');

    if (notificationToggle && notificationMenu) {
        notificationToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationMenu.classList.toggle('active');
            // Close other menus
            closeMenu('user-menu');
            closeMenu('cart-menu');
        });
    }

    // Cart Menu Toggle
    const cartToggle = document.getElementById('cart-toggle');
    const cartMenu = document.getElementById('cart-menu');

    if (cartToggle && cartMenu) {
        cartToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cartMenu.classList.toggle('active');
            // Close other menus
            closeMenu('user-menu');
            closeMenu('notification-menu');
        });
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-avatar-container')) {
            closeMenu('user-menu');
        }
        if (!e.target.closest('.notification-container')) {
            closeMenu('notification-menu');
        }
        if (!e.target.closest('.cart-container')) {
            closeMenu('cart-menu');
        }
    });

    // Close menus on resize
    window.addEventListener('resize', () => {
        closeMenu('user-menu');
        closeMenu('notification-menu');
        closeMenu('cart-menu');
    });

    // ========================
    // Notification Functions
    // ========================

    // Mark notification as read on hover
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            if (this.classList.contains('unread')) {
                const notificationId = this.getAttribute('data-id');
                markNotificationAsRead(notificationId);
                this.classList.remove('unread');
                updateNotificationBadge();
            }
        });
    });

    // ========================
    // Cart Functions
    // ========================

    // Initialize cart total on load
    updateCartTotal();
});

// ========================
// Helper Functions
// ========================

function closeMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.classList.remove('active');
    }
}

// ========================
// Notification Functions
// ========================

function showNotificationDetail(notificationId) {
    // Get notification details via AJAX
    fetch(`/Account/GetNotificationDetail?id=${notificationId}`)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.getElementById('notification-detail-content');
            modalContent.innerHTML = `
                <h2>${data.Title}</h2>
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
                    <i class="far fa-clock"></i> ${formatDate(data.CreatedDate)}
                </div>
                <p>${data.Content}</p>
            `;

            const overlay = document.getElementById('notification-detail-overlay');
            overlay.classList.add('active');

            // Mark as read
            markNotificationAsRead(notificationId);
        })
        .catch(error => {
            console.error('Error loading notification:', error);
            alert('Không thể tải thông báo. Vui lòng thử lại!');
        });
}

function closeNotificationDetail() {
    const overlay = document.getElementById('notification-detail-overlay');
    overlay.classList.remove('active');
}

function markNotificationAsRead(notificationId) {
    // Send AJAX request to mark notification as read
    fetch('/Account/MarkNotificationAsRead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: notificationId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateNotificationBadge();
            }
        })
        .catch(error => console.error('Error marking notification as read:', error));
}

function updateNotificationBadge() {
    // Update notification count
    const unreadItems = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.querySelector('#notification-toggle .badge');
    const notificationCount = document.querySelector('.notification-count');

    if (unreadItems > 0) {
        if (badge) {
            badge.textContent = unreadItems > 99 ? '99+' : unreadItems;
        }
        if (notificationCount) {
            notificationCount.textContent = `${unreadItems} chưa đọc`;
        }
    } else {
        if (badge) {
            badge.remove();
        }
        if (notificationCount) {
            notificationCount.textContent = '0 chưa đọc';
        }
    }
}

// ========================
// Cart Functions
// ========================

function toggleCartItem(element) {
    const checkbox = element.querySelector('.cart-checkbox');
    if (checkbox && event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateCartTotal();
    }
}

function toggleAllCartItems() {
    const selectAllCheckbox = document.getElementById('select-all-cart');
    const allCheckboxes = document.querySelectorAll('.cart-checkbox');

    allCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateCartTotal();
}

function updateCartTotal() {
    const checkedBoxes = document.querySelectorAll('.cart-checkbox:checked');
    let total = 0;

    checkedBoxes.forEach(checkbox => {
        const price = parseFloat(checkbox.getAttribute('data-price'));
        total += price;
    });

    const totalElement = document.getElementById('cart-total-price');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total) + ' đ';
    }

    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById('select-all-cart');
    const allCheckboxes = document.querySelectorAll('.cart-checkbox');
    if (selectAllCheckbox && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = checkedBoxes.length === allCheckboxes.length;
    }
}

function proceedToCheckout() {
    const checkedBoxes = document.querySelectorAll('.cart-checkbox:checked');

    if (checkedBoxes.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
        return;
    }

    // Get selected product IDs
    const selectedProducts = [];
    checkedBoxes.forEach(checkbox => {
        const cartItem = checkbox.closest('.cart-item');
        const productId = cartItem.getAttribute('data-id');
        selectedProducts.push(productId);
    });

    // Redirect to checkout page with selected products
    window.location.href = `/Checkout/Index?products=${selectedProducts.join(',')}`;
}

// ========================
// Utility Functions
// ========================

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ngày trước`;
    } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
// Debug và fix menu người dùng
console.log('🔍 Debug Menu Script Loaded');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM Content Loaded');

    // Tìm các elements
    const avatarToggle = document.getElementById('user-avatar-toggle');
    const userMenu = document.getElementById('user-menu');

    console.log('Avatar Toggle:', avatarToggle);
    console.log('User Menu:', userMenu);

    if (!avatarToggle) {
        console.error('❌ Không tìm thấy element #user-avatar-toggle');
        return;
    }

    if (!userMenu) {
        console.error('❌ Không tìm thấy element #user-menu');
        return;
    }

    console.log('✅ Tìm thấy tất cả elements cần thiết');

    // Xóa các event listeners cũ nếu có
    avatarToggle.removeEventListener('click', toggleUserMenu);

    // Thêm event listener mới
    avatarToggle.addEventListener('click', toggleUserMenu);

    function toggleUserMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('🖱️ Avatar clicked');
        console.log('Menu classes trước:', userMenu.className);

        // Toggle class active
        userMenu.classList.toggle('active');

        console.log('Menu classes sau:', userMenu.className);
        console.log('Menu có class active?', userMenu.classList.contains('active'));

        // Close other menus
        const notificationMenu = document.getElementById('notification-menu');
        const cartMenu = document.getElementById('cart-menu');

        if (notificationMenu) {
            notificationMenu.classList.remove('active');
            console.log('🔕 Đóng notification menu');
        }

        if (cartMenu) {
            cartMenu.classList.remove('active');
            console.log('🛒 Đóng cart menu');
        }
    }

    // Đóng menu khi click bên ngoài
    document.addEventListener('click', function (e) {
        if (!userMenu.contains(e.target) && !avatarToggle.contains(e.target)) {
            if (userMenu.classList.contains('active')) {
                console.log('👆 Click outside - đóng menu');
                userMenu.classList.remove('active');
            }
        }
    });

    // Đóng menu khi resize
    window.addEventListener('resize', function () {
        if (userMenu.classList.contains('active')) {
            console.log('📐 Resize - đóng menu');
            userMenu.classList.remove('active');
        }
    });

    // Test button (chỉ để debug)
    console.log('✅ User Menu Script khởi tạo thành công');
    console.log('Thử click vào avatar để kiểm tra menu');
});

// Backup function nếu DOMContentLoaded đã fire
if (document.readyState === 'loading') {
    console.log('⏳ Document đang loading...');
} else {
    console.log('⚡ Document đã loaded, chạy script ngay');
    // Script sẽ chạy qua DOMContentLoaded event
}
// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNotificationDetail();
    }
});