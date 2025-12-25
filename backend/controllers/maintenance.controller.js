const path = require('path');
const fs = require('fs');

exports.downloadBackup = (req, res, next) => {
    res.status(400).json({ message: 'النسخ الاحتياطي غير متاح لقواعد بيانات PostgreSQL السحابية حالياً. يرجى استخدام لوحة تحكم مزود الخدمة.' });
};

const prisma = require('../utils/prisma');

exports.restoreBackup = async (req, res, next) => {
    // Delete uploaded file to not clutter space
    if (req.file) {
        fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'استعادة النسخ غير مناحة لقواعد بيانات PostgreSQL السحابية حالياً.' });
};
