/**
 * ************************************
 *
 * @module Signup Modal
 * @author Alex Smith, Catherine Larcheveque, Charles Ryu, Griffin Silver, Lorenzo Guevara
 * @date 6/10/2021
 * @description Signup modal that will be displayed when a user clicks the sign-up button on the login page
 *
 * ************************************
 */

// Npm Module Imports
import React from 'react';
import { useDispatch } from 'react-redux';
import{ useState } from 'react';
// Redux Imports (actions)
import * as actions from '../../actions/actions';

// Material UI Imports
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

const SignupModal = (props) => {

  // Map dispatch to props, particularly the reducer method updateSession to update state.session.isLoggedIn
  const dispatch = useDispatch();
  const updateSession = () => dispatch(actions.updateSession());
  const updateUserList = () => dispatch(actions.updateUserList());
  // Material UI
  const classes = useStyles();

  // onClick callback method
  const handleClick = (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmationPassword = document.getElementById('signupPasswordConfirmation').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    
    if(!confirmPassword(password, confirmationPassword)) {
      document.getElementById('password-alert').innerHTML = 'Warning: Passwords do not match';
      return;
    }

    if(!checkPassword(password)) {
      document.getElementById('password-alert').innerHTML = 'Warning: Password must be 6 characters or greater';
      return;
    }
    // if(!checkEmail(email)) {
    //   document.getElementById('email-alert').innerHTML = 'Warning: Email is invalid'
    // }
    console.log('password: ', confirmPassword(password, confirmationPassword));
    console.log(username, password, confirmationPassword, email, phone);

    signupUser(email, username, password, phone);
  };

  // verify that password and confirmation password match
  const confirmPassword = (password, confirmation) => {
    return password === confirmation;
  };

  // verify that password input is 6 characters or greater, can add additional checks such as at least one uppercase, lowercase, number, symbol, etc.
  const checkPassword = (password) => {
    return password.length >= 6;
  };
  const checkEmail = (email) => {
    // const address = new MailAddress(email);
    // return address.Address === email;
  };

  const checkNumber = (phone) => {

  };

  const signupUser = (email, username, password, phone) => {
    console.log('SIGN UP USER');
    fetch('http://localhost:3000/signup', 
      { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          phone: phone
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (Object.prototype.hasOwnProperty.call(data, 'error')) {
          window.alert(data.error);
        }
        else {
          // updateSession();
          console.log('USER DATA: ', data);
          // eslint-disable-next-line react/prop-types
          props.closeModal();
          getUsers();
          setUserList(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function getUsers() {
    fetch('http://localhost:3000/signup')
      .then(response => response.json())
      .then(response => console.log(response, 'response'))
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleClick} className={classes.root} >
        {/* <input id="signupEmail" type="text" placeholder="email"></input><br></br> */}
        <TextField id="signupEmail" label="Email" variant="outlined" /><br></br>
        <TextField id="signupUsername" label="Username" variant="outlined" /><br></br>
        <TextField id="signupPassword" label="Password" variant="outlined" type="password" /><br></br>
        <TextField id="signupPasswordConfirmation" label="Password" variant="outlined" type="password" /><br></br>
        <TextField id="signupPhone" label="Phone" variant="outlined" /><br></br>
        {/* <input id="signupUsername" type="text" placeholder="username"></input><br></br>
        <input id="signupPassword" type="password" placeholder="password"></input><br></br>
        <input id="signupPasswordConfirmation" type="password" placeholder="confirm"></input>
        <span id="password-alert"></span> 
        <br></br>
        <input id="signupPhone" type="text" placeholder="phone number"></input><br></br> */}
        <Button variant="contained" size="medium" className={classes.button} type="submit" onClick={() => updateUserList}>
          Submit
        </Button>
        {/* <input type="submit"></input> */}
      </form>
    </div>
  );
};

export default SignupModal;