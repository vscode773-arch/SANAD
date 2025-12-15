const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                permissions: user.permissions // Add permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token, user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                permissions: user.permissions
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        const { username, password, fullName, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                fullName,
                role: role || 'USER'
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'User',
                entityId: String(newUser.id),
                details: `Created user ${newUser.username}`,
                userId: req.user.id
            }
        });

        res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', userId: newUser.id });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, fullName: true, role: true }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};
