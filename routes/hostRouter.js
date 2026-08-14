const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");
const bookingController = require("../controllers/bookingController");

const multer = require("multer");
const cloudinary = require("cloudinary").v2; 
const multerStorageCloudinary = require("multer-storage-cloudinary");

// 1. Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. 🚨 SMART STORAGE: यह Vercel के वर्ज़न को अपने आप हैंडल कर लेगा (कोई क्रैश नहीं होगा)
let storage;
if (multerStorageCloudinary.CloudinaryStorage) {
  // अगर नया वर्ज़न है, तो यह चलेगा
  storage = new multerStorageCloudinary.CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "airbnb_homes",
      allowedFormats: ["jpeg", "png", "jpg", "webp"]
    }
  });
} else {
  // अगर पुराना वर्ज़न है, तो बिना 'new' और बिना 'params' के यह चलेगा
  storage = multerStorageCloudinary({
    cloudinary: cloudinary,
    folder: "airbnb_homes",
    allowedFormats: ["jpeg", "png", "jpg", "webp"]
  });
}

const upload = multer({ storage: storage });

// 3. Routes (आपके पुराने राउट्स एकदम सेम रहेंगे)
hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home", upload.single("image"), hostController.postAddHome);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/bookings", bookingController.getHostBookings);
hostRouter.post("/bookings/cancel/:bookingId", bookingController.cancelHostBooking);
hostRouter.get("/home-list", (req, res, next) => res.redirect("/host/host-home-list"));
hostRouter.get("/edithome/:homeId", (req, res, next) => res.redirect(`/host/edit-home/${req.params.homeId}?editing=true`));
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", upload.single("image"), hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;