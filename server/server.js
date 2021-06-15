const express = require('express');
const path = require('path');
const cors = require('cors');

// Import Routers
const signupRouter = require('./routes/signupRouter');
const loginRouter = require('./routes/loginRouter');

const app = express();
const PORT = 3000;

app.use(express.json()); // parses the request body
app.use(express.urlencoded({ extended: true })); // parses urlencoded payloads
app.use(cors()); // enables ALL cors requests

// Route all requests to signup through signupRouter
app.use('/signup', signupRouter);
app.use('/login', loginRouter);

// Unknown Endpoint Error Handler
app.use('/', (req, res) => {
  return res.status(404).json('404 Not Found');
});

// Global Error Handler
app.get('/', (req, res, next, err)=> {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occured' },
  };
  const errorObj = Object.assign(defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

// Open up server on PORT
app.listen(PORT, ()=> {
  console.log(`server is listening on port ${PORT}`);
});

module.exports = app;