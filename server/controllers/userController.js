const db = require('../models/cloudModel');
const bcrypt = require('bcryptjs');

const userController = {};

// create new user
userController.createUser = (req, res, next) => {
  if (res.locals.error) return next();

  const { username, email, password, phone } = req.body;
  // let hashPassword;

  // bcrypt.hash(password, 10)
  //   .then((hash) => {
  //     console.log('hash: ', hash);
  //     hashPassword = `'${hash}'`;
  //     console.log(hashPassword);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     return next({
  //       log: `Error in userController newUser: ${err}`,
  //       message: { err: 'An error occured creating hash with bcrypt. See userController.newUser.' },
  //     });
  //   });
  
  const createUser = 'INSERT INTO users (username, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING _id;';
  const userDetails = [username, email, password, phone];

  if (username && password) {
    db.query(createUser, userDetails)
      .then((data) => {
        res.locals.id = data.rows[0]._id;
        console.log('user added');
        return next();
      })
      .catch((err) => {
        return next({
          log: `Error in userController newUser: ${err}`,
          message: { err: 'An error occured creating new user in database. See userController.newUser.' },
        });
      });
  }
};

// get all users (system admin)
userController.getAllUsers = (req, res, next) => {
  console.log('made it to userController.getUsers');
  const allUsers = 'SELECT * FROM users;';

  db.query(allUsers)
    .then((response) => {
      res.locals.users = response.rows;
      console.log('retrieved all users from database');
      return next();
    })
    .catch((err) => {
      return next({
        log: `Error in userController getUsers: ${err}`,
        message: { err: 'An error occured retrieving all users from database. See userController.getUsers.' },
      });
    });
};

// verify user
userController.verifyUser = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.locals.error = 'Missing username or password.';
    return next();
  }

  const checkUser = `SELECT * FROM users WHERE username='${username}';`;

  db.query(checkUser)
    .then((data) => {
      // console.log(data);
      console.log('password: ', data.rows[0].password);
      if (data.rows[0].password === password) {
        res.locals.user = data.rows[0];
        return next();
      } else {
        console.log('ERROR');
        res.locals.error = 'Incorrect username or password.';
        return next();
      }
    })
    .catch((err) => {
      res.locals.error = err;
      console.log('LAST ERROR');
      return next({
        log: `Error in userController verifyUser: ${err}`,
        message: { err: 'An error occured verifying user. See userController.verifyUser.' },
      });
    });
};

// update user

// get one user



module.exports = userController;