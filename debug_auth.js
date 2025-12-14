const prisma = require('./backend/utils/prisma');
const bcrypt = require('bcrypt');

async function checkAdmin() {
    try {
        const user = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (user) {
            console.log('✅ Admin user found:', user);
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('✅ Password match for "admin123":', isMatch);
        } else {
            console.log('❌ Admin user NOT found');
            // Re-create
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashedPassword,
                    fullName: 'النظام',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Admin user created now.');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkAdmin();
