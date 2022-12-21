const jwt=require('jsonwebtoken');
const User=require('../models/User')
const authentication=(req, res, next)=>{
    try{
        const token=req.headers.authorization;
        const user=jwt.verify(token, 'secretToken')
        // console.log(user.userId)
        User.findByPk(user.userId)
        .then((user)=>{
            req.user=user;
            next();
        })
    }
    catch(err){
        console.log(err);
        return res.status(401).json({success: false});
    }
};

module.exports={
    authentication
}