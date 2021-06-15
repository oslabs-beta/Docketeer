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

// NPM Module Imports
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, BrowserHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'react-modal';

// Redux Imports (actions)
import * as actions from '../../actions/actions';

// React Component Imports
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

// var provider = new firebase.auth.GoogleAuthProvider();


function onSignIn(googleUser) {
  console.log('Google Auth Response', googleUser);
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
    if (!isUserEqual(googleUser, firebaseUser)) {
      // Build Firebase credential with the Google ID token.
      // console.log('this gosh dawg turkey doag', firebase.auth.GoogleAuthProvider.PROVIDER_ID)
      // console.log('this gosh dawg turkey bun', firebase.auth.GoogleAuthProvider.credential)
      var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.getAuthResponse().id_token);

      // Sign in with credential from the Google user.
      firebase.auth().signInWithCredential(credential).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    } else {
      console.log('User already signed-in Firebase.');
    }
  });
}

// Helper Functions Import
// import { handleLogin, authenticateUser } from '../helper/loginHelper';


function isUserEqual(googleUser, firebaseUser) {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}

// function authHandler() {
//   firebase.auth()
//     .signInWithPopup(provider)
//     .then((result) => {
//       /** @type {firebase.auth.OAuthCredential} */
//       var credential = result.credential;

//       // This gives you a Google Access Token. You can use it to access the Google API.
//       var token = credential.accessToken;
//       // The signed-in user info.
//       var user = result.user;
//       // ...
//     }).catch((error) => {
//       // Handle Errors here.
//       var errorCode = error.code;
//       var errorMessage = error.message;
//       // The email of the user's account used.
//       var email = error.email;
//       // The firebase.auth.AuthCredential type that was used.
//       var credential = error.credential;
//       console.log(error);
//       // ...
//     });
//   }

const Login = () => {
  
  // React-Redux: Map dispatch to props
  const dispatch = useDispatch();
  const updateSession = () => dispatch(actions.updateSession());
  const updateUser = (userInfo) => dispatch(actions.updateUser(userInfo));

  // React-Redux: Map state to props
  const session = useSelector((state) => state.session.isLoggedIn);

  // React Hooks: Local state variables 
  const [ modalIsOpen, setIsOpen ] = useState(false);

  // Modal functions
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  // Need to set the app element to body for screen-readers (disability), otherwise modal will throw an error
  useEffect(() => {
    Modal.setAppElement('body');
  }, []);
  
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
  };
  
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
        console.log(response);
        return response.json();
      })
      .then((data) => {
        if (Object.prototype.hasOwnProperty.call(data, 'error')) {
          window.alert(data.error);
        }
        else {
          console.log(data);
          updateSession(); // loggedIn = true 
          updateUser(data); // update user info in sessions reducer
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Upon successful login, redirect to /app location and render the App component

  // Note: this could be re-worked, just thinking about it this looks like poor security design since loggedIn is a local state variable on client end which can be hardcoded to true. Rather, the server should verify credentials and then send client either SSID to access next endpoint or another means.
  if (session){
    console.log('LOGGED IN');
    return (
      <Router
        history={BrowserHistory}
      >
        <Redirect to="/app"/>
        <Switch>
          {/* <Route component={App} exact path="/app" /> */}
          <Route path="/app">
            <App />
          </Route>
        </Switch> 
      </Router>
    );
  }
  
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
          {/* <button id="signinwithgoogle" onClick={authHandler}>Sign in with Google</button> */}
          {/* <button className="g-signin2" onClick={onSignIn} data-theme="dark">Booty</button> */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel='Modal to make user account'
          >
            <SignupModal closeModal={closeModal}/>
          </Modal>
        </div>
      </Route>
    </Router>
  );
};

export default Login;
