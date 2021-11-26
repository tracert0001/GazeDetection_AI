const mysql = require('mysql2');

// 建立資料庫連線
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password : process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 最大連線數
  queueLimit: 0
});

module.exports = pool.promise();