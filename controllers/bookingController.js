const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Home = require('../models/home');
const User = require('../models/user'); //User import karna zaruri hai

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateNightCount(checkIn, checkOut) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
}

async function hasDateConflict(homeId, checkIn, checkOut) {
  const conflict = await Booking.findOne({
    home: homeId,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
  return !!conflict;
}

exports.createBooking = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  if (req.session.user.userType !== 'guest') {
    return res.redirect('/');
  }

  const userId = req.session.user._id;
  const homeId = req.body.homeId;
  const rawCheckIn = req.body.checkIn;
  const rawCheckOut = req.body.checkOut;

  if (!homeId || !rawCheckIn || !rawCheckOut) {
    return res.redirect('/homes');
  }

  const home = await Home.findById(homeId);
  if (!home) {
    return res.redirect('/homes');
  }

  const checkIn = parseDate(rawCheckIn);
  const checkOut = parseDate(rawCheckOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!checkIn || !checkOut) {
    return res.redirect(`/homes/${homeId}?toast=invalidBooking`);
  }

  if (checkIn < today) {
    return res.redirect(`/homes/${homeId}?toast=checkinPast`);
  }

  if (checkOut <= checkIn) {
    return res.redirect(`/homes/${homeId}?toast=checkoutAfterCheckin`);
  }

  const numberOfNights = calculateNightCount(checkIn, checkOut);
  if (numberOfNights < 1) {
    return res.redirect(`/homes/${homeId}?toast=invalidBooking`);
  }

  const pricePerNight = home.price;
  const totalPrice = pricePerNight * numberOfNights;

  const hasConflict = await hasDateConflict(homeId, checkIn, checkOut);
  if (hasConflict) {
    return res.redirect(`/homes/${homeId}?toast=bookingConflict`);
  }

  const booking = new Booking({
    user: userId,
    home: homeId,
    checkIn,
    checkOut,
    pricePerNight,
    numberOfNights,
    totalPrice,
    status: 'confirmed',
  });

  await booking.save();

  //Guest ka dot ON karein
  await User.findByIdAndUpdate(userId, { hasNewBookings: true }).catch(err => console.log(err));

  //Host ka dot ON karein
  if (home.host) {
    await User.findByIdAndUpdate(home.host, { hasNewHostBookings: true }).catch(err => console.log(err));
  }

  //FIX: Redirect ko /homes kar diya taaki guest ko uski bookings ka DOT dikhe!
  return res.redirect('/homes?toast=bookingSuccess');
};

exports.getGuestBookings = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  const userId = req.session.user._id;

  // Database mein OFF karo
  await User.findByIdAndUpdate(userId, { hasNewBookings: false });

  // DIRECT NAVBAR KA DOT OFF KARO
  if (res.locals.user) {
      res.locals.user.hasNewBookings = false;
  }

  const bookings = await Booking.find({ user: userId })
    .populate('home')
    .sort({ checkIn: 1 });

  res.render('store/bookings', {
    pageTitle: 'My Bookings',
    currentPage: 'bookings',
    bookings,
  });
};
exports.getHostBookings = async (req, res, next) => {
  if (!req.session.isLoggedIn) return res.redirect('/login');
  if (req.session.user.userType !== 'host') return res.redirect('/');

  const hostId = req.session.user._id;

  // Database mein OFF karo
  await User.findByIdAndUpdate(hostId, { hasNewHostBookings: false });

  //  DIRECT NAVBAR KA DOT OFF KARO
  if (res.locals.user) {
      res.locals.user.hasNewHostBookings = false;
  }

  const hostHomes = await Home.find({ host: hostId }).select('_id');
  const homeIds = hostHomes.map((home) => home._id);

  const bookings = await Booking.find({ home: { $in: homeIds } })
    .populate('home')
    .populate('user')
    .sort({ checkIn: 1 });

  res.render('host/bookings', {
    pageTitle: 'Host Bookings',
    currentPage: 'host-bookings',
    bookings,
  });
};
exports.cancelGuestBooking = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  const bookingId = req.params.bookingId;
  if (!mongoose.isValidObjectId(bookingId)) {
    return res.redirect('/bookings');
  }

  const booking = await Booking.findById(bookingId).populate('home');
  if (!booking) {
    return res.redirect('/bookings');
  }

  const userId = req.session.user._id;
  if (booking.user.toString() !== userId.toString()) {
    return res.redirect('/bookings');
  }

  booking.status = 'cancelled';
  await booking.save();

  return res.redirect('/bookings?toast=bookingCancelled');
};

exports.cancelHostBooking = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  if (req.session.user.userType !== 'host') {
    return res.redirect('/');
  }

  const bookingId = req.params.bookingId;
  if (!mongoose.isValidObjectId(bookingId)) {
    return res.redirect('/host/bookings');
  }

  const booking = await Booking.findById(bookingId).populate('home');
  if (!booking) {
    return res.redirect('/host/bookings');
  }

  const hostId = req.session.user._id;
  if (!booking.home || booking.home.host.toString() !== hostId.toString()) {
    return res.redirect('/host/bookings');
  }

  booking.status = 'cancelled';
  await booking.save();

  return res.redirect('/host/bookings?toast=bookingCancelled');
};