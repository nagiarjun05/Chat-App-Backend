const express = require('express')
const cors= require('cors');
const app = express();

const dotenv=require('dotenv');
dotenv.config();

const bodyParser = require('body-parser');

const sequelize =require('./util/database')

const User=require('./models/User');
const Message = require('./models/message');
// const FilesDownloaded=require('./models/downloadedfiles');

app.use(cors());
// app.set('view engine', 'ejs');
// app.set('views', 'views');

const userRoutes=require('./routes/user');
// const forgetpasswordRoutes=require('./routes/forgetpassword');
// const path = require('path');

// To handle forms
// app.use(bodyParser.urlencoded({ extended: false })); 

// To handle json
app.use(bodyParser.json())


app.use('/users',userRoutes);
// app.use('/password',forgetpasswordRoutes);

// app.use(errorController.get404);


User.hasMany(Message);
Message.belongsTo(User);

sequelize
.sync()
// .sync({force: true})
.then(()=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err)
});