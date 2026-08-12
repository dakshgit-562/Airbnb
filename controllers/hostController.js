const Home = require("../models/home");
const Booking = require("../models/booking");
const fs = require("fs");
const path = require("path");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("Home not found for editing.");
        return res.redirect("/host/host-home-list");
      }

      console.log(homeId, editing, home);
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

exports.getHostHomes = (req, res, next) => {
  Home.find()
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

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  const image = req.file; // Multer se photo yahan aayegi
  
  if (!image) {
    console.log("Error: Image upload is required!");
    return res.redirect("/host/add-home");
  }

  // Ab koi OIP4 nahi, seedha original photo ka path
  const photoUrl = "/images/" + image.filename;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photoUrl: photoUrl,
    description,
    host: req.session.user ? req.session.user._id : undefined,
  });

  home.save()
    .then(() => {
      console.log("Home Saved successfully");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error saving home: ", err);
      res.redirect("/host/add-home");
    });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  const image = req.file; 
  
  Home.findById(id)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/host-home-list");
      }
      
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      // Agar user ne nayi photo upload ki hai tabhi URL update hoga
      // Agar nahi ki, toh purani photo waisi ki waisi hi safe rahegi
      if (image) {
        home.photoUrl = "/images/" + image.filename;
      }
      
      return home.save(); 
    })
    .then((result) => {
      console.log("Home updated ", result);
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error while finding or updating home ", err);
      res.redirect("/host/host-home-list");
    });
};

// FIX: Delete functionality updated to clear orphaned images and bookings
exports.postDeleteHome = async (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Came to delete ", homeId);
  
  try {
    const home = await Home.findById(homeId);
    
    if (!home) {
      return res.redirect("/host/host-home-list");
    }

    // 1. Delete image file if it exists
    if (home.photoUrl) {
      const imagePath = path.join(__dirname, '..', 'public', home.photoUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.log("Failed to delete home image file: ", err);
      });
    }

    // 2. Delete all related bookings
    await Booking.deleteMany({ home: homeId });

    // 3. Delete the home itself
    await Home.findByIdAndDelete(homeId);
    
    res.redirect("/host/host-home-list");
  } catch (error) {
    console.log("Error while deleting ", error);
    res.redirect("/host/host-home-list");
  }
};