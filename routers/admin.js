var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        //不是管理员
        res.send('对不起,只有管理员才可以进入后台管理');
        return ;
    }
    next();
});
router.get('/',function(req,res){
    // 读取views目录下的指定文件，解析并返回给客户端
    // 第一个参数表示模板的文件，相对于views目录。
    // 第二个参数是传递给模板使用的数据
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});
router.get('/user',function(req,res){
    // 读取views目录下的指定文件，解析并返回给客户端
    // 第一个参数表示模板的文件，相对于views目录。
    // 第二个参数是传递给模板使用的数据
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    var firstpage = 0;
    var lastpage = 0;
    var skip = 0;
    User.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过总页数
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        skip = (page-1) * limit;
        //上一页
        firstpage = page - 1 < 1 ? 1 : page -1 ;
        //下一页
        lastpage = page + 1  < pages ? page + 1 : pages;
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:page,
                pages:pages,
                limit:limit,
                count:count,
                firstpage:firstpage,
                lastpage:lastpage,
                url:'user'
            });
        });
    });

});
router.get('/category',function(req,res){
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    var firstpage = 0;
    var lastpage = 0;
    var skip = 0;
    Category.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过总页数
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        skip = (page-1) * limit;
        //上一页
        firstpage = page - 1 < 1 ? 1 : page -1 ;
        //下一页
        lastpage = page + 1  < pages ? page + 1 : pages;
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                page:page,
                pages:pages,
                limit:limit,
                count:count,
                firstpage:firstpage,
                lastpage:lastpage,
                url:'category'
            });
        });
    });
});
router.get('/category/add',function(req,res){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
});
router.post('/category/add',function(req,res){
    var name = req.body.name || '';
    if(name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        });
    }
    Category.findOne({
        name:name
    }).then(function(re){
        if(re){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类已经存在'
            });
            return Promise.reject();
        }else{
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类添加成功',
            url:'/admin/category'
        });
    });
});
router.get('/category/edit',function(req,res){
    var id = req.query.id || '';
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});
router.post('/category/edit',function(req,res){
    var id = req.query.id || '';
    var name = req.body.name;
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            if(name == category.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类已存在'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }

    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    });
});
router.get('/category/delete',function(req,res){
    var id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    });
});
/*
内容首页
 */
router.get('/content',function(req,res){
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    var firstpage = 0;
    var lastpage = 0;
    var skip = 0;
    Content.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过总页数
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        skip = (page-1) * limit;
        //上一页
        firstpage = page - 1 < 1 ? 1 : page -1 ;
        //下一页
        lastpage = page + 1  < pages ? page + 1 : pages;
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,
                page:page,
                pages:pages,
                limit:limit,
                count:count,
                firstpage:firstpage,
                lastpage:lastpage,
                url:'content'
            });
        });
    });
});
router.get('/content/add',function(req,res){
    Category.find().then(function(categories){
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    });
});
router.post('/content/add',function(req,res){
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        });
        return false;
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        });
        return false;
    }
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    }).save().then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        });
    });

});
router.get('/content/edit',function(req,res){
    var id = req.query.id || '';
    var name = req.body.name;
    var categories = [];
    Category.find().then(function(re){
        categories = re;
        return Content.findOne({
            _id:id
        });
    }).then(function(content){
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'指定内容不存在'
            });
        }else{
            console.log(content);
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                content:content,
                categories:categories
            });
        }
    });
});
router.post('/content/edit',function(req,res){
    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        });
        return false;
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        });
        return false;
    }
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        });
    });
});
router.get('/content/delete',function(req,res){
    var id = req.query.id || '';
    Content.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容删除成功',
            url:'/admin/content'
        });
    });
});
module.exports = router;