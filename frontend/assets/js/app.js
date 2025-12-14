// Setup Navbar
document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
    <nav class="navbar">
        <div class="container navbar-content">
            <a href="/" class="logo">السند برو</a>
            <div class="nav-links">
                <a href="/index.html" class="nav-link">الرئيسية</a>
                <a href="/vouchers.html" class="nav-link">السندات</a>
                <a href="/suppliers.html" class="nav-link">الموردين</a>
                <a href="/reports.html" class="nav-link">التقارير</a>
                <a href="/users.html" class="nav-link" id="navUsers" style="display:none">المستخدمين</a>
                <a href="/settings.html" class="nav-link" id="navSettings" style="display:none">الإعدادات</a>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <span id="userDisplay" style="font-weight: 500;"></span>
                <button onclick="logout()" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">خروج</button>
            </div>
        </div>
    </nav>
    `;

    // Inject at start of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Set Active Link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === path || (path === '/' && link.getAttribute('href') === '/index.html')) {
            link.classList.add('active');
        }
    });

    // Check Auth
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        document.getElementById('userDisplay').innerText = user.fullName;
    }

    if (user.role === 'ADMIN') {
        const navUsers = document.getElementById('navUsers');
        if (navUsers) navUsers.style.display = 'block';
        const navSettings = document.getElementById('navSettings');
        if (navSettings) navSettings.style.display = 'block';
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
