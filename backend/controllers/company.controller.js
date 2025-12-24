const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/company');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `company-logo${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('يُسمح فقط بملفات الصور (JPEG, PNG, GIF)'));
        }
    }
});

// Get company settings
exports.getCompanySettings = async (req, res) => {
    try {
        let settings = await prisma.companySettings.findFirst();

        // If no settings exist, create default
        if (!settings) {
            settings = await prisma.companySettings.create({
                data: {
                    companyName: 'BILL PRO'
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({ message: 'خطأ في جلب إعدادات الشركة' });
    }
};

// Update company settings
exports.updateCompanySettings = async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName || companyName.trim() === '') {
            return res.status(400).json({ message: 'اسم الشركة مطلوب' });
        }

        let settings = await prisma.companySettings.findFirst();

        if (settings) {
            settings = await prisma.companySettings.update({
                where: { id: settings.id },
                data: { companyName: companyName.trim() }
            });
        } else {
            settings = await prisma.companySettings.create({
                data: { companyName: companyName.trim() }
            });
        }

        res.json({ message: 'تم تحديث إعدادات الشركة بنجاح', settings });
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ message: 'خطأ في تحديث إعدادات الشركة' });
    }
};

// Upload company logo
exports.uploadLogo = [
    upload.single('logo'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
            }

            const logoPath = `/uploads/company/${req.file.filename}`;

            let settings = await prisma.companySettings.findFirst();

            if (settings) {
                // Delete old logo if exists
                if (settings.logoPath) {
                    const oldLogoPath = path.join(__dirname, '../../', settings.logoPath);
                    if (fs.existsSync(oldLogoPath)) {
                        fs.unlinkSync(oldLogoPath);
                    }
                }

                settings = await prisma.companySettings.update({
                    where: { id: settings.id },
                    data: { logoPath }
                });
            } else {
                settings = await prisma.companySettings.create({
                    data: {
                        companyName: 'BILL PRO',
                        logoPath
                    }
                });
            }

            res.json({ message: 'تم رفع اللوجو بنجاح', settings });
        } catch (error) {
            console.error('Error uploading logo:', error);
            res.status(500).json({ message: error.message || 'خطأ في رفع اللوجو' });
        }
    }
];

// Delete company logo
exports.deleteLogo = async (req, res) => {
    try {
        let settings = await prisma.companySettings.findFirst();

        if (!settings || !settings.logoPath) {
            return res.status(404).json({ message: 'لا يوجد لوجو لحذفه' });
        }

        // Delete file from disk
        const logoPath = path.join(__dirname, '../../', settings.logoPath);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }

        // Update database
        settings = await prisma.companySettings.update({
            where: { id: settings.id },
            data: { logoPath: null }
        });

        res.json({ message: 'تم حذف اللوجو بنجاح', settings });
    } catch (error) {
        console.error('Error deleting logo:', error);
        res.status(500).json({ message: 'خطأ في حذف اللوجو' });
    }
};
