const mongoose = require("mongoose");
const Joi = require("joi");

const cakeSchema = new mongoose.Schema({
  name:String,
  cal:Number,
  price:Number,
  date:{
    type:Date, default:Date.now()
  },
  user_id:String
})

exports.cakeModel = mongoose.model("cakes",cakeSchema);

exports.validateCake = (_reqBody) => {
  let schemaJoi = Joi.object({
    name:Joi.string().min(2).max(99).required(),
    cal:Joi.number().min(0).max(3000).required(),
    price:Joi.number().min(1).max(300).required(),
  })
  return schemaJoi.validate(_reqBody)
}
