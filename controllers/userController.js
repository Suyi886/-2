const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // 用于生成随机 token

// 邮件发送配置
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'daers184@gmail.com', // 替换为你的邮箱
        pass: 'iopd vprl viur gphh'   // 替换为你的邮箱密码
    }
});

// 处理忘记密码请求
exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('查询数据库出错:', err.message);
            return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '用户不存在！' });
        }

        const user = results[0];
        // 生成随机重置 token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1小时后过期

        // 保存重置 token 和过期时间到数据库
        const updateSql = 'UPDATE users SET resetToken = ?, resetExpires = ? WHERE email = ?';
        db.query(updateSql, [resetToken, resetExpires, email], (updateErr) => {
            if (updateErr) {
                console.error('更新数据库出错:', updateErr.message);
                return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
            }

            // 发送重置密码的邮件
            const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
            transporter.sendMail({
                from: 'your-email@gmail.com',
                to: email,
                subject: '密码重置链接',
                text: `点击以下链接重置您的密码：${resetLink}`
            }, (mailErr, info) => {
                if (mailErr) {
                    console.error('发送邮件失败:', mailErr.message);
                    return res.status(500).json({ success: false, message: '发送邮件失败，请稍后重试。' });
                }

                res.json({ success: true, message: '重置链接已发送！' });
            });
        });
    });
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: '用户名/邮箱和密码不能为空。' });
    }

    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(sql, [identifier, identifier], async (err, results) => {
        if (err) {
            console.error('查询数据库出错:', err.message);
            return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: '用户不存在。' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const secretKey = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign(
                { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
                secretKey,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                message: '登录成功',
                token: accessToken,
                user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
            });
        } else {
            return res.status(401).json({ success: false, message: '密码错误。' });
        }
    });
};

exports.changePassword = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('请先登录');
    }

    const { oldPassword, newPassword } = req.body;
    const username = req.session.user.username;

    const sqlSelect = 'SELECT password FROM users WHERE username =?';
    db.query(sqlSelect, [username], async (err, results) => {
        if (err) {
            console.error('查询数据库时出错:', err.message);
            return res.status(500).send('服务器错误');
        }

        if (results.length === 0) {
            return res.status(404).send('用户不存在');
        }

        const hashedPassword = results[0].password;

        const match = await bcrypt.compare(oldPassword, hashedPassword);
        if (!match) {
            return res.status(401).send('旧密码错误');
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        const sqlUpdate = 'UPDATE users SET password =? WHERE username =?';
        db.query(sqlUpdate, [newHashedPassword, username], (err, result) => {
            if (err) {
                console.error('更新密码时出错:', err.message);
                return res.status(500).send('服务器错误');
            }

            console.log('密码修改成功:', result);
            res.send('密码修改成功！');
        });
    });
};

exports.uploadAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '未上传任何文件' });
    }

    res.status(200).json({
        success: true,
        message: '头像上传成功',
        fileUrl: `/uploads/${req.file.filename}`
    });
};

exports.getUserInfo = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: '未提供 Token。' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token 验证失败:', err.message);
            return res.status(403).json({ success: false, message: 'Token 无效或过期。' });
        }

        const sql = 'SELECT id, username, email, avatar FROM users WHERE id = ?';
        db.query(sql, [decoded.id], (err, results) => {
            if (err) {
                console.error('查询用户信息出错:', err.message);
                return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
            }

            if (results.length > 0) {
                res.json({
                    success: true,
                    username: results[0].username,
                    email: results[0].email,
                    avatar: results[0].avatar || 'default-avatar.png'
                });
            } else {
                res.status(404).json({ success: false, message: '用户不存在。' });
            }
        });
    });
};

exports.logout = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('登出时出错:', err.message);
                return res.status(500).send('登出失败，请稍后重试。');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login.html');
        });
    } else {
        res.redirect('/login.html');
    }
};

exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE resetToken = ? AND resetExpires > ?';
    db.query(sql, [token, Date.now()], async (err, results) => {
        if (err) {
            console.error('查询数据库出错:', err.message);
            return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: '重置链接无效或已过期。' });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateSql = 'UPDATE users SET password = ?, resetToken = NULL, resetExpires = NULL WHERE id = ?';
        db.query(updateSql, [hashedPassword, user.id], (updateErr) => {
            if (updateErr) {
                console.error('更新数据库出错:', updateErr.message);
                return res.status(500).json({ success: false, message: '服务器错误，请稍后重试。' });
            }

            res.json({ success: true, message: '密码已成功重置！' });
        });
    });
};