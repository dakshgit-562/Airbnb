const express = require("express");
const hostRouter = express.Router();
const hostController = require("../controllers/hostController");
const bookingController = require("../controllers/bookingController");
const multer = require("multer");

// 🚨 SMART FIX: सीधा Vercel के /tmp/ फोल्डर में फाइल सेव करेंगे (कोई क्रैश नहीं)
const upload = multer({ dest: "/tmp/" });

// Routes
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