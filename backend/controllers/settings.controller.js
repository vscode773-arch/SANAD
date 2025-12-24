
const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');

// Get all settings as a simple object
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        next(error);
    }
};

// Update/Create settings
exports.updateSettings = async (req, res, next) => {
    try {
        const updates = req.body; // Expect { "company_name": "...", "company_phone": "..." }
        const promises = Object.keys(updates).map(key => {
            return prisma.systemSetting.upsert({
                where: { key: key },
                update: { value: String(updates[key]) },
                create: { key: key, value: String(updates[key]) }
            });
        });

        await Promise.all(promises);
        res.json({ message: 'تم حفظ الإعدادات بنجاح' });
    } catch (error) {
        next(error);
    }
};

// Upload Logo
exports.uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'الرجاء رفع ملف صورة' });
        }

        // Generate a public URL path
        // File is saved in frontend/assets/uploads/ by multer (we'll configure multer in routes)
        // Access path: /assets/uploads/filename

        const logoPath = '/assets/uploads/' + req.file.filename;

        // Save to DB
        await prisma.systemSetting.upsert({
            where: { key: 'company_logo' },
            update: { value: logoPath },
            create: { key: 'company_logo', value: logoPath }
        });

        res.json({ message: 'تم رفع الشعار بنجاح', logoPath });
    } catch (error) {
        next(error);
    }
};
