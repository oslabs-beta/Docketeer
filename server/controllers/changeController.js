/**
 * ************************************
 *
 * @module Database Controller
 * @author Catherine Larcheveque, Lorenzo Guevara, Charles Ryu, Griffin Silver, Alex Smith
 * @date 6/20/2021
 * @description Contains middleware that allows for a user to change their password.
 *
 * ************************************
 */

const db = require('../models/cloudModel');

 
const changeController = {};

changeController.changePassword = (req, res, next) => {
  const { newPass } = req.body;
  const { hash } = res.locals;
  const query = 'UPDATE users SET password = $1 WHERE username = $2';
  const params = [newPass, hash];
  db.query(query, params);
  next();
}

module.exports = changeController;