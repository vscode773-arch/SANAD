const prisma = require('./backend/utils/prisma');
const bcrypt = require('bcrypt');

async function fixAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
            where: { username: 'admin' },
            data: { password: hashedPassword }
        });
        console.log('✅ Admin password reset to "admin123" successfully.');
    } catch (e) {
        console.error('Error:', e);
    }
}

fixAdmin();
