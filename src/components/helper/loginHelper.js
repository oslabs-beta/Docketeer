// callback function invoked when 'login' button is clicked
export const handleLogin = (e) => {
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

export const authenticateUser = (username, password) => {

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
        // updateSession();
        console.log('LOGGED IN');
      }
    })
    .catch((err) => {
      console.log(err);
      return (err);
    });
};