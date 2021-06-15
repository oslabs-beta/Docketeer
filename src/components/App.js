import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HashRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import Login from './login/login';
import AdminView from './views/Admin';
import UserView from './views/User';

const App = (props) => {

  const role = useSelector((state) => state.session.role);
  if (role === 'admin') {
    return (
      <div>
        <AdminView />
      </div>
    );
  }

  else {
    return (
      <div>
        <UserView />
      </div>
    );
  }
};

export default App;