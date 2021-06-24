/**
 * ************************************
 *
 * @module Change Router
 * @author Catherine Larcheveque, Lorenzo Guevara, Charles Ryu, Griffin Silver, Alex Smith
 * @date 6/23/21
 * @description Routes all requests to change endpoint
 *
 * ************************************
 */

const express = require('express');
const signupController = require('../controllers/signupController');
const userController = require('../controllers/userController');
const bcryptController = require('../controllers/bcryptController');
const cookieController = require('../controllers/cookieController');
const changeController = require('../controllers/changeController');
 
const router = express.Router();

router.post('/password',
  userController.verifyUser,
  bcryptController.comparePassword,
  changeController.changePassword,
  (req, res) => {

    if (res.locals.error) return res.status(200).json(res.locals);
    return res.status(200).json(res.locals.user);
  }
);

module.exports = router;