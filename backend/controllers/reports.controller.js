const prisma = require('../utils/prisma');

exports.getRecentActivities = async (req, res, next) => {
    try {
        const { since } = req.query; // Timestamp
        // FORCE DEPLOY: Ensure timestamp field is used

        const logs = await prisma.auditLog.findMany({
            where: {
                ...(since ? { timestamp: { gt: new Date(since) } } : {}), // Correct field name, handles optional 'since'
                // Exclude actions by the current user (don't notify me about myself)
                NOT: { userId: req.user.id }
            },
            include: { user: { select: { username: true } } },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        res.json(logs);
    } catch (error) {
        next(error);
    }
};

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
        const { startDate, endDate, branchId } = req.query;
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

        // Filter by Branch
        if (branchId) {
            where.branchId = parseInt(branchId);
        }

        // PERMISSION CHECK: VISIBILITY
        const userPerms = req.user.permissions ? JSON.parse(req.user.permissions) : [];
        const canViewAll = req.user.role === 'ADMIN' ||
            req.user.role === 'ACCOUNTANT' ||
            userPerms.includes('view_all_data');

        if (!canViewAll) {
            where.createdById = req.user.id;
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
