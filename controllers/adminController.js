const jwt = require('jsonwebtoken');

exports.dashboard = (req, res) => {
    res.json({ message: '欢迎来到管理员仪表盘！' });
};