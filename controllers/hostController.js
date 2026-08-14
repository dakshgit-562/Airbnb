const Home = require("../models/home");
const Booking = require("../models/booking");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
  });
};

// 1. Host List Page: Sirf logged-in host ke hi homes dikhenge
exports.getHostHomes = (req, res, next) => {
  const hostId = req.session.user ? req.session.user._id : null;

  // Filter: host field match honi chahiye
  Home.find({ host: hostId })
    .then((registeredHomes) => {
      res.render("host/host-home-list", {
        registeredHomes: registeredHomes,
        pageTitle: "Host Homes List",
        currentPage: "host-homes",
      });
    })
    .catch((err) => {
      console.log("Error fetching host homes: ", err);
      res.redirect("/");
    });
};

// 2. Get Edit Home: Check karega ki yeh home isi host ka hai ya nahi
exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  const hostId = req.session.user ? req.session.user._id : null;

  // findOne se dono match honge: _id AUR host
  Home.findOne({ _id: homeId, host: hostId })
    .then((home) => {
      if (!home) {
        console.log("Unauthorized edit attempt or Home not found.");
        return res.redirect("/host/host-home-list");
      }

      res.render("host/edit-home", {
        home: home,
        pageTitle: "Edit your Home",
        currentPage: "host-homes",
        editing: editing,
      });
    })
    .catch((err) => {
      console.log("Error fetching home for edit: ", err);
      res.redirect("/host/host-home-list");
    });
};

// 3. Post Add Home
exports.postAddHome = async (req, res, next) => {
  try {
    const { houseName, price, location, rating, description } = req.body;
    const image = req.file; 
    
    if (!image) return res.redirect("/host/add-home");

    const result = await cloudinary.uploader.upload(image.path, { folder: "airbnb_homes" });

    const home = new Home({
      houseName,
      price,
      location,
      rating,
      description,
      photoUrl: result.secure_url,
      host: req.session.user ? req.session.user._id : undefined,
    });

    await home.save();
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Add Home Error: ", err);
    res.redirect("/host/add-home");
  }
};

// 4. Post Edit Home: Security Check ke saath
exports.postEditHome = async (req, res, next) => {
  try {
    const { id, houseName, price, location, rating, description } = req.body;
    const image = req.file; 
    const hostId = req.session.user ? req.session.user._id : null;

    // Check karo ki home exist karta hai aur isi host ka hai
    const home = await Home.findOne({ _id: id, host: hostId });
    if (!home) {
      console.log("Unauthorized edit attempt!");
      return res.redirect("/host/host-home-list");
    }
      
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, { folder: "airbnb_homes" });
      home.photoUrl = result.secure_url; 
    }
      
    await home.save(); 
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Error while updating home: ", err);
    res.redirect("/host/host-home-list");
  }
};

// 5. Post Delete Home: Sirf apna home delete kar paayega
exports.postDeleteHome = async (req, res, next) => {
  const homeId = req.params.homeId;
  const hostId = req.session.user ? req.session.user._id : null;
  
  try {
    // Pehle verify karo ki kisi aur ka home toh delete nahi kar raha
    const home = await Home.findOne({ _id: homeId, host: hostId });
    
    if (!home) {
      console.log("Unauthorized delete attempt!");
      return res.redirect("/host/host-home-list");
    }

    // 1. Related Bookings delete karo
    await Booking.deleteMany({ home: homeId });

    // 2. Home delete karo
    await Home.deleteOne({ _id: homeId, host: hostId });
    
    res.redirect("/host/host-home-list");
  } catch (error) {
    console.log("Error while deleting: ", error);
    res.redirect("/host/host-home-list");
  }
};