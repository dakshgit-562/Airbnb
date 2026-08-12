const express = require("express");
const storeRouter = express.Router();
const storeController = require("../controllers/storeController");
const bookingController = require("../controllers/bookingController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", bookingController.getGuestBookings);
storeRouter.post("/bookings", bookingController.createBooking);
storeRouter.post("/bookings/cancel/:bookingId", bookingController.cancelGuestBooking);
storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.get("/favourite", (req, res, next) => res.redirect("/favourites"));
storeRouter.get("/booking", (req, res, next) => res.redirect("/bookings"));
storeRouter.get("/home-list", (req, res, next) => res.redirect("/homes"));
storeRouter.get("/home", (req, res, next) => res.redirect("/homes"));
storeRouter.get("/edithome/:homeId", (req, res, next) => res.redirect(`/host/edit-home/${req.params.homeId}?editing=true`));

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

module.exports = storeRouter;