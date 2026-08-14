const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");
const bookingController = require("../controllers/bookingController");

const multer = require("multer");
// 🚨 FIX 1: cloudinary के बाद .v2 होना 100% ज़रूरी है
const cloudinary = require("cloudinary").v2; 
// 🚨 FIX 2: CloudinaryStorage के आस-पास { } ब्रैकेट्स होना ज़रूरी है
const { CloudinaryStorage } = require("multer-storage-cloudinary"); 

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // स्पेलिंग एकदम यही होनी चाहिए
  params: {
    folder: "airbnb_homes",
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage: storage });

// 👇 इसके नीचे आपके सारे Routes बिल्कुल वैसे ही रहेंगे
hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home", upload.single("image"), hostController.postAddHome);
// ... बाकि सब सेम रहेगा

hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/bookings", bookingController.getHostBookings);
hostRouter.post("/bookings/cancel/:bookingId", bookingController.cancelHostBooking);
hostRouter.get("/home-list", (req, res, next) => res.redirect("/host/host-home-list"));
hostRouter.get("/edithome/:homeId", (req, res, next) => res.redirect(`/host/edit-home/${req.params.homeId}?editing=true`));
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", upload.single("image"), hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;