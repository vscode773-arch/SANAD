const prisma = require('../utils/prisma');

// Get a setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        // Default to true if not found
        res.json({ value: setting ? setting.value : 'true' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a setting
exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper for internal use
exports.getSettingValue = async (key) => {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting ? setting.value : 'true';
};
