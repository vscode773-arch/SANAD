
const prisma = require('../utils/prisma');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Upload Logo to Cloudinary
exports.uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'الرجاء رفع ملف صورة' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'sanad-pro/logos',
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        // Delete local temp file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        // Get the secure URL from Cloudinary
        const logoUrl = result.secure_url;

        // Save to DB
        await prisma.systemSetting.upsert({
            where: { key: 'company_logo' },
            update: { value: logoUrl },
            create: { key: 'company_logo', value: logoUrl }
        });

        res.json({ message: 'تم رفع الشعار بنجاح', logoPath: logoUrl });
    } catch (error) {
        // Clean up temp file if upload failed
        if (req.file && req.file.path) {
            try {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            } catch (e) { }
        }
        console.error('Cloudinary upload error:', error);
        next(error);
    }
};

