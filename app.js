const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 引入自定义模块
const db = require('./db');
const middlewares = require('./middlewares');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(bodyParser.json());
app.use(middlewares.upload.single('avatar'));

// 挂载路由
app.use('/api', adminRoutes);
app.use('/api', userRoutes);

// 根路径路由
app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const username = req.session.user ? req.session.user.username : '';

    res.send(`
        <h1>欢迎来到用户管理系统</h1>
        <p>你可以使用以下功能：</p>
        <ul>
            <li><a href="/register.html">注册</a></li>
            <li><a href="/login.html">登录</a></li>
            <li><a href="/change-password.html">修改密码</a></li>
            ${isLoggedIn ? `<li><a href="/dashboard">仪表盘</a></li>` : ''}
        </ul>
        ${isLoggedIn ? `<p>欢迎, ${username} | <a href="#" id="logoutLink">注销</a></p>` : ''}
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

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 监听服务器
app.listen(PORT, () => {
    console.log("当前的密钥是:", process.env.ACCESS_TOKEN_SECRET);
    console.log(`服务器正在运行: http://localhost:${PORT}`);
});