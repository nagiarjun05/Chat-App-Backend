const express = require('express');

const router = express.Router();

const userController=require('../controllers/user');
const userAuthentication=require('../middleware/auth')

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.post('/msg', userAuthentication.authentication ,userController.addMsg);

router.get('/getmsgs', userAuthentication.authentication ,userController.getMsgs);

router.get("/getusers", userAuthentication.authentication, userController.getUsers);

router.post('/adduser', userAuthentication.authentication, userController.addUser);

router.get('/isAdmin', userAuthentication.authentication, userController.isAdmin);

router.post('/remove-user', userAuthentication.authentication, userController.removeUser);

router.post('/makeAdmin', userAuthentication.authentication, userController.makeAdmin);

router.post('/removeAdmin', userAuthentication.authentication, userController.removeAdmin);

router.get('/groups', userAuthentication.authentication , userController.getGroups);

router.post('/creategroup', userAuthentication.authentication , userController.createGroup)

router.post(
    "/postfile",
    [userAuthentication.authentication, upload.single('inputFile')],
    userController.postFile
);

router.get(
    "/getfile",
    userAuthentication.authentication,
    userController.getAllFiles
);
  
module.exports=router;