require('dotenv').config();
const bcrypt = require('bcryptjs');

const db = require(__dirname + '/db_connect');

// 創建管理員帳號

(async ()=>{
    // 宣告變數 sql 為連接資料庫 ( admins ) 表單 及 對應欄位 ( account, password_hash, nickname )
    const sql = "INSERT INTO `admins`(`account`, `password_hash`, `nickname`) VALUES (?, ?, ?)";

    // 密碼雜湊 ( 輸入需要雜湊的密碼, 輸入加鹽值[1-10] )
    const hash = await bcrypt.hash('123456', 8);

    // 在[ ]輸入 ( 帳號, hash, 暱稱 ) // hash為上方已宣告變數，不用更改
    const [result] = await db.query(sql, ['real', hash, '霈珍'])
    console.log(result);
})().catch(error=>{
    console.log(error);
});

