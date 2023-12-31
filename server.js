const express = require("express");
const mongoose = require("mongoose");
const User = require("./modals/User.js");
const bycrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/AuthG18");

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  session({
    name : 'cookie',
    secret: "this is a secret",
    cookie: {
      maxAge: 1000 * 60 * 5, //5 minutes
    },
  })
);

//naveen -----> encrypt ----> shfowewineinfeoiewnfie

app.post("/register", async (req, res) => {
  const user = req.body;
  if (!user.password || !user.username) {
    res.send("Username and password are required");
    return;
  }

  if (user.password.length < 4) {
    res.send("Password length must be >= 4");
    return;
  }
  //   users.push(user);
  const newUser = new User(user);
  const saltRounds = 10;

  const hashedPwd = await bycrypt.hash(newUser.password, saltRounds);
  newUser.password = hashedPwd;

  try {
    await newUser.save();
    res.sendFile(__dirname + "/views/registerdone.html");
  } catch (err) {
    res.send("Couln't register account");
  }
});

//Cookies
app.get("/shop", (req, res) => {
  const visited = req.cookies.visited;

  if (visited) {
    res.sendFile(__dirname + "/views/price.html");
  } else {
    res.cookie("visited", true);
    res.sendFile(__dirname + "/views/discountPrice.html");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie('visited');
  req.session.loggedIn = false;
  res.sendFile(__dirname + "/views/logout.html");
});

app.get("/protected", (req, res) => {
  const loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.sendFile(__dirname + "/views/secret.html");
  } else {
    res.redirect("/login");
  }
});

app.post("/login", async (req, res) => {
  const loginData = req.body;
  const account = (
    await User.find().where("username").equals(loginData.username)
  )[0];
  if (!account) {
    res.send("No such account");
    return;
  }
  // Account found
  const match = await bycrypt.compare(loginData.password, account.password);
  if (!match) {
    res.sendFile(__dirname + "/views/incorrect.html");
    return;
  }

  req.session.user = account;
  req.session.loggedIn = true;
  // session id ----- cookie -----> user
  res.sendFile(__dirname + "/views/logindone.html");
});

app.get("/accounts", (req, res) => {
  // /accounts?n=10&sort=true
  const n = req.query.n;
  const sort = req.query.sort;
  let usernames = users.map((user) => user.username);
  if (n) {
    usernames = usernames.slice(0, n);
  }
  if (sort) {
    usernames.sort();
  }
  res.send(usernames);
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
