const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const multer = require('multer');
const adminRoutes = require("./routes/admin");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ax112211$',
    database: 'user_management',
});

const app = express();
const PORT = 3000;

// 配置中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api", adminRoutes);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.session?.user?.id || 'anonymous';
        cb(null, `${Date.now()}_${userId}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('仅支持 jpeg, jpg, png, gif 格式的图片'));
        }
    }
});

app.use(bodyParser.json());

// 上传头像接口
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '未上传任何文件' });
    }

    res.status(200).json({
        success: true,
        message: '头像上传成功',
        fileUrl: `/uploads/${req.file.filename}`
    });
}, (error, req, res, next) => {
    res.status(400).json({ success: false, message: error.message });
});

// 登录 API
app.post('/api/login', async (req, res) => {
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
});

// 用户信息 API (获取用户个人数据)
app.get('/api/user', (req, res) => {
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
});

// 保护管理员仪表盘路由
app.get('/api/admin/dashboard', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未提供 Token。' });
    }

    console.log('收到的Token:', token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Token 验证失败:', err.message);
            return res.status(403).json({ error: 'Token 无效或过期' });
        }
        console.log('Token 验证成功:', user);
        res.json({ success: true, message: '访问成功！', user });
    });
});

// 修改密码 API
app.post('/change-password', (req, res) => {
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
});

// 仪表盘路由
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }

    const { id, username } = req.session.user;
    const sql = 'SELECT username, email, created_at, avatar FROM users WHERE id =?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('查询数据库时出错:', err.message);
            return res.status(500).send(`
                <h1>服务器错误</h1>
                <p>抱歉，加载用户信息时发生错误，请稍后再试。</p>
                <a href="/">返回主页</a>
            `);
        }

        if (results.length > 0) {
            const user = results[0];
            res.send(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <title>用户仪表盘</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                        h1 { color: #333; }
                        p { color: #555; }
                        a { color: #0066cc; text-decoration: none; margin-right: 10px; }
                        .dashboard { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                        .links { margin-top: 20px; }
                        img { border-radius: 50%; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="dashboard">
                        <h1>欢迎, ${user.username}！</h1>
                        <p>邮箱: ${user.email || '未设置'}</p>
                        <p>注册时间: ${user.created_at || '未记录'}</p>
                        ${user.avatar? `<img src="${user.avatar}" alt="头像" width="150">` : '<p>未设置头像</p>'}
                        <div class="links">
                            <a href="/edit-profile.html">编辑个人信息</a>
                            <a href="/logout">登出</a><br>
                            <a href="/">返回主页</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.status(404).send(`
                <h1>未找到用户信息</h1>
                <p>无法找到相关用户信息，请尝试重新登录。</p>
                <a href="/login.html">返回登录页面</a>
            `);
        }
    });
});

// 获取当前用户信息
app.get('/user-info', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '未登录，请先登录。' });
    }

    const { id } = req.session.user;
    const sql = 'SELECT username, email FROM users WHERE id =?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('查询用户信息时出错:', err.message);
            return res.status(500).json({ success: false, message: '服务器错误' });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({ success: true, username: user.username, email: user.email });
        } else {
            res.status(404).json({ success: false, message: '未找到用户信息' });
        }
    });
});

// 更新个人信息（包含头像上传）
app.post('/edit-profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('未登录，请先登录。');
    }

    const { id } = req.session.user;
    const { username, email } = req.body;
    let avatarPath = null;

    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const uploadDir = path.join(__dirname, 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const avatarFileName = `avatar_${id}_${Date.now()}${path.extname(avatar.name)}`;
        avatarPath = `/uploads/${avatarFileName}`;
        const savePath = path.join(uploadDir, avatarFileName);

        avatar.mv(savePath, (err) => {
            if (err) {
                console.error('头像上传失败:', err.message);
                return res.status(500).send('头像上传失败，请稍后重试。');
            }

            updateUserInfo();
        });
    } else {
        updateUserInfo();
    }

    function updateUserInfo() {
        const fields = [];
        const values = [];

        if (username) {
            fields.push('username = ?');
            values.push(username);
            req.session.user.username = username;
        }

        if (email) {
            fields.push('email = ?');
            values.push(email);
        }

        if (avatarPath) {
            fields.push('avatar = ?');
            values.push(avatarPath);
        }

        if (fields.length === 0) {
            return res.status(400).send('没有要更新的信息。');
        }

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

        db.query(sql, values, (err, results) => {
            if (err) {
                console.error('更新用户信息时出错:', err.message);
                return res.status(500).send('服务器错误，更新失败，请稍后重试。');
            }

            if (results.affectedRows > 0) {
                res.redirect('/dashboard');
            } else {
                res.status(400).send('更新失败，请重试。');
            }
        });
    }
});

// 登出 API
app.get('/logout', (req, res) => {
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
});

// 测试数据库连接
db.connect((err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        return;
    }
    console.log('成功连接到 MySQL 数据库！');
});

// 根路径路由
app.get('/', (req, res) => {
    const isLoggedIn = req.session.user? true : false;
    const username = req.session.user? req.session.user.username : '';

    res.send(`
        <h1>欢迎来到用户管理系统</h1>
        <p>你可以使用以下功能：</p>
        <ul>
            <li><a href="/register.html">注册</a></li>
            <li><a href="/login.html">登录</a></li>
            <li><a href="/change-password.html">修改密码</a></li>
            ${isLoggedIn? `<li><a href="/dashboard">仪表盘</a></li>` : ''}
        </ul>
        ${isLoggedIn? `<p>欢迎, ${username} | <a href="#" id="logoutLink">注销</a></p>` : ''}
        <script>
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const response = await fetch('/logout', { method: 'GET' });
                    if (response.ok) {
                        alert('已注销成功');
                        window.location.href = '/';
                    } else {
                        alert('注销失败，请重试');
                    }
                });
            }
        </script>
    `);
});

// 监听服务器
app.listen(PORT, () => {
    console.log("当前的密钥是:", process.env.ACCESS_TOKEN_SECRET);
    console.log(`服务器正在运行: http://localhost:${PORT}`);
});