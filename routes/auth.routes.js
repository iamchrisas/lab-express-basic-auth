const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const saltRounds = 10;

const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/auth.middleware");

// Middleware to redirect logged-in users
const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) {
    return res.redirect('/');
  }
  next();
};

// GET /auth/signup
router.get("/signup", isLoggedOut, (req, res) => {
  res.render("signup");
});

// POST /auth/signup
router.post("/signup", isLoggedOut, async (req, res) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.status(400).render("signup", {
      errorMessage: "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).render("signup", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });
    return;
  }

  try {
    // Directly save the password without hashing (Not Recommended)
    await User.create({ username, password });
    res.redirect("login");
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render("signup", { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render("signup", {
        errorMessage: "Username needs to be unique. Provide a valid username.",
      });
    } else {
      res.status(500).send("Error creating the user");
    }
  }
});

// GET /auth/login
router.get("/login", isLoggedOut, (req, res) => {
  res.render("login");
});

// POST /auth/login
router.post("/login", isLoggedOut, async (req, res) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.status(400).render("login", {
      errorMessage: "Please provide both username and password.",
    });
    return;
  }

  try {
    const user = await User.findOne({ username });
    // Directly compare the password without hashing (Not Recommended)
    if (!user || password !== user.password) {
      res.status(400).render("login", { errorMessage: "Wrong credentials." });
      return;
    }

    req.session.currentUser = user;
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error logging in the user");
  }
});

// GET /auth/logout
router.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500).send("Error logging out");
      return;
    }
    res.redirect("/");
  });
});

router.post("/main", isAuthenticated, (req, res) =>
  res.render("main", { userInSession: req.session.currentUser })
);

router.post("/private", isAuthenticated, (req, res) =>
  res.render("private", { userInSession: req.session.currentUser })
);


module.exports = router;