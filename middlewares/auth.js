const jwt = require("jsonwebtoken")

exports.auth = async(req, res, next) => {
    let token = req.header("x-api-key");

    if(!token){
        return res.status(401).json({msg: "you need to send token"});
    }

    try{
        let tokenData = jwt.verify(token, "black22secret")
        req.tokenData = tokenData;
        next();
    }
    catch(err){
        return res.status(401).json({msg: "token not valid or expired" });
    }
}