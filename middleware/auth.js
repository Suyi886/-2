// 权限验证中间件
function checkRole(requiredRole) {
    return (req, res, next) => {
        // 检查用户信息和角色
        if (!req.user || req.user.role!== requiredRole) {
            return res.status(403).json({ error: "权限不足，无法访问此资源" });
        }
        next(); // 角色符合要求，继续执行下一个中间件或路由处理
    };
}

module.exports = { checkRole };