const prisma = require('./backend/utils/prisma');

async function check() {
    console.log('Checking Prisma Supplier...');
    if (prisma.supplier) {
        console.log('✅ prisma.supplier is defined');
        try {
            await prisma.supplier.count();
            console.log('✅ DB Connection working');
        } catch (e) { console.error('DB Error:', e.message); }
    } else {
        console.error('❌ prisma.supplier is UNDEFINED. Client generation required.');
    }
}

check();
