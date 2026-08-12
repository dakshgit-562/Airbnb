const User = require('../models/user');

module.exports = async (req, res, next) => {
  if (!req.session.isLoggedIn || !req.session.user) {
    return res.redirect('/login');
  }

  // Agar aap khud hain (Admin), toh hamesha allow karo
  if (req.session.user.email === 'dakshchaudhary10009@gmail.com') {
    return next();
  }

  // Normal host ke liye: check karo ki userType 'host' hai AUR 'isVerified' true hai
  if (req.session.user.userType === 'host') {
    const user = await User.findById(req.session.user._id);
    if (user && user.isVerified) {
      return next();
    }
  }

  // Agar verified nahi hai, toh home page par bhej do
  return res.redirect('/');
};