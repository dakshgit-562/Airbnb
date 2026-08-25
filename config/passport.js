const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3003/auth/google/callback";
const HOST_EMAIL = process.env.HOST_EMAIL;

const googleConfigured = !!(CLIENT_ID && CLIENT_SECRET && CALLBACK_URL);

if (!googleConfigured) {
  console.warn('Google OAuth environment variables not fully configured. Google routes will be unavailable until configured.');
}

if (googleConfigured) {
  passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    proxy: true,
    passReqToCallback: true // 🚨 1. YE ADD KARO (Taki req access ho sake)
  }, async (req, accessToken, refreshToken, profile, done) => { // 🚨 2. YAHAN 'req' ADD KARO
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error('No email found in Google profile'));

      let user = await User.findOne({ email });
      
      // 🚨 3. Bahaar se aaya hua role check karo
      const role = (req.session && req.session.requestedRole) ? req.session.requestedRole : 'guest';

      if (!user) {
        user = new User({
          firstName: (profile.name && profile.name.givenName) || email.split('@')[0],
          lastName: (profile.name && profile.name.familyName) || '',
          email,
          password: undefined,
          userType: role, //Ab default 'guest' nahi, user ki choice aayegi
          // isVerified: role === 'host' ? false : true, // Agar host ko approval chahiye, to ye line uncomment kar lena aapke schema ke hisaab se
          googleId: profile.id
        });
        await user.save();
      
  
  // passport.use(new GoogleStrategy({
  //   clientID: CLIENT_ID,
  //   clientSecret: CLIENT_SECRET,
  //   callbackURL: CALLBACK_URL,
  //   proxy: true
  // }, async (accessToken, refreshToken, profile, done) => {
  //   try {
  //     const email = profile.emails && profile.emails[0] && profile.emails[0].value;
  //     if (!email) return done(new Error('No email found in Google profile'));

  //     let user = await User.findOne({ email });

  //     if (!user) {
  //       user = new User({
  //         firstName: (profile.name && profile.name.givenName) || email.split('@')[0],
  //         lastName: (profile.name && profile.name.familyName) || '',
  //         email,
  //         password: undefined,
  //         userType: email === HOST_EMAIL ? 'host' : 'guest',
  //         googleId: profile.id
  //       });
  //       await user.save();
      } else {
        // Ensure googleId and host role are updated if necessary
        let needsSave = false;
        if (!user.googleId) {
          user.googleId = profile.id;
          needsSave = true;
        }
        if (email === HOST_EMAIL && user.userType !== 'host') {
          user.userType = 'host';
          needsSave = true;
        }
        if (needsSave) await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

module.exports = passport;
