// Setup Navbar
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Navbar IMMEDIATELY (Before anything else)
    const navHTML = `
    <nav class="navbar">
        <div class="container navbar-content" id="navContainer">
            <div class="nav-header">
                <a href="/" class="logo">BILL PRO</a>
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
                <button onclick="requestNotifyPermission()" title="تفعيل الإشعارات" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">🔔</button>
                <span id="userDisplay" style="font-weight: 500;"></span>
                <button onclick="logout()" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">خروج</button>
            </div>
        </div>
    </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // 2. Set Active Link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === path || (path === '/' && link.getAttribute('href') === '/index.html')) {
            link.classList.add('active');
        }
    });

    window.toggleMenu = () => {
        const container = document.getElementById('navContainer');
        container.classList.toggle('active');
    };

    // 3. Check Auth (Safe check)
    const token = localStorage.getItem('token');
    if (!token) {
        // Only redirect if NOT on login page
        if (!window.location.href.includes('login.html')) {
            window.location.href = '/login.html';
        }
        return; // Stop here if no token (UI is already rendered)
    }

    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
            document.getElementById('userDisplay').innerText = user.fullName;
        }

        // Show Admin/Accountant Links
        const perms = user.permissions ? JSON.parse(user.permissions) : [];
        if (user.role === 'ADMIN') {
            ['navUsers', 'navSettings', 'navBranches'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });
        }
        // Example: if user has 'manage_users' perm
        if (perms.includes('manage_users')) {
            const el = document.getElementById('navUsers');
            if (el) el.style.display = 'block';
        }

        // 4. Init Notifications (Safe Mode)
        setTimeout(initNotifications, 2000); // Delay slightly to not block render
    } catch (e) {
        console.error('Auth setup error:', e);
        // Don't alert here, just log
    }
});

// Notification System - Now using OneSignal
window.OneSignal = window.OneSignal || [];

function initNotifications() {
    // Inject OneSignal SDK if not already present
    if (!document.getElementById('onesignal-sdk')) {
        const script = document.createElement('script');
        script.id = 'onesignal-sdk';
        script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
        script.async = true;
        document.head.appendChild(script);
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(function () {
        window.OneSignal.init({
            appId: "650ff893-4616-4af8-b668-fe272cc9374c", // BILL PRO App ID (Force Refresh)
            safari_web_id: "", // Optional
            notifyButton: {
                enable: false, // We use custom button
            },
            allowLocalhostAsSecureOrigin: true, // For testing

        });

        // Tag the user for segmentation based on permissions
        if (user.role) {
            OneSignal.sendTag("role", user.role);
            OneSignal.sendTag("username", user.username);

            const perms = user.permissions ? JSON.parse(user.permissions) : [];
            if (perms.includes('receive_notifications')) {
                OneSignal.sendTag("notify", "true");
                console.log("🔔 Notifications ENABLED for this user");
            } else {
                OneSignal.deleteTag("notify");
                console.log("🔕 Notifications DISABLED for this user");
            }
        }

        // Check subscription status
        // OneSignal.isPushNotificationsEnabled(function(isEnabled) {
        //     if (!isEnabled) console.log("Push notifications are not enabled yet.");
        // });
    });
}

// We don't need checkForNotifications polling anymore! 
// But we keep the function name if it's called somewhere, but empty it
async function checkForNotifications() {
    // Legacy polling removed in favor of Push
}

window.requestNotifyPermission = () => {
    // Debug: Check if OneSignal is loaded
    if (!window.OneSignal) {
        alert("OneSignal SDK not loaded yet. Please wait.");
        return;
    }
    // Use OneSignal's native prompt
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(function () {
        // Check if already subscribed
        window.OneSignal.isPushNotificationsEnabled(function (isEnabled) {
            if (isEnabled) {
                alert("notifications are already enabled!");
                // Re-send tags just in case
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role) window.OneSignal.sendTag("role", user.role);
            } else {
                // Trigger prompt
                window.OneSignal.showNativePrompt();
                window.OneSignal.registerForPushNotifications(); // Alternative trigger
            }
        });
    });
};

function logout() {
    // Remove tags on logout
    OneSignal.push(function () {
        OneSignal.deleteTag("role");
        OneSignal.deleteTag("username");
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

