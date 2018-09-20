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
//更新用户路由
router.post('/update',function (req,res) {
  const userid = req.cookie.userid
  if(!userid){
    return res.send({code:1,msg:'请先登录'})
  }
  // 更新数据库中对应的数据
  UserModel.findByIdAndUpdate({_id: userid}, req.body, function (err, user) {// user是数据库中原来的数据
    const {_id, username, type} = user
    // node端 ...不可用
    // const data = {...req.body, _id, username, type}
    // 合并用户信息
    const data = Object.assign(req.body, {_id, username, type})
    // assign(obj1, obj2, obj3,...) // 将多个指定的对象进行合并, 返回一个合并后的对象
    res.send({code: 0, data})
  })
})

//搭建整体界面
//根据cookie获取对应的user
router.get('/user',function (req,res) {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({code:1,msg:'请先登录'})
  }
  UserModel.findOne({_id:userid},filter,function (err,user) {
    return res.send({code: 0,data: user})
  })
})

module.exports = router;
