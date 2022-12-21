const express = require('express');

const router = express.Router();

const userController=require('../controllers/user');
const userAuthentication=require('../middleware/auth')

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.post('/msg', userAuthentication.authentication ,userController.addMsg);

// router.get('/download', userAuthentication.authentication , userController.download);

module.exports=router;