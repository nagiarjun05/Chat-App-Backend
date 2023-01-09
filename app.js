const express = require('express')
const cors= require('cors');
const app = express();
const path = require('path');

const dotenv=require('dotenv');
dotenv.config();

const bodyParser = require('body-parser');

const sequelize =require('./util/database')

const User=require('./models/user');
const Message = require('./models/message');
const Group=require('./models/group');
const UserGroup=require('./models/usergroup');
const uploadData = require("./models/uploaddata");

app.use(cors());

const userRoutes=require('./routes/user');
// const forgetpasswordRoutes=require('./routes/forgetpassword');

// To handle forms
// app.use(bodyParser.urlencoded({ extended: false })); 

// To handle json
app.use(bodyParser.json())

app.use('/users',userRoutes);
app.use((req, res)=>{
    console.log('urlll', req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`))
});
// app.use('/password',forgetpasswordRoutes);

// app.use(errorController.get404);

User.hasMany(Message);
Message.belongsTo(User,{ constraints: true, onDelete:"CASCADE"});

User.belongsToMany(Group,{through: UserGroup});
Group.belongsToMany(User,{through: UserGroup});

Group.hasMany(Message);
Message.belongsTo(Group,{ constraints: false, onDelete:"CASCADE"});

User.hasMany(uploadData);
uploadData.belongsTo(User);

sequelize
.sync()
// .sync({force: true})
.then(()=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err)
});