const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = async (req, res, next) => {
  //SAFE LOGIC: Home page khulte hi 'New Home' ka dot OFF karein
  if (req.session.isLoggedIn && req.session.user) {
    await User.findByIdAndUpdate(req.session.user._id, { hasNewHome: false }).catch(err => console.log(err));
  }
  
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index"
    });
  });
};

exports.getHomes = async (req, res, next) => {
  //SAFE LOGIC -Home list khulte hi 'New Home' ka dot OFF karein
  if (req.session.isLoggedIn && req.session.user) {
    await User.findByIdAndUpdate(req.session.user._id, { hasNewHome: false }).catch(err => console.log(err));
  }
  
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
  
  // 🚨 SAFE LOGIC: Dot OFF karein
  await User.findByIdAndUpdate(userId, { hasNewBookings: false }).catch(err => console.log(err));

  const bookings = await Booking.find({ user: userId }).populate('home').sort({ checkIn: 1 });

  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    bookings,
  });
};
exports.getFavouriteList = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  try {
    const userId = req.session.user._id;

    //Database mein OFF karo
    await User.findByIdAndUpdate(userId, { hasNewFavourites: false });

    // DIRECT NAVBAR (EJS) KA DOT OFF KARO (Sabse simple logic)
    if (res.locals.user) {
        res.locals.user.hasNewFavourites = false;
    }

    const user = await User.findById(userId).populate("favourites");

    res.render("store/favourite-list", {
      favouriteHomes: user.favourites || [],
      pageTitle: "My Favourites",
      currentPage: "favourites"
      // Yahan se 'user' hata diya taaki koi purana bug na aaye
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

  //redirect ko /homes kar diya taaki aap RED DOT dekh sakein!
  exports.postAddToFavourite = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    user.hasNewFavourites = true; // DOT ON
    await user.save();
  }
  const backURL = req.header('Referer') || '/homes';
  const redirectUrl = backURL.includes('?') 
    ? `${backURL}&toast=favAdded` 
    : `${backURL}?toast=favAdded`;

  res.redirect(redirectUrl);
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

  res.redirect("/favourites?toast=favRemoved");
};

exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);
    
    if (!home) {
      return res.redirect("/homes");
    }

    const existingBookings = await Booking.find({
      home: homeId,
      status: 'confirmed',
      checkOut: { $gte: new Date() }
    }).select('checkIn checkOut -_id');

    res.render("store/home-detail", {
      home: home,
      pageTitle: "Home Detail",
      currentPage: "Home",
      bookings: existingBookings
    });
  } catch (err) {
    console.log(err);
    res.redirect("/homes");
  }
};