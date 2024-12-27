const jwt = require('jsonwebtoken');

exports.dashboard = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未提供 Token。' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Token 验证失败:', err.message);
            return res.status(403).json({ error: 'Token 无效或过期' });
        }
        console.log('Token 验证成功:', user);
        res.json({ success: true, message: '访问成功！', user });
    });
};