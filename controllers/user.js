const User=require('../models/user');
// const FileDownloaded=require('../models/downloadedfiles')


const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');


// const AWS=require('aws-sdk');
// const { param } = require('../routes/user');

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
                    return res.status(400).json({success: false, message: 'Password is Inconrrect!'})
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

// function uploadToS3(data, filename){
//     let s3bucket=new AWS.S3({
//         accessKeyId:process.env.IAM_USER_KEY,
//         secretAccessKey:process.env.IAM_USER_SECRET
//     })

//     var params={
//         Bucket:process.env.BUCKET_NAME,
//         Key:filename,
//         Body:data,
//         ACL:'public-read'
//     }
    
//     return new Promise((resolve, reject)=>{
//         s3bucket.upload(params, (err, s3response)=>{
//             if(err){
//                 console.log(err)
//                 reject(err)
//             }else{
//                 resolve(s3response.Location)
//             }
//         })
//     })
    
// }

// const download=async (req, res)=>{
//     try{
//         const expenses= await req.user.getExpenses();
//         const stringifiedExpenses=JSON.stringify(expenses);

//         const filename=`Expense${req.user.id}/${new Date()}.txt`;
//         const fileURL= await uploadToS3(stringifiedExpenses, filename);
//         console.log(fileURL)
//         await FileDownloaded.create({
//             url: fileURL
//         });

//         res.status(201).json({fileURL, success: true})
//     }
//     catch{
//         res.status(500).json({fileURL:'', success: false, err:err})
//     }  
// }

module.exports={
    signup,
    login,
    // download
};