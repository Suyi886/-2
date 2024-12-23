const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db'); // 假设你有一个 db.js 文件来处理数据库连接

// 用户登录接口
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE username =?";
        const [users] = await db.query(sql, [username]);

        if (users.length === 0) {
            return res.status(401).json({ error: "用户不存在" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "密码错误" });
        }

        // 生成 JWT Token，包含用户角色信息
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, // 角色传入 token
            process.env.ACCESS_TOKEN_SECRET, // 这里要替换为你自己的密钥，保证安全性
            { expiresIn: "1h" }
        );

        res.json({ message: "登录成功", token });
    } catch (err) {
        res.status(500).json({ error: "登录失败" });
    }
});

module.exports = router;