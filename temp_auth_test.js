const express = require('express');
const passport = require('passport');
require('dotenv').config();
const authRouter = require('./routes/authRouter');
const app = express();
app.use(passport.initialize());
app.use(authRouter);
app.listen(4000, () => console.log('temp auth test on 4000'));
