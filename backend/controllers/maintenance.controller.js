const path = require('path');
const fs = require('fs');

exports.downloadBackup = (req, res, next) => {
    try {
        // Path to the SQLite database file
        // Assumes typical prisma setup: backend/prisma/dev.db
        const dbPath = path.join(__dirname, '../prisma/dev.db');

        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ message: 'ملف قاعدة البيانات غير موجود' });
        }

        const date = new Date().toISOString().slice(0, 10);
        const filename = `sanad-backup-${date}.db`;

        res.download(dbPath, filename, (err) => {
            if (err) {
                console.error('Error sending backup file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'حدث خطأ أثناء تحميل النسخة الاحتياطية' });
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

const prisma = require('../utils/prisma');

exports.restoreBackup = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'الرجاء رفع ملف النسخة الاحتياطية' });
        }

        const dbPath = path.join(__dirname, '../prisma/dev.db');
        const uploadPath = req.file.path;

        // Verify valid sqlite file? For now just try to swap.

        // 1. Disconnect Prisma to release lock (hopefully)
        await prisma.$disconnect();

        // 2. Backup current just in case (optional, but wise)
        const timestamp = Date.now();
        const autoBackupPath = path.join(__dirname, `../prisma/dev_autobackup_${timestamp}.db`);
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, autoBackupPath);
        }

        // 3. Replace file
        // Wait a bit for potential file locks on Windows
        setTimeout(() => {
            try {
                fs.copyFileSync(uploadPath, dbPath);

                // Remove uploaded temp file
                fs.unlinkSync(uploadPath);

                // Reconnect happens automatically on next request with PrismaClient, 
                // but we forced disconnect on the imported instance. It should handle reconnection.

                res.json({ message: 'تم استعادة النسخة الاحتياطية بنجاح. يرجى تسجيل الدخول مجدداً.' });
            } catch (err) {
                console.error('Restore Error:', err);
                // Try to restore auto backup if it failed partway?
                return res.status(500).json({ message: 'فشل استعادة النسخة. قد يكون الملف مستخدماً. حاول إيقاف الخادم واستبدال الملف يدوياً.' });
            }
        }, 1000);

    } catch (error) {
        next(error);
    }
};
