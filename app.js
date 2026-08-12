const path = require("path");
const dns = require("dns");
require('dotenv').config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const session = require("express-session");
const MongoStorePkg = require('connect-mongo');
const MongoStore = MongoStorePkg && MongoStorePkg.default ? MongoStorePkg.default : MongoStorePkg;
const mongoose = require("mongoose");

// 🔐 SECURITY FIX: Hardcoded password removed. Now it strictly uses .env
const DB_PATH = process.env.MONGODB_URI;

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const adminRouter = require('./routes/adminRouter');
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const store = MongoStore.create({
  mongoUrl: DB_PATH,
  collectionName: 'sessions'
});

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "KnowledgeGate AI with Complete Coding",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// Session Data available globally in EJS
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  console.log("SESSION ID:", req.sessionID);
  console.log("IS LOGGED IN:", req.session.isLoggedIn);

  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  // Make HOST_EMAIL available in EJS templates
  res.locals.HOST_EMAIL = process.env.HOST_EMAIL || '';

  next();
});

app.use(express.static(path.join(rootDir, "public")));

const passport = require('passport');
// Load passport strategy (configures GoogleStrategy)
require('./config/passport');

app.use(passport.initialize());

app.use(authRouter);
app.use(storeRouter);
app.use('/admin', adminRouter);

// Protect host routes with `isHost` middleware
const isHost = require('./middleware/isHost');
app.use('/host', isHost, hostRouter);

app.use(errorsController.pageNotFound);

const PORT = 3003;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to Mongo");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to Mongo: ", err);
  });