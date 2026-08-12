require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./config/passport');
const authRouter = require('./routes/authRouter');

const app = express();
app.use(passport.initialize());
app.use(authRouter);

const server = app.listen(5000, async () => {
  console.log('temp auth full started on 5000');
  try {
    const res = await fetch('http://localhost:5000/auth/google', { redirect: 'manual' });
    console.log('STATUS', res.status);
    console.log('LOCATION', res.headers.get('location'));
  } catch (err) {
    console.error('ERROR', err.message);
  } finally {
    server.close();
  }
});
