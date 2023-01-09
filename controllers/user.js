const User=require('../models/user');
const Message=require('../models/message')

const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Group = require('../models/group');
const UserGroup=require('../models/usergroup')
const s3 = require("../services/S3services");
const uploadData = require('../models/uploaddata');

let ITEM_PER_PAGE=5;


function stringValidator(string){
    if(string===undefined||string.length===0){
        return true
    }else{
        return false
    }
}

function generateTokken(id,name){
    return jwt.sign({userId: id, name: name}, 'secretToken')
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

        const user= await User.findOne({ where : { email }})
        // console.log(user)
        if (user){
            bcrypt.compare(password, user.dataValues.password, (err, result)=>{
                if(err){
                    throw new Error('Something went wrong')
                }
                else if(result){
                    return res.status(200).json({success: true, message: 'User Loged in Succesfully!', user, token:(generateTokken(user.dataValues.id,user.dataValues.name))})
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
    const message=req.body.msg
    const groupId=parseInt(req.body.groupId)
    try{
        if (!message || !groupId) {
            return res.status(400).json({
              message: "nothing entered!",
            });
          }
        await Message.create({
            message: message,
            userId: req.user.id,
            groupId: groupId
        });
        await res.status(201).json({success: true, message: "Succesfully Message Sent"});
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            message: err
        })
    }
}

const getMsgs= async (req, res) =>{
    try{
        const page= +req.query.page || 1;
        const totalCount = await Message.count({
            include: User,
        });
        const messageUser=await Message.findAll({
            where:{
                groupId:req.query.groupId
            },
            order:[['id','DESC']],  
            include: User,
            offset: (page-1)*ITEM_PER_PAGE,
            limit:ITEM_PER_PAGE,
        });
        
        const Users=await User.findAll();
        
        res.status(201).json({
            success: true, 
            messageUser: messageUser, 
            Users: Users, 
            currentPage:page,
            hasNextPage:ITEM_PER_PAGE*page<totalCount,
            nextPage:page+1,
            hasPreviousPage:page>1,
            previousPage:page-1,
            lastPage:Math.ceil(totalCount/ITEM_PER_PAGE)
        });
    }
    catch(err){
        res.status(500).json({
            message: "Unable to retrieve chats!"
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

const postFile =async(req, res)=>{
    try {
        if (req.file != undefined) {
          let type = (req.file.mimetype.split('/'))[1];
          console.log('type', type)
          let file = req.file.buffer
          const filename = `GroupChat/${new Date()}.${type}`;
          const fileUrl = await s3.uploadtoS3(file, filename);
          let msg = fileUrl
        //   console.log(req.query.groupId)
          await uploadData.create({
            name: req.user.name,
            fileName: filename,
            fileUrl: fileUrl,
            userId: req.user.id,
            groupId: req.query.groupId
          });
    
          res.status(201).json({
            name: req.user.name,
            success: true,
            message: msg,
            fileName: filename,
            userId: req.user.id,
            groupId: req.query.groupId
          })
        };
    
      } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error });
      }
};  

const getAllFiles=async(req, res)=>{
    try {
        // console.log('gid', req.query.groupId)
        let urls = await uploadData.findAll({ where: { groupId: req.query.groupId } })
        // console.log('data', urls)
        if (!urls) {
          res.status(404).json({ message: 'No URLs found!', success: false });
        }
        res.status(200).json({ urls, success: true });
      } catch (error) {
        res.status(500).json({ error });
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
            groupId: group.id,
            isAdmin: true
        })
        res.status(201).json({success: true, message: "Succesfully Message Sent", group:group});
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
}

const getUsers=async(req, res)=>{
    try{
        let groupId = req.query.groupId;
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Cannot find group!' });
        };
        let users = await group.getUsers();
        let data = users.filter(user => user.id != req.user.id);
        return res.status(200).json(data);
    }
    catch(err){
        res.status(500).json({err, message: "Some error occured!" });
    }
};

const addUser=async(req, res)=>{
    const { email, groupId } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        let group = await Group.findByPk(groupId);
        if (!user || !group) {
            return res.status(404).json({ message: "User not found!" });
        }
        const check = await group.hasUser(user);
        if (check) {
            return res.status(401).json({ message: "User already in group" })
        }
        const data = await group.addUser(user, { through: { isAdmin: false } });
        return res.status(200).json({ user, message: "Added user to group!" });
    } catch (error) {
        res.status(500).json({ error, message: "Some error occured!" });
    };
};

const isAdmin=async(req, res)=>{
    try{
        let groupId = req.query.groupId;
        if (!groupId) {
            return res.status(400).json({ message: 'No group id found!' });
        };
        let group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "no group found!" });
        }
        let row = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        return res.status(200).json(isAdmin);
    }
    catch(err){
        res.status(500).json({err, message: "Some error occured!" });
    }
};

const removeUser=async(req, res)=>{
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found' });
        }
        let row = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        if (!isAdmin) {
            return res.status(402).json({ message: 'not Admin!' });
        };
        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);
        if (!user || !group) {
            return res.status(404).json({ message: 'no group or user found' });
        }
        let result = await group.removeUser(user);
        if (!result) {
            return res.status(401).json({ message: 'unable to remove user' });
        }
        return res.status(200).json({ user, message: "user removed" });

    } catch (error) {
        res.status(500).json({ message: "some error occured", error });
    };
};

const makeAdmin=async(req, res)=>{
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found!' });
        };
        let row = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        console.log('isAdmin', isAdmin)
        if (!isAdmin) {
            console.log('Be a admin first')
            return res.status(402).json({ message: 'Not Admin/Authorized to make changes!' });
        };
        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);

        if (!user || !group) {
            return res.status(404).json({ message: "no group or user found!" });
        };
        let result = await group.addUser(user, { through: { isAdmin: true } });
        if (!result) {
            return res.status(401).json({ user, message: "Unable to make Admin" });
        }
        return res.status(200).json({ user, message: "User is Admin now!" });
    } catch (error) {
        res.status(500).json({ error, message: "some error occured" });
    };
};

const removeAdmin=async(req, res)=>{
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found!' });
        };
        let row = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        console.log('isAdmin', isAdmin)
        if (!isAdmin) {
            console.log('Be a admin first')
            return res.status(402).json({ message: 'Not Admin/Authorized to make changes!' });
        };
        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);

        if (!user || !group) {
            return res.status(404).json({ message: "no group or user found!" });
        };
        let result = await group.addUser(user, { through: { isAdmin: true } });
        if (!result) {
            return res.status(401).json({ user, message: "Unable to make Admin" });
        }
        return res.status(200).json({ user, message: "User is Admin now!" });
    } catch (error) {
        res.status(500).json({ error, message: "some error occured" });
    };
};

module.exports={
    signup,
    login,
    addMsg,
    getMsgs,
    getGroups,
    createGroup,
    addUser,
    getUsers,
    isAdmin,
    removeUser,
    makeAdmin,
    removeAdmin,
    postFile,
    getAllFiles
};