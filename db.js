const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ax112211$',
    database: 'user_management',
});

db.connect((err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        return;
    }
    console.log('成功连接到 MySQL 数据库！');
});

module.exports = db;