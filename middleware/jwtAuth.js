const jwt = require("jsonwebtoken");

// JWT 验证中间件
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // 从 Authorization 头部获取 token

    if (!token) {
        return res.status(401).json({ error: "未授权访问" });
    }

    try {
        const decoded = jwt.verify(token, "your_jwt_secret_key"); // 替换为你的密钥
        req.user = decoded; // 把解析出来的用户信息存入 req.user
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token 无效或过期" });
    }
}

module.exports = { authenticateJWT };