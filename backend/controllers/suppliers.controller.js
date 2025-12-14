const prisma = require('../utils/prisma');

exports.getSuppliers = async (req, res, next) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        next(error);
    }
};

exports.createSupplier = async (req, res, next) => {
    try {
        const { name, phone, email, address } = req.body;
        const supplier = await prisma.supplier.create({
            data: { name, phone, email, address }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'Supplier',
                entityId: String(supplier.id),
                details: `Supplier ${name} created`,
                userId: req.user.id
            }
        });

        res.status(201).json(supplier);
    } catch (error) {
        // Unique constraint
        if (error.code === 'P2002') return res.status(400).json({ message: 'اسم المورد موجود مسبقاً' });
        next(error);
    }
};

exports.updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address } = req.body;

        const supplier = await prisma.supplier.update({
            where: { id: parseInt(id) },
            data: { name, phone, email, address }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'Supplier',
                entityId: String(id),
                details: `Supplier ${name} updated`,
                userId: req.user.id
            }
        });

        res.json(supplier);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'اسم المورد موجود مسبقاً' });
        next(error);
    }
};

exports.deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for existing vouchers
        const vouchersCount = await prisma.voucher.count({
            where: { supplierId: parseInt(id) }
        });

        if (vouchersCount > 0) {
            return res.status(400).json({ message: 'لا يمكن حذف المورد لوجود سندات مسجلة باسمه' });
        }

        await prisma.supplier.delete({ where: { id: parseInt(id) } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'Supplier',
                entityId: String(id),
                details: `Supplier deleted`,
                userId: req.user.id
            }
        });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        next(error);
    }
};
