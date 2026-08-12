const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    errors: [],
    oldInput: { email: "" }
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "", userType: "" }
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain at least one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain at least one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions")
    .custom((value) => {
      if (value !== "on") {
        throw new Error("Please accept the terms and conditions");
      }
      return true;
    }),

  async (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, userType }
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType
      });
      await user.save();
      res.redirect("/login");
    } catch (err) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        errors: [err.message],
        oldInput: { firstName, lastName, email, userType }
      });
    }
  }
];

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["User does not exist"],
        oldInput: { email }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["Invalid Password"],
        oldInput: { email }
      });
    }

    // FIX: Yahan login hone se pehle check kiya gaya hai ki agar wo host hai aur verified nahi hai
    if (user.userType === 'host' && user.email !== 'dakshchaudhary10009@gmail.com' && !user.isVerified) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["Your host account is pending admin approval. Please wait for verification."],
        oldInput: { email }
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified || false, 
      favourites: (user.favourites || []).map((fav) => fav.toString())
    };

    req.session.save((err) => {
      if (err) {
        console.log("❌ SESSION SAVE ERROR:", err);
        return res.redirect("/login");
      }

      console.log("✅ LOGIN SUCCESS");
      res.redirect("/homes");
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.redirect("/login");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.googleCallback = (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.redirect('/login');
    }

    // FIX: Google login ke liye bhi same verification check
    if (user.userType === 'host' && user.email !== 'dakshchaudhary10009@gmail.com' && !user.isVerified) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["Your host account is pending admin approval."],
        oldInput: { email: user.email }
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified || false,
      favourites: (user.favourites || []).map((fav) => fav.toString())
    };

    req.session.save((err) => {
      if (err) {
        console.log('❌ SESSION SAVE ERROR (Google OAuth):', err);
        return res.redirect('/login');
      }
      return res.redirect('/homes');
    });
  } catch (err) {
    console.log('Google callback error:', err);
    return res.redirect('/login');
  }
};