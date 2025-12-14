const prisma = require('../utils/prisma');

exports.getBranches = async (req, res, next) => {
    try {
        const branches = await prisma.branch.findMany({
            include: {
                _count: {
                    select: { users: true, suppliers: true }
                }
            }
        });
        res.json(branches);
    } catch (error) {
        next(error);
    }
};

exports.createBranch = async (req, res, next) => {
    try {
        const { name, location } = req.body;
        if (!name) return res.status(400).json({ message: 'اسم الفرع مطلوب' });

        const existing = await prisma.branch.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ message: 'الفرع موجود مسبقاً' });

        const branch = await prisma.branch.create({
            data: { name, location }
        });
        res.status(201).json(branch);
    } catch (error) {
        next(error);
    }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        const { id } = req.params;

        // check usage
        const branch = await prisma.branch.findUnique({
            where: { id: parseInt(id) },
            include: { _count: { select: { users: true, suppliers: true } } }
        });

        if (!branch) return res.status(404).json({ message: 'الفرع غير موجود' });

        if (branch._count.users > 0 || branch._count.suppliers > 0) {
            return res.status(400).json({ message: 'لا يمكن حذف الفرع لأنه مرتبط بمستخدمين أو موردين' });
        }

        await prisma.branch.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'تم حذف الفرع بنجاح' });
    } catch (error) {
        next(error);
    }
};
