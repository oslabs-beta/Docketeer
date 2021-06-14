/**
 * ************************************
 *
 * @module Login
 * @author Alex Smith, Catherine Larcheveque, Charles Ryu, Griffin Silver, Lorenzo Guevara
 * @date 6/10/2021
 * @description Login component which renders a login page, and sign-up modal. This is the first component that is appended to the dist/.renderer-index-template.html via renderer/index.js
 *
 * ************************************
 */
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { BrowserRouter as Router, Switch, Route, Redirect, BrowserHistory } from 'react-router-dom';
import App from '../App';
import SignupModal from './signupModal';
import DebugRouter from '../debug/debugRouter';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAC8yoPq0llly4nbI-JOcYTglUhr2XhBkk",
    authDomain: "docketeer3-ef822.firebaseapp.com",
    projectId: "docketeer3-ef822",
    storageBucket: "docketeer3-ef822.appspot.com",
    messagingSenderId: "517219389795",
    appId: "1:517219389795:web:9a8dbd2232d94984dd4356",
    measurementId: "G-6MYEZ6RL7V"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the Auth service for the default app
var defaultAuth = firebase.auth();

const Login = () => {
  
  // Need to set the app element to body for screen-readers (disability), otherwise modal will throw an error
  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  // Local state variables 
  const [ loggedIn, setLoggedIn ] = useState(false);
  const [ modalIsOpen, setIsOpen ] = useState(false);

  // Modal functions
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  // callback function invoked when 'login' button is clicked
  const handleLogin = (e) => {
    e.preventDefault(); // prevents form submit from reloading page
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;

    // clears input fields after login
    usernameInput.value = '';
    passwordInput.value = '';

    console.log('clicked');
    authenticateUser(username, password);
  }
  
  // callback function which will send request to endpoint http://localhost:3000/login and expect either SSID in cookie.
  const authenticateUser = (username, password) => {

    fetch('http://localhost:3000/login', 
    { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (typeof data === 'object') {
        window.alert(data.error);
      }
      else {
        setLoggedIn(true);
      }
    })
    .catch((err) => {
      console.log(err);
    })
  }

  // Upon successful login, redirect to /app location and render the App component

  // Note: this could be re-worked, just thinking about it this looks like poor security design since loggedIn is a local state variable on client end which can be hardcoded to true. Rather, the server should verify credentials and then send client either SSID to access next endpoint or another means.
  if (loggedIn){
    return (
      <Router
        history={BrowserHistory}
      >
        <Redirect to="/app"/>
        <Switch>
          <Route component={App} exact path="/app" />
        </Switch>
      </Router>
    )
  };
  
  // Else render the login page
  return (
    <Router 
      history={BrowserHistory}
    >
      <Route id="route" path="/"> 
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input id="username" type="text" placeholder="username"></input>
            <br></br>
            <input id="password" type="password" placeholder="password"></input>
            <br></br>
            <input type="submit"></input>
          </form>
          <button id="signup" onClick={openModal}>Sign Up</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel='Modal to make user account'
          >
            <SignupModal />
          </Modal>
        </div>
      </Route>
    </Router>
  );
};

export default Login;
