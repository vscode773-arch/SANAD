const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, fullName: true, role: true, createdAt: true, branch: true }
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const { username, password, fullName, role, branchId } = req.body;

        // Validation handled somewhat by frontend, strict here
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                fullName,
                role: role || 'USER',
                branchId: branchId ? parseInt(branchId) : null
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'User',
                entityId: String(user.id),
                details: `User ${username} created`,
                userId: req.user.id
            }
        });

        res.status(201).json({ message: 'User created' });
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً' });
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fullName, role, password, branchId } = req.body;

        const data = {
            fullName, role,
            branchId: branchId ? parseInt(branchId) : null
        };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: parseInt(id) },
            data
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'User',
                entityId: String(id),
                details: `User ${id} updated`,
                userId: req.user.id
            }
        });

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) return res.status(400).json({ message: 'لا يمكنك حذف نفسك' });

        await prisma.user.delete({ where: { id: parseInt(id) } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'User',
                entityId: String(id),
                details: `User ${id} deleted`,
                userId: req.user.id
            }
        });

        res.json({ message: 'تم الحذف بنجاح' });
    } catch (error) {
        next(error);
    }
};
