exports.authorize = (roles = [], permission = null) => {
    // roles param can be a single role string or array
    if (typeof roles === 'string') roles = [roles];

    return (req, res, next) => {
        const user = req.user;

        // 1. If user is ADMIN, allow everything (God mode)
        if (user.role === 'ADMIN') return next();

        // 2. Check Role (Backward compatibility)
        if (roles.length && roles.includes(user.role)) return next();

        // 3. Check Granular Permission
        if (permission) {
            const userPermissions = JSON.parse(user.permissions || '[]');
            if (userPermissions.includes(permission)) return next();
        }

        return res.status(403).json({ message: 'غير مصرح لك بالقيام بهذا الإجراء' });
    };
};
