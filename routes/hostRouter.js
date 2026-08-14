const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");
const bookingController = require("../controllers/bookingController");

const multer = require("multer");
// 🚨 FIX 1: .v2 लगाना 100% ज़रूरी है, वरना 'uploader' एरर आएगा
const cloudinary = require("cloudinary").v2; 

// 🚨 FIX 2: यह कोड पुराने और नए दोनों वर्ज़न में चलेगा (बिना क्रैश हुए)
const multerCloudinary = require("multer-storage-cloudinary");
const CloudinaryStorage = multerCloudinary.CloudinaryStorage || multerCloudinary;

// 🚨 FIX 3: अगर Vercel से Keys नहीं आ रही हैं, तो यह लोडिंग अटकाने के बजाय एरर दिखा देगा
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.log("❌ ERROR: Cloudinary Keys Vercel से नहीं आ रही हैं!");
}

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "airbnb_homes",
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage: storage });

// 👇 इसके नीचे आपके सारे Routes बिल्कुल वैसे ही रहेंगे
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