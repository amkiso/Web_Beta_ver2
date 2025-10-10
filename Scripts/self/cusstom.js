
        // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('overlay');
    const sidebarToggle = document.getElementById('sidebarToggle');

        // Mobile menu toggle
        menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('expanded');
    overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
    sidebar.classList.add('hidden');
    mainContent.classList.add('expanded');
    overlay.classList.remove('active');
        });

        // Desktop sidebar collapse toggle
        sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
        });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

        themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
            } else {
        themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
            }
        });

    // Handle sidebar on resize
    function handleResize() {
            if (window.innerWidth > 768) {
        sidebar.classList.remove('hidden', 'active');
    overlay.classList.remove('active');

    // Maintain collapsed state on desktop
    if (sidebar.classList.contains('collapsed')) {
        mainContent.classList.add('collapsed');
    mainContent.classList.remove('expanded');
                } else {
        mainContent.classList.remove('expanded', 'collapsed');
                }
            } else {
        sidebar.classList.add('hidden');
    sidebar.classList.remove('collapsed');
    mainContent.classList.add('expanded');
    mainContent.classList.remove('collapsed');
            }
        }

    window.addEventListener('resize', handleResize);
handleResize();
//ở _Layout.cshtml
document.addEventListener('DOMContentLoaded', () => {
    const avatarToggle = document.getElementById('user-avatar-toggle');
    const userMenu = document.getElementById('user-menu');

    if (!avatarToggle || !userMenu) return;

    // Toggle hiển thị khi click avatar
    avatarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    // Ẩn menu khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && !avatarToggle.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    // Đóng menu khi resize (đề phòng lỗi layout)
    window.addEventListener('resize', () => {
        userMenu.classList.remove('active');
    });
});
