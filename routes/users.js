const express= require("express");
const bcrypt = require("bcrypt");
const {auth} = require("../middlewares/auth");
const {UserModel,userValid,loginValid, createToken} = require("../models/userModel")


const router = express.Router();

router.get("/" , async(req,res)=> {
  let perPage = Math.min(req.query.perPage,20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "-I";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try{
    let data = await UserModel
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data);
  } 
  catch(err){
    
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.get("/myEmail", auth , async(req,res) => {
  try{
    let user = await UserModel.findOne({_id:req.tokenData._id},{email:1})
    res.json(user);
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
} )


router.get("/myInfo", auth, async(req,res) => {
 
  try{
    let user = await UserModel.findOne({_id:req.tokenData._id},{password:0});
    res.json(user);

  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
  
})

router.post("/",async(req,res) => {
  let validateBody = userValid(req.body);
  if(validateBody.error){
    return res.status(400).json(validateBody.error.details)
  }
  try{
    let user = new UserModel(req.body);
   
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    user.password = "******";
    user.role = "USER";
    res.status(201).json(user)
  }
  catch(err){
    if(err.code == 11000){
      return res.status(400).json({msg:"Email already in system try login",code:11000})
    }
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.post("/login", async(req,res) => {
  let validateBody = loginValid(req.body);
  if(validateBody.error){
    return res.status(400).json(validateBody.error.details)
    
  }
  try{
    let user = await UserModel.findOne({email:req.body.email})
    if(!user){
      return res.status(401).json({msg:"email doesnt exist"})
    }
   
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
      return res.status(401).json({msg:"wrong password"})
    }

    let newToken = createToken(user._id);
    res.json({token:newToken});
  }
  catch(err){
    
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.delete("/:idDel",  async(req,res) => {

  try {
    let data= await UserModel.deleteOne({_id:req.params.idDel});
     res.json(data);
  }
  catch(err){
    console.log(err);
    res.status.apply(400).send(err);
  }
})



module.exports = router;