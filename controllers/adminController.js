const User = require('../models/user');

exports.getManageHosts = async (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.email !== 'dakshchaudhary10009@gmail.com') {
    return res.redirect('/');
  }

  try {
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