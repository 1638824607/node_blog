var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');
//统一返回格式
var responseData;
router.use(function(req,res,next){
    responseData = {
        code:0,
        message:''
    };
    next();
});

router.post('/user/register',function(req,res,next){
    // 读取views目录下的指定文件，解析并返回给客户端
    // 第一个参数表示模板的文件，相对于views目录。
    // 第二个参数是传递给模板使用的数据
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if(username == ''|| password == '' || repassword == ''){
        responseData.code = 1;

        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return false;
    }
    if(password != repassword){
        responseData.code = 2;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return false;
    }
    //判断是否被注册
    User.findOne({
        username:username
    }).then(function(userinfo){
        if(userinfo){
            responseData.code = 3;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return false;
        }else{
            var user = new User({
                username:username,
                password:password
            });
            return user.save();
        }
    }).then(function(newuserinfo){
        responseData.message = '注册成功';
        req.cookies.set('userInfo', JSON.stringify({
            _id : newuserinfo._id,
            username : newuserinfo.username
        }));
        res.json(responseData);
    });
});
router.post('/user/login',function(req,res,next){
    // 读取views目录下的指定文件，解析并返回给客户端
    // 第一个参数表示模板的文件，相对于views目录。
    // 第二个参数是传递给模板使用的数据
    var username = req.body.username;
    var password = req.body.password;
    if(username == ''|| password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return false;
    }
    //判断是否被注册
    User.findOne({
        username:username,
        password:password
    }).then(function(userinfo){
        if(!userinfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return false;
        }else{
            responseData.message = '登录成功';
            responseData.userInfo = {
                _id:userinfo._id,
                username:userinfo.username
            };
            req.cookies.set('userInfo', JSON.stringify({
                _id : userinfo._id,
                username : userinfo.username
            }));
            res.json(responseData);
        }
    });
});
router.get('/user/logout',function(req,res,next){
    req.cookies.set('userInfo',null);
    responseData.message = '退出成功';
    res.json(responseData);
});
router.get('/comment',function (req, res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        responseData.data = content.comments;
        res.json(responseData)
    })
});
router.post('/comment/post',function(req,res){
    var contentId = req.body.contentid || '';
    var postData = {
        username : req.userInfo.username,
        postTime:new Date(),
        content:req.body.content
    };
    Content.findOne({
        _id : contentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});
module.exports = router;