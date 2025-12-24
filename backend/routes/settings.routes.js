
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../frontend/assets/uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Use timestamp to avoid cache issues + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'logo-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('الرجاء رفع ملف صورة صحيح (png, jpg)'));
        }
    }
});

// GET Settings - Accessible by logged in users (or even public if needed for specific things, but auth is safer)
router.get('/', authenticate, settingsController.getSettings);

// UPDATE Settings - Admin Only (or Manager)
router.put('/', authenticate, authorize(['ADMIN']), settingsController.updateSettings);

// UPLOAD Logo - Admin Only
router.post('/logo', authenticate, authorize(['ADMIN']), upload.single('logo'), settingsController.uploadLogo);

module.exports = router;
