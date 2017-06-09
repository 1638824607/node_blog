var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
var pre_data = {};
router.use(function(req,res,next){
    pre_data = {
        userInfo:req.userInfo,
        categories:{}
    };
    Category.find().then(function(categories){
        pre_data.categories = categories;
        next();
    });
});

router.get('/',function(req,res,next){
    // 读取views目录下的指定文件，解析并返回给客户端
    // 第一个参数表示模板的文件，相对于views目录。
    // 第二个参数是传递给模板使用的数据
    data = {
        userInfo:pre_data.userInfo,
        categories:pre_data.categories,
        category:req.query.category || '',
        contents:{},
        page : Number(req.query.page || 1),
        limit : 2,
        pages : 0,
        count:0,
        skip : 0,
        url:'/'
    };
    var where = {};
    if(data.category){
        where.category = data.category;
    }
    Content.where(where).count().then(function(count){
        data.count = count;
        data.pages = Math.ceil(count / data.limit);
        data.page = Math.min(data.page,data.pages);
        data.page = Math.max(data.page,1);
        var skip = (data.page-1) * data.limit;
        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user']);
    }).then(function(contents){
        data.contents = contents;
        //console.log(contents);
        res.render('main/index',data);
    });
});
router.get('/view',function(req,res){
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id:contentId
    }).populate('user').then(function(content){
        var view_data = {
            content:content,
            categories:pre_data.categories,
            userInfo:req.userInfo
        };
        content.views++;
        content.save();
        res.render('main/view',view_data);

    });
});
module.exports = router;