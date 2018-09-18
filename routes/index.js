var express = require('express');
var router = express.Router();
const md5=require('blueimp-md5')
const {UserModel}=require('../db/models')
const filter = {password: 0, __v: 0}

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// router.post('/register',function (req,res) {
//   const {username,password}=req.body
//    if(username==='admin'){
//     res.send({code:1,msg:'此用户已存在了'})
//    }else {
//      res.json({code:0,data:{_id: 'abc123', username}})
//    }
// })
router.get('/',function (req,res,next) {
  res.render('index',{title:'Express'})
})
router.post('/register',function (req,res) {
  const {username,password,type} =req.body
  UserModel.findOne({username},function (error,userDoc) {
    if(error){
      console.log(error)
    }else{
      if(userDoc){
        res.send({
          "code": 1,
          "msg": "此用户已存在"
        })
      }else{
        new UserModel({username, password: md5(password), type}).save((error, userDoc)=>{
          if(error){
            console.log(error)
          }else{
            const _id=userDoc._id
            res.cookie('userid',_id)
            res.send({
              code: 0,
              data: {
                _id,
                username,
                type
              }
            })
          }
        })
      }
    }
  })
})

//定义登陆
router.post('/login',function (req,res) {
  const {username,password}=req.body
  UserModel.findOne({username,password:md5(password)},filter,function (error,userDoc) {
    if(!userDoc){
      res.send({
        "code": 1,
        "msg": "用户名或密码错误"
      })
    }else{
      res.cookie('userid',userDoc._id)
      res.send({
        code: 0,
        data: userDoc
      })
    }
  })
})
module.exports = router;
