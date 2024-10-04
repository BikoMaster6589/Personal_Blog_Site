import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";
import dotenv from "dotenv";
import multer from "multer";
import methodOverride from "method-override";
import Swal from "sweetalert2";
import connectPgSimple from "connect-pg-simple";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import db from "./db.js";

// Load environment variables
dotenv.config();

// Express setup
const app = express();
const port = process.env.PORT || 3000;

// Configure PG Session Store
const PgSession = connectPgSimple(session);

// Middleware setup
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');

// Session setup
app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const saltRounds = 10;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/images/uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Nodemailer setup for email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to determine if user is admin
const isAdmin = (req) => req.user?.username === "bishtbiko@gmail.com";

// Routes

// Signup page
app.get("/signup", (req, res) => {
  res.render("SigningUp", { message: null });
});

// Signin page with optional alert
app.get("/signin", (req, res) => {
  const { showAlert, message } = req.query;
  res.render("signing", { showAlert: showAlert === 'true', message: message || '' });
});

// Home route with authentication and admin check
app.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/signup");

    const posts = await db.query("SELECT * FROM posts");
    res.render("index.ejs", {
      values: posts.rows,
      user: req.user,
      adm: isAdmin(req),
    });
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("Server Error");
  }
});

// Route to display user posts
app.get("/userposts", async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/signup");

    const userId = req.user.id;
    const result = await db.query("SELECT * FROM posts WHERE userid = $1", [userId]);

    res.render("myposts.ejs", {
      values: result.rows || [],
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).send("Server Error");
  }
});

// Register user with OTP
app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    // Check if the user exists
    const userExists = await db.query("SELECT * FROM users WHERE username = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).render('SigningUp', {
        message: 'User already exists. Try Signing in',
        showAlert: true
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.tempUser = { fname, lname, email, password, otp };

    // Send OTP via email
    await transporter.sendMail({
      from: `"Blog Website" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP is: ${otp}`,
      html: `<b>Your OTP is <strong>${otp}</strong></b>`,
    });

    res.redirect("/verify-otp");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Server Error");
  }
});

// OTP Verification page
app.get("/verify-otp", (req, res) => {
  if (!req.session.tempUser) return res.redirect("/signup");
  res.render("verify-otp", { name: req.session.tempUser.email });
});

// Handle OTP Verification
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;
  const { tempUser } = req.session;

  if (!tempUser || otp !== tempUser.otp) {
    return res.status(400).send("Invalid OTP. Please try again.");
  }

  try {
    const hashedPass = await bcrypt.hash(tempUser.password, saltRounds);
    await db.query(
      "INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
      [tempUser.fname, tempUser.lname, tempUser.email, hashedPass]
    );
    delete req.session.tempUser;
    req.login(tempUser, (err) => {
      if (err) return res.status(500).send("Server Error");
      res.redirect("/");
    });
  } catch (error) {
    console.error("Error completing registration:", error);
    res.status(500).send("Server Error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
