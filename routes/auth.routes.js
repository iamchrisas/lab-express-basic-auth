const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/auth.middleware");

router.get("/main", isAuthenticated, (req, res) => {
  res.render("main");
});

router.get("/private", isAuthenticated, (req, res) => {
  res.render("private");
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.redirect("/login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
