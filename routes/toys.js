const express= require("express");
const {auth} = require("../middlewares/auth");
const {toyModel,validateToy} = require("../models/toyModel")
const router = express.Router();


router.get("/" , async(req,res)=> {
  // Math.min -> המספר המקסימלי יהיה 20 כדי שהאקר לא ינסה
  // להוציא יותר אם אין צורך בזה מבחינת הלקוח
  let perPage = Math.min(req.query.perPage,20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  // מחליט אם הסורט מהקטן לגדול 1 או גדול לקטן 1- מינוס 
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try{
    let data = await toyModel
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data);
  } 
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err de la",err})
  }

})

router.get("/search",async(req,res) => {
    try{
      let queryS = req.query.s;
      // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
      // i -> מבטל את כל מה שקשור ל CASE SENSITVE
      let searchReg = new RegExp(queryS,"i")
      console.log(searchReg)
      let data = await toyModel.find({$or:[{name:searchReg}, {info:searchReg}]})
      .limit(10)
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
    
router.get("/category/:catName",async(req,res) => {
    try{
      let catName = new RegExp(req.params.catName,"i")
      // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
      // i -> מבטל את כל מה שקשור ל CASE SENSITVE
      let data = await toyModel.find({category:catName})
      .limit(10)
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})

router.get("/prices",async(req,res) => {
    try{
      let min = Number(req.query.min);
      console.log(min)
      console.log(typeof min)
      let max = Number(req.query.max);
      // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
      // i -> מבטל את כל מה שקשור ל CASE SENSITVE
      let data = await toyModel.find({ price : { $gte : min , $lte : max }})
      .limit(10)
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})

router.get("/single/:id",async(req,res) => {
    try{
      let id = req.params.id;
      // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
      // i -> מבטל את כל מה שקשור ל CASE SENSITVE
      let data = await toyModel.find({_id:id})
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})

router.post("/", auth, async(req,res) => {
  let validateBody = validateToy(req.body);
  if(validateBody.error){
    return res.status(400).json(validateBody.error.details)
  }
  try{
    let toy = new toyModel(req.body);
    // הוספת מאפיין האיי די של המשתמש
    // בהמשך יעזור לנו לזהות שירצה למחוק או לערוך רשומה
  //  tokenData._id; -> מגיע מפונקציית האוט מהטוקן ומכיל את 
  // האיי די של המשתמש
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy)
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err de la",err})
  }
})

router.put("/:idEdit", auth, async(req,res) => {
  let validateBody = validateToy(req.body);
  if(validateBody.error){
    return res.status(400).json(validateBody.error.details)
  }
  try{
    let idEdit = req.params.idEdit
    let data = await toyModel.updateOne({_id:idEdit, user_id:req.tokenData._id},req.body)
    // modfiedCount:1 - אם יש הצלחה
    res.json(data);
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.delete("/:idDel",auth, async(req,res) => {
  try{
    let idDel = req.params.idDel
    // כדי שמשתמש יוכל למחוק רשומה הוא חייב 
    // שלרשומה יהיה את האיי די ביוזר איי די שלו
    let data = await toyModel.deleteOne({_id:idDel,user_id:req.tokenData._id})
    // "deletedCount": 1 -  אם יש הצלחה של מחיקה
    res.json(data);
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

module.exports = router;