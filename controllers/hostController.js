const Home = require("../models/home");
const Booking = require("../models/booking");
const fs = require("fs");
const path = require("path");

// 🚨 नया: Cloudinary अब यहाँ काम करेगा
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

exports.getEditHome = (req, res, next) => {
  // ... (यह फंक्शन पहले जैसा ही रहेगा, इसे मत छेड़ना)
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) return res.redirect("/host/host-home-list");
    res.render("host/edit-home", {
      home: home, pageTitle: "Edit your Home", currentPage: "host-homes", editing: editing,
    });
  }).catch((err) => res.redirect("/host/host-home-list"));
};

exports.getHostHomes = (req, res, next) => {
  // ... (यह फंक्शन पहले जैसा ही रहेगा)
  Home.find().then((homes) => {
    res.render("host/host-home-list", { registeredHomes: homes, pageTitle: "Host Homes", currentPage: "host-homes" });
  }).catch((err) => res.redirect("/"));
};

// 👇 🚨 MAIN FIX: Add Home
exports.postAddHome = async (req, res, next) => {
  try {
    const { houseName, price, location, rating, description } = req.body;
    const image = req.file; 
    
    if (!image) return res.redirect("/host/add-home");

    // Vercel के /tmp/ फोल्डर से फोटो उठाकर Cloudinary पर डालेंगे
    const result = await cloudinary.uploader.upload(image.path, { folder: "airbnb_homes" });

    const home = new Home({
      houseName, price, location, rating, description,
      photoUrl: result.secure_url, // 👈 एकदम सही असली लिंक
      host: req.session.user ? req.session.user._id : undefined,
    });

    await home.save();
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.log("Add Home Error: ", err);
    res.redirect("/host/add-home");
  }
};

// 👇 🚨 MAIN FIX: Edit Home
exports.postEditHome = async (req, res, next) => {
  try {
    const { id, houseName, price, location, rating, description } = req.body;
    const image = req.file; 
    
    const home = await Home.findById(id);
    if (!home) return res.redirect("/host/host-home-list");
      
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
    console.log("Edit Home Error: ", err);
    res.redirect("/host/host-home-list");
  }
};

// deleteHome ... (पहले जैसा ही रहेगा)
exports.postDeleteHome = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    await Booking.deleteMany({ home: homeId });
    await Home.findByIdAndDelete(homeId);
    res.redirect("/host/host-home-list");
  } catch (error) {
    res.redirect("/host/host-home-list");
  }
};