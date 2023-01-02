const express = require('express');

const router = express.Router();

const userController=require('../controllers/user');
const userAuthentication=require('../middleware/auth')

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.post('/msg', userAuthentication.authentication ,userController.addMsg);

router.get('/getmsgs', userAuthentication.authentication ,userController.getMsgs);

router.get('/groups', userAuthentication.authentication , userController.getGroups);

router.post('/creategroup', userAuthentication.authentication , userController.createGroup)

module.exports=router;