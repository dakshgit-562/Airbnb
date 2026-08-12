const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index"
    });
  });
};

exports.getHomes = (req, res, next) => {
  const searchDestination = req.query.destination;
  let filter = {};
  
  if (searchDestination) {
    filter.location = { $regex: searchDestination, $options: "i" };
  }
  
  Home.find(filter)
    .then((registeredHomes) => {
      res.render("store/home-list", {
        registeredHomes: registeredHomes,
        pageTitle: "Homes List",
        currentPage: "Home"
      });
    })
    .catch((err) => {
      console.log("Error finding homes: ", err);
      res.redirect("/");
    });
};

exports.getBookings = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  const userId = req.session.user._id;
  const bookings = await Booking.find({ user: userId }).populate('home').sort({ checkIn: 1 });

  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    bookings,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  console.log("FAV SESSION:", req.session);
  console.log("FAV SESSION ID:", req.sessionID);

  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favourites");
    res.render("store/favourite-list", {
      favouriteHomes: user.favourites || [],
      pageTitle: "My Favourites",
      currentPage: "favourites"
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

exports.postAddToFavourite = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  user.favourites = user.favourites.filter((fav) => fav.toString() !== homeId);
  await user.save();
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/homes");
    }
    res.render("store/home-detail", {
      home: home,
      pageTitle: "Home Detail",
      currentPage: "Home"
    });
  });
};