/**
 * ************************************
 *
 * @module Login Router
 * @author Catherine Larcheveque, Lorenzo Guevara, Charles Ryu, Griffin Silver, Alex Smith
 * @date 6/23/2021
 * @description Routes all endpoints for initializing the database for new users
 *
 * ************************************
 */

const express = require('express');
const signupController = require('../controllers/signupController');
const userController = require('../controllers/userController');
const bcryptController = require('../controllers/bcryptController');
const cookieController = require('../controllers/cookieController');
const changeController = require('../controllers/changeController');
const dbController = require('../controllers/dbController');
  
const router = express.Router();
 
router.use('/',
  dbController.createTable,
  dbController.createRoles,
  (req, res) => {
 
    if (res.locals.error) return res.status(200).json(res.locals);
    return res.status(200).json('Database initialized successfully');
  }
);

module.exports = router;