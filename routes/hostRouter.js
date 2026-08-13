const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");
const bookingController = require("../controllers/bookingController");

// Cloudinary aur Multer ke naye packages
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Setup (Asli keys .env aur Vercel se aayengi)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "airbnb_homes", // Cloudinary mein is folder ke andar photo save hongi
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage: storage });

// Routes (Yahan koi syntax change nahi kiya gaya hai)
hostRouter.get("/add-home", hostController.getAddHome);

// FIX: Yahan multer form aur controller ke beech mein data parse karega
hostRouter.post("/add-home", upload.single("image"), hostController.postAddHome);

hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/bookings", bookingController.getHostBookings);
hostRouter.post("/bookings/cancel/:bookingId", bookingController.cancelHostBooking);
hostRouter.get("/home-list", (req, res, next) => res.redirect("/host/host-home-list"));
hostRouter.get("/edithome/:homeId", (req, res, next) => res.redirect(`/host/edit-home/${req.params.homeId}?editing=true`));
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);

// FIX: Edit wale route par bhi multer add karna zaroori hai
hostRouter.post("/edit-home", upload.single("image"), hostController.postEditHome);

hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;7