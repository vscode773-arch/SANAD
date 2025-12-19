const prisma = require('../utils/prisma');

// Helper to generate voucher number
async function generateVoucherNo() {
    const year = new Date().getFullYear();

    // Find the last voucher created in this year
    const lastVoucher = await prisma.voucher.findFirst({
        where: {
            date: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            },
        },
        orderBy: {
            voucherNo: 'desc', // Get the highest number
        },
    });

    let nextNum = 1;
    if (lastVoucher && lastVoucher.voucherNo) {
        // Extract the number part (assumes format V-YYYY-XXXX)
        const parts = lastVoucher.voucherNo.split('-');
        if (parts.length === 3) {
            nextNum = parseInt(parts[2]) + 1;
        }
    }

    // Format: V-YYYY-0001
    return `V-${year}-${String(nextNum).padStart(4, '0')}`;
}

const notificationService = require('../services/oneSignal.service');

exports.createVoucher = async (req, res, next) => {
    try {
        const { date, supplierId, amount, paymentMethod, description } = req.body;
        const voucherNo = await generateVoucherNo();

        // Get supplier name for snapshot (optional, but good for history)
        const supplier = await prisma.supplier.findUnique({ where: { id: parseInt(supplierId) } });
        if (!supplier) return res.status(400).json({ message: 'المورد غير صالح' });

        // Fetch user to get branchId (since it might not be in token yet)
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const voucher = await prisma.voucher.create({
            data: {
                voucherNo,
                date: new Date(date),
                supplierId: parseInt(supplierId),
                supplierName: supplier.name,
                amount,
                paymentMethod,
                description,
                createdById: req.user.id,
                branchId: user.branchId // Link to user's branch
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'Voucher',
                entityId: String(voucher.id),
                details: `Voucher ${voucherNo} created for ${supplier.name}`,
                userId: req.user.id
            }
        });

        // Send Push Notification (Re-enabled with Safety)
        try {
            const notifTitle = "سند صرف جديد";
            const notifMsg = `تم إنشاء سند رقم ${voucherNo} بقيمة ${amount} للمورد ${supplier.name} بواسطة ${user.fullName}`;
            // Don't await this, let it run in background, but catch errors inside
            notificationService.sendNotificationToAdmins(notifTitle, notifMsg).catch(err => console.error("Notification Error:", err.message));
        } catch (notifErr) {
            console.error("Failed to initiate notification:", notifErr);
        }

        res.status(201).json(voucher);
    } catch (error) {
        next(error);
    }
};

exports.getVouchers = async (req, res, next) => {
    try {
        const { startDate, endDate, supplier, branchId, page = 1, limit = 50 } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        if (supplier) {
            where.OR = [
                { supplierName: { contains: supplier } },
                { supplier: { name: { contains: supplier } } }
            ];
        }

        // Branch Filter
        if (branchId) {
            where.branchId = parseInt(branchId);
        }

        // PERMISSION CHECK: VISIBILITY
        // If NOT Admin AND NOT Accountant AND DOES NOT have 'view_all_data' permission
        const userPerms = req.user.permissions ? JSON.parse(req.user.permissions) : [];
        const canViewAll = req.user.role === 'ADMIN' ||
            req.user.role === 'ACCOUNTANT' ||
            userPerms.includes('view_all_data');

        if (!canViewAll) {
            where.createdById = req.user.id;
        }

        const skip = (page - 1) * limit;

        const [vouchers, total] = await Promise.all([
            prisma.voucher.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                include: {
                    createdBy: { select: { fullName: true, username: true } },
                    supplier: { select: { name: true } },
                    branch: { select: { name: true } }
                },
                orderBy: { date: 'desc' }
            }),
            prisma.voucher.count({ where })
        ]);

        // Transform for frontend slightly so it handles both linked and snapshot name
        const data = vouchers.map(v => ({
            ...v,
            supplier: v.supplier ? v.supplier.name : v.supplierName
        }));

        res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

exports.updateVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, supplierId, amount, paymentMethod, description } = req.body;

        const original = await prisma.voucher.findUnique({ where: { id: parseInt(id) } });

        if (!original) return res.status(404).json({ message: 'السند غير موجود' });

        // Check supplier if changed
        let supplierName = undefined;
        if (supplierId) {
            const sup = await prisma.supplier.findUnique({ where: { id: parseInt(supplierId) } });
            if (sup) supplierName = sup.name;
        }

        const updated = await prisma.voucher.update({
            where: { id: parseInt(id) },
            data: {
                date: date ? new Date(date) : undefined,
                supplierId: supplierId ? parseInt(supplierId) : undefined,
                supplierName: supplierName,
                amount,
                paymentMethod,
                description
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'Voucher',
                entityId: String(id),
                details: `Voucher ${original.voucherNo} updated.`,
                userId: req.user.id
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

exports.deleteVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const original = await prisma.voucher.findUnique({ where: { id: parseInt(id) } });

        if (!original) return res.status(404).json({ message: 'السند غير موجود' });

        await prisma.voucher.delete({ where: { id: parseInt(id) } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'Voucher',
                entityId: String(id),
                details: `Voucher ${original.voucherNo} deleted`,
                userId: req.user.id
            }
        });

        res.json({ message: 'تم حذف السند بنجاح' });
    } catch (error) {
        next(error);
    }
};
