var mongoose = require('mongoose');
//分类的表结构
module.exports = new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    addTime:{
        type:Date,
        default:new Date()
    },
    views:{
        type:Number,
        default:0
    },
    comments:{
        type:Array,
        default:[]
    },
    title:String,
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    }
});