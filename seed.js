require('dotenv').config();
const prisma = require('./backend/utils/prisma');
const bcrypt = require('bcrypt');

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    try {
        const admin = await prisma.user.upsert({
            where: { username: 'admin' },
            update: { password: hashedPassword },
            create: {
                username: 'admin',
                password: hashedPassword,
                fullName: 'النظام',
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin user created/verified: admin / admin123');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
