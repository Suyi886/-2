function checkRole(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: '无权访问' });
        }
        next();
    };
}

module.exports = checkRole;
