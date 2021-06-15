const express = require('express');
const userController = require('../controllers/userController');
const cookieController = require('../controllers/cookieController');

const router = express.Router();

router.post('/',
  userController.verifyUser,
  cookieController.setCookie,
  cookieController.setSSIDCookie,
  (req, res) => {
    console.log('made it back to login router');
    if (res.locals.error) return res.status(200).json(res.locals);
    return res.status(200).json(res.locals);
  }
);

// router.get('/', userController.getUsers, (req, res) => {
//   console.log('made it back to signup router');
//   return res.status(200).json(res.locals.users);
// });

// router.post('/', userController.newUser, (req, res) => {
//   console.log('made it back to signup router');
//   return res.status(200).json('user added');
// });


module.exports = router;