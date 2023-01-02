const User=require('../models/user');
const Message=require('../models/message')


const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Group = require('../models/group');
const UserGroup=require('../models/usergroup')

function stringValidator(string){
    if(string===undefined||string.length===0){
        return true
    }else{
        return false
    }
}

function generateTokken(id,name,ispremiumuser){
    return jwt.sign({userId: id, name: name, ispremiumuser}, 'secretToken')
}

const signup= async (req, res)=>{
    try{
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;

        if (stringValidator(name)||stringValidator(email)||stringValidator(password)){
            return res.status(400).json({err: "Bad Parameters . Something is missing"})
        }
        const user= await User.findOne({where: {email}})

        if (user){
            console.log('User Already Exist')
            return res.status(402).json({success: false, message:"User already Exist"})
        }else{
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async(err, hash)=>{
                await User.create({
                    name: name,
                    email: email,
                    password: hash
                });
                await res.status(201).json({success: true, message: "Succesfully create new User"});
            })
        } 
    } catch(err){
        console.log(err)
        res.status(500).json(err);
    }
};

const login=async (req, res)=>{
    try{
        const {email, password}=req.body;

        const users= await User.findAll({ where : { email }})
                
        if (users.length>0){
            bcrypt.compare(password, users[0].dataValues.password, (err, result)=>{
                if(err){
                    throw new Error('Something went wrong')
                }
                else if(result){
                    return res.status(200).json({success: true, message: 'User Loged in Succesfully!', token:(generateTokken(users[0].dataValues.id,users[0].dataValues.name,users[0].dataValues.ispremiumuser))})
                }
                else{
                    return res.status(401).json({success: false, message: 'Password is Inconrrect!'})
                }
            })
        }else{
            return res.status(404).json({success: false, message: 'User Doesnt Exist!'})
        }
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
};

const addMsg = async (req, res) =>{
    try{
        const message=req.body.msg
        await Message.create({
            message: message,
            userId: req.user.id
        });
        await res.status(201).json({success: true, message: "Succesfully Message Sent"});
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
}

const getMsgs= async (req, res) =>{
    try{
        const Messages=await Message.findAll();
        const Users=await User.findAll();

        res.status(201).json({success: true, Messages: Messages, Users: Users});
    }
    catch(err){
        res.status(500).json({
            message: err
        })
    }
}

const getGroups=async(req, res)=>{
    try{
        const user=req.user;

        const groups=await user.getGroups()

        if(groups.length>0){
            res.status(200).json({success:true, groups: groups})
        }else{
            res.status(201).json({success:true, message:"User doesnt belongs to any group"})
        }
    }
    catch(err){
        res.status(500).json(err);
    }
};


const createGroup=async(req, res)=>{
    try{
        const user=req.user;

        const group=await Group.create({
            name: req.body.name
        });

        await UserGroup.create({
            userId: user.id,
            groupId: group.id
        })
        res.status(201).json({success: true, message: "Succesfully Message Sent", group:group});
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
}

module.exports={
    signup,
    login,
    addMsg,
    getMsgs,
    getGroups,
    createGroup
};