/**
 * Created by Richie on 2017/5/22.
 */
//安装node模块命令
// npm install --save 模块名
// 加载express
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parser,用来处理http请求
var bodyparser = require('body-parser');
//加载cookie模块
var cookies = require('cookies');
// 创建app应用
var app  = express();
var User = require('./models/User');
//设置静态文件托管
app.use('/public',express.static( __dirname + '/public'));

// 配置应用模板
// 定义当前应用所使用的模板引擎
//第一个参数模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模版内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的目录，第一个参数是views,第二个参数是目录
app.set('views','./views');
//注册所使用的模板引擎，第一个参数必须是view engine
app.set('view engine','html');
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//bodyparser配置
app.use(bodyparser.urlencoded({extended:true}));
//设置cookie
app.use(function(req,res,next){
    req.cookies = new cookies(req,res);
    //解析用户登录的cookies信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //获取当前登录用户的身份类型，是否是管理员
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch (e){

        }
    }else {
        next()
    }
});

// req request对象
// res response对象
// next 函数
// app.get('/',function(req,res,next){
//     // 读取views目录下的指定文件，解析并返回给客户端
//     // 第一个参数表示模板的文件，相对于views目录。
//     // 第二个参数是传递给模板使用的数据
//     res.render('index');
// });
/*
 根据不同的功能划分不同的模块
* */
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));



// 监听http请求
mongoose.connect('mongodb://localhost:27017/blog',function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(8081);
    }
});
//用户发送http请求->url->解析路由->找到匹配的规则->执行指定的绑定函数->返回对应内容到用户

