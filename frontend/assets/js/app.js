// Setup Navbar
document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <div class="container navbar-content" id="navContainer">
            <div class="nav-header">
                <a href="/" class="logo">السند برو</a>
                <button class="menu-toggle" onclick="toggleMenu()">☰</button>
            </div>
            <div class="nav-links">
                <a href="/index.html" class="nav-link">الرئيسية</a>
                <a href="/vouchers.html" class="nav-link">السندات</a>
                <a href="/suppliers.html" class="nav-link">الموردين</a>
                <a href="/reports.html" class="nav-link">التقارير</a>
                <a href="/branches.html" class="nav-link" id="navBranches" style="display:none">الفروع</a>
                <a href="/users.html" class="nav-link" id="navUsers" style="display:none">المستخدمين</a>
                <a href="/settings.html" class="nav-link" id="navSettings" style="display:none">الإعدادات</a>
            </div>
            <div class="nav-user-area" style="display: flex; gap: 1rem; align-items: center;">
                <span id="userDisplay" style="font-weight: 500;"></span>
                <button onclick="logout()" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">خروج</button>
            </div>
        </div>
    </nav>
    `;

    window.toggleMenu = () => {
        const container = document.getElementById('navContainer');
        container.classList.toggle('active');
        const links = container.querySelector('.nav-links');
        links.classList.toggle('active');
        // also toggle user area? CSS handles it via .nav-container.active .nav-user-area
    };

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
        const navBranches = document.getElementById('navBranches');
        if (navBranches) navBranches.style.display = 'block';
    }

    initNotifications();
});

// Notification System
let lastCheckTime = new Date().toISOString();

function initNotifications() {
    if (!("Notification" in window)) return;

    // Request permission if default
    if (Notification.permission === "default") {
        // Maybe better to ask on a button click, but let's try auto for now
        Notification.requestPermission();
    }

    // Start polling every minute
    setInterval(checkForNotifications, 60000);
}

async function checkForNotifications() {
    if (Notification.permission !== "granted") return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const activities = await Api.getRecentActivities(lastCheckTime);
        if (activities && activities.length > 0) {
            // Update last check to the newest log time
            if (activities[0]) lastCheckTime = activities[0].createdAt; // Assuming desc order

            activities.forEach(log => {
                let msg = '';
                if (log.action === 'CREATE' && log.entity === 'Voucher') msg = `تم إضافة سند جديد بواسطة ${log.user?.username}`;
                if (log.action === 'UPDATE' && log.entity === 'Voucher') msg = `تم تعديل سند بواسطة ${log.user?.username}`;

                if (msg) {
                    new Notification("تنبيه سندات", {
                        body: msg,
                        // icon: '/assets/icon.png' 
                    });
                }
            });
        }
    } catch (e) {
        console.error("Notification check failed", e);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
