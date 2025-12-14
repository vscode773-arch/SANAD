const prisma = require('../utils/prisma');

exports.getAuditLogs = async (req, res, next) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { username: true } } },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

exports.getSummaryReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // Aggregation logic
        // Total vouchers, Total Amount
        // Group by Supplier ?

        const where = {};
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const totalAmount = await prisma.voucher.aggregate({
            _sum: { amount: true },
            where
        });

        const count = await prisma.voucher.count({ where });

        // Latest transactions
        const recent = await prisma.voucher.findMany({
            where,
            take: 5,
            orderBy: { date: 'desc' },
            include: { supplier: { select: { name: true } } }
        });

        const recentWithSupplier = recent.map(v => ({
            ...v,
            supplier: v.supplier ? v.supplier.name : v.supplierName
        }));

        res.json({
            totalAmount: totalAmount._sum.amount || 0,
            transactionCount: count,
            recentTransactions: recentWithSupplier
        });
    } catch (error) {
        next(error);
    }
};
