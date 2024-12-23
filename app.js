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
const authRouter = require('./routes/auth');

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
app.use('/api', userRoutes);
app.use('/auth', authRouter);
app.use('/admin', adminRoutes);

// 根路径路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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