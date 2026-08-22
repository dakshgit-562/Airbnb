const User = require('../models/user');

exports.getManageHosts = async (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.email !== 'dakshchaudhary10009@gmail.com') {
    return res.redirect('/');
  }

  try {
    //ADMIN KA DOT OFF KARO
    await User.findOneAndUpdate({ email: 'dakshchaudhary10009@gmail.com' }, { hasNewManageHost: false });
    if (res.locals.user) res.locals.user.hasNewManageHost =false;
    // FIX: $ne: true use kiya gaya hai taaki wo purane host accounts bhi pakde jayein jisme isVerified field tha hi nahi.
    // Aur daksh ka email minus kar diya taaki admin list me khud na dikhe.
    const pendingHosts = await User.find({ 
      userType: 'host', 
      isVerified: { $ne: true },
      email: { $ne: 'dakshchaudhary10009@gmail.com' }
    });
    
    res.render('admin/manage-hosts', {
      pageTitle: 'Manage Hosts',
      currentPage: 'manage-hosts',
      pendingHosts
    });
  } catch (err) {
    console.log("Error fetching pending hosts: ", err);
    res.redirect('/');
  }
};

exports.postApproveHost = async (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.email !== 'dakshchaudhary10009@gmail.com') {
    return res.redirect('/');
  }

  const hostId = req.body.hostId;
  try {
    await User.findByIdAndUpdate(hostId, { isVerified: true });
    console.log("Host approved successfully: ", hostId);
    res.redirect('/admin/manage-hosts');
  } catch (err) {
    console.log("Error approving host: ", err);
    res.redirect('/admin/manage-hosts');
  }
};
// सिंगल रिक्वेस्ट को कैंसिल करने के लिए (होस्ट को वापस गेस्ट बना देगा)
exports.postRejectHost = async (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.email !== 'dakshchaudhary10009@gmail.com') {
    return res.redirect('/');
  }

  try {
    const hostId = req.body.hostId;
    // पेंडिंग लिस्ट से हटाकर वापस गेस्ट बना दिया
    await User.findByIdAndUpdate(hostId, { userType: 'guest' }); 
    console.log("Host request cancelled and changed to guest: ", hostId);
    res.redirect('/admin/manage-hosts');
  } catch (err) {
    console.log("Error rejecting host: ", err);
    res.redirect('/admin/manage-hosts');
  }
};

// एक साथ सारी पेंडिंग रिक्वेस्ट को क्लियर करने के लिए
exports.postClearAllHosts = async (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.email !== 'dakshchaudhary10009@gmail.com') {
    return res.redirect('/');
  }

  try {
    // जितने भी अनवेरिफाइड होस्ट हैं, सबको एक साथ गेस्ट बना दो
    await User.updateMany({ userType: 'host', isVerified: false }, { userType: 'guest' });
    console.log("All pending host requests cleared!");
    res.redirect('/admin/manage-hosts');
  } catch (err) {
    console.log("Error clearing all hosts: ", err);
    res.redirect('/admin/manage-hosts');
  }
};