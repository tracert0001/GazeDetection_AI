require('dotenv').config();

const express = require('express');
const app = express(); // 建立伺服器個體
const db = require(__dirname + '/db_connect'); // 引用 db_connect.js 的資料庫連線
const bcrypt = require('bcryptjs');
const session = require('express-session');
const {Cookie} =require('express-session');
const fs = require('fs');

app.set('view engine', 'ejs'); // 指定樣板引擎
app.use(express.urlencoded({extended: false})); //使用 urlencoded
app.use(express.json()); //使用 json
app.use(express.static('public')); //使用 public 資料夾下的靜態資源
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'shidaindidahend7857373',  // 加密用的字串
    cookie: {
        maxAge: 1200000, // 單位(毫秒)
    }
}));

let {PythonShell}=require('python-shell')  //python-shell

// ===== test session =====

app.get('/try-session', (req,res)=>{
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;

    res.json({
        my_var: req.session.my_var,
        session: req.session
    });
});

// middleware

app.use((request, response, next)=>{
    response.locals.session = request.session;
    next();
});


// routes

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login', async(request, response)=>{
    const output = {
        success: false,
        error: '',
        postDate: request.body,
    };
    if(!request.body.user_name || !request.body.user_password){
        output.error = '欄位資料不足';
        return response.json(output);
    }
    
    const sql = "SELECT * FROM admins WHERE account=?";
    const [rs] = await db.query(sql, [request.body.user_name]);
    if(!rs.length){
        output.error = '帳號錯誤';
        return response.json(output);
    }
    
    const result = await bcrypt.compare(request.body.user_password, rs[0].password_hash);
    if(result){
        request.session.admin = {
            user_id: rs[0].sid,
            account: rs[0].account,
            nickname: rs[0].nickname,
        };
        output.success = true;
    } else {
        output.error = '密碼錯誤';
    }
    console.log(result);
    response.json(output);
});

// === test login ====
app.use((req, res, next)=>{
    if(!req.session.admin){
        res.redirect('/login');
    } else {
        next();
    }
});
// ====

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/videos/:vid?',async(req,res)=>{

    if(req.params.vid.length>=1){
        let rows = [];
        sql = "SELECT `video_path`, `video_txt` FROM `video` where `vid` = '"+req.params.vid+"';";
        console.log(sql);
        [rows] = await db.query(sql);
        
        if(rows.length<=0){
            console.log('video loading error');
            res.render('/');
        }else{
            console.log(rows);
            
            let videopath = rows[0]['video_path'];
            let filepath = rows[0]['video_txt'];
            console.log(videopath);
            console.log(filepath);
            let tracetb = [];

            fs.readFile('public/video_tracked/'+filepath, function(err, data) {
                if(err) throw err;
                
                tracetb = data.toString().replace(/\r\n/g,'\n').split('\n');
                for (const [i, frm_trace] of tracetb.entries() ){
                    tracetb[i] = frm_trace.split('_');
                }

                console.log('total lines : '+tracetb.length);
                res.render('video',{videopath,tracetb,totalfrm:tracetb.length});
            });
        }

    }
});

app.get('/video',async(req,res)=>{

    sql0 = "SELECT count(1) num FROM `video` where `checking`=False;";
    const [r] = await db.query(sql0);
    const totalRows = r[0]['num'];

    let rows = [];
    sql = "SELECT `video_path`, `video_txt` FROM `video` where `checking`=False;";
    [rows] = await db.query(sql);
    
    if(totalRows<=0){
        console.log('video loading error');
        res.render('video');
    }
    console.log(rows);
    
    // get random video id 
    let idx = Math.floor(Math.random()*totalRows);
    let videopath = rows[idx]['video_path'];
    let filepath = rows[idx]['video_txt'];
    console.log(videopath);
    console.log(filepath);
    let tracetb = [];

    fs.readFile('public/video_tracked/'+filepath, function(err, data) {
        if(err) throw err;
        
        tracetb = data.toString().replace(/\r\n/g,'\n').split('\n');
        for (const [i, frm_trace] of tracetb.entries() ){
            tracetb[i] = frm_trace.split('_');
        }

        console.log('total lines : '+tracetb.length);
        res.render('video',{videopath,tracetb,totalfrm:tracetb.length});
    });
});


app.get('/uploadvideo',(req,res)=>{
    res.render('uploadvideo');
});

app.post('/uploadvideo',async(req,res)=>{
    videoid=Math.round(Math.random()*1000000)
    const output = {
        Url:req.body.videoUrl,
        vlen:req.body.videolength,
        vid:videoid,
    }
    console.log(output)

    if(req.body.videoUrl || req.body.videolength){
        let pyshell= new PythonShell(__dirname.replace("src",'python')+"/loadvideo.py")  //send json資料到.py 
        pyshell.send(JSON.stringify(output));  // send 
        pyshell.on('message', function (message) {
            console.log('message:',message);
        });
        pyshell.end(function (err) {
            if (err) throw err;
            console.log('finished_end'); 
        });
    };    
    sqlin=`INSERT INTO video (vid,sid,video_txt,video_path,checking) VALUES ('${videoid}','${req.session.admin.user_id}','${videoid}.txt','${videoid}.mp4','1')`;
    const [r_insert] = await db.query(sqlin);
    if(r_insert){
        req.session.vid=String(videoid);
    }

    res.json(output);
    
});

app.get('/product',(req,res)=>{
    res.render('product');
});

app.get('/collection/:queue?', async(req, res)=>{
    if(req.params.queue.length>=1){
        sql = 'SELECT * from `itemlist` where class in (' + req.params.queue + ');';
    
        const [rs] = await db.query(sql);
        if(!rs.length){
            alert('查無商品');
        }
        res.render('collection',{itemlist:rs});
    }
});

app.get('/dot_test',(req,res)=>{
    if(!req.session.vid){
        req.session.vid='';
    }   
    res.render('dot_test',{video_id:req.session.vid});
});


app.get('/vision',(req,res)=>{
    res.render('vision');
});


app.get('/logout', (req, res)=>{
    delete req.session.admin;
    delete req.session.vid;
    res.redirect('/');
});



const port = process.env.PORT || 3000;

// 404 處理

app.use((req, res)=>{
    res.type('text/html').status(404).send(`<h1>404 找不到頁面</h1>`);
});

// CMD 啟動時的提示

app.listen(port,()=>{
    console.log('Web Server 啟動' + port)
});