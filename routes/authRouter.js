// routes/authRouter.js
const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");
const passport = require('passport');

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);

// Google OAuth routes

//Google par bhejne se pehle userType session me save karo
authRouter.get('/auth/google', (req, res, next) => {
  req.session.requestedRole = req.query.userType || 'guest';
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

authRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), authController.googleCallback);
// POST aur GET dono ke liye logout handle karo
authRouter.post("/logout", authController.postLogout);
authRouter.get("/logout", authController.postLogout); // Add this line!

authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);

module.exports = authRouter;