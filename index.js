import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";
import env from "dotenv";
import multer from "multer";
import methodOverride from "method-override";
import Swal from "sweetalert2";
import connectPgSimple from "connect-pg-simple";
import nodemailer from "nodemailer";


// For hashing passwords
import bcrypt from "bcrypt";
// For sessions
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; // Renamed import for clarity
// For Google OAuth
import GoogleStrategy from "passport-google-oauth2"; // Renamed import for clarity

const port = 3000;
const app = express();
const PgSession = connectPgSimple(session); 
env.config();

// Middleware

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');

app.use(
  session({
    store: new PgSession({
      pool: db, // Connection pool
      tableName: 'sessions', // Table name to store session data
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const saltRound = 10;

import db from "./db.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "bishtbiko@gmail.com",
    pass: "aips gyqe rpgu uydv",
  },
});

// Routes
app.get("/signin", (req, res) => {
  const { showAlert, message } = req.query;
  res.render('signing', {
    showAlert: showAlert === 'true',
    message: message || ''
  });

});

app.get("/signup", (req, res) => {
  res.render('SigningUp', { message: null });
});

app.get("/fp", (req, res) => {
  res.render("forgot_password.ejs");
});

app.get("/add", (req, res) => {
  res.render("add.ejs", {
    fs: req.user.first_name,
    ln: req.user.last_name,
  });
});

app.get("/contacts", (req, res) => {
  res.render("construction.ejs");
});

app.get("/edit", (req, res) => {
  res.render("edit.ejs");
});

function admin(req, res) {
  let admin = 0;
  if (!req.isAuthenticated()) {
    console.log("User not authenticated");
    return res.redirect("/signup");
  }

  if (req.user && req.user.username === "bishtbiko@gmail.com") {
    admin = 1;
  }
  return admin; // Return the admin status
}

app.get("/userposts", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/signup"); // Redirect to signup if not authenticated
  }

  const userId = req.user.id;

  db.query("SELECT * FROM posts WHERE userid = $1", [userId], (err, result) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).send("Server Error"); // Handle server errors
    }

    if (result.rows.length > 0) {
      // Render the 'myposts.ejs' template with fetched posts
      res.render("myposts.ejs", {
        values: result.rows, // Posts data
        user: req.user,      // User data
      });
    } else {
      res.render("myposts.ejs", {
        values: [],          // If no posts, send an empty array
        user: req.user,      // User data
      });
    }
  });
});


// app.get("/posts", (req, res) => {
//     res.render("allPosts.ejs");
// });

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/edit/:id", async (req, res) => {
  const postId = req.params.id; // Extract Post ID from URL

  try {
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]); // Fetch post data from DB

    if (result.rows.length > 0) {
      const post = result.rows[0]; // Get post data
      console.log(post);
      res.render("edit", { post, Postid: postId });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Handle editing post with PATCH request
app.post("/edit/:id", upload.single("image"), async (req, res) => {
  const postId = req.params.id;
  const heading = req.body.heading;
  const content = req.body.content;
  const filePath = req.file ? req.file.filename : null; // Check if image is uploaded

  let query = "UPDATE posts SET heading = $1, content = $2";
  const params = [heading, content];

  // Check if an image file was uploaded
  if (filePath) {
    query += ", image = $3"; // Add image update if it exists
    params.push(filePath);
  }

  query += " WHERE id = $" + (params.length + 1); // Use the correct index for the postId
  params.push(postId); // Add postId as the last parameter

  try {
    const result = await db.query(query, params);
    if (result.rowCount > 0) {
      res.redirect("/posts"); // Redirect to the user posts page
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.error("Error updating post:", err); // Log the error
    res.status(500).send("Server Error");
  }
});

// Home route with authentication check
app.get("/", async (req, res) => {

  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/signup");
    }

    const isAdmin = admin(req, res); // Make sure `admin()` works synchronously

    // Fetch posts from the database
    db.query("SELECT * FROM posts", (err, aka) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).send("Server error");
      }

      // Render the index page with posts and user information
      res.render("index.ejs", {
        values: aka.rows,
        user: req.user,
        adm: isAdmin,
      });
    });
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/posts", async (req, res) => {
  const isAdmin = admin(req, res);
  console.log("Admin status:", admin);
  db.query("SELECT * FROM posts", (err, aka) => {
    if (err) {
      res.send(err);
    } else {
      if (req.isAuthenticated()) {
        res.render("allPosts.ejs", {
          values: aka.rows,
          user: req.user,
          adm: isAdmin,
        });
      } else {
        res.redirect("/signup");
      }
    }
  });
});

// Google OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/signup",
  })
);

// Callback route with HTTP
app.get("/secrets", (req, res) => {
  res.send("hello");
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err); // Make sure 'next' is passed and used here
    }
    res.redirect("/"); // Redirect to home after successful logout
  });
});

app.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: `/signin?showAlert=false&message=${encodeURIComponent("Wrong Password Sir")})`
  })
);



app.post("/forgot", async (req, res) => {
  const email = req.body.gmail;
  console.log(email);
  const result = await db.query("SELECT hashed_password FROM users WHERE username = $1", [email]);
  
  if (result.rows.length === 0) {
    return res.status(400).render('forgot_password', { 
      message: 'User does not exist. Try signing up', 
      showAlert: true 
    });
  }
  const ak = result.rows[0].hashed_password;
  if (ak === null) {
  return res.status(400).render('forgot_password', { 
    message: 'This Gmail account is logged in with Google. Please use Google sign-in.', 
    showAlert: true 
  });

} 
      
      const password = result.rows[0].hashed_password;
      const info = await transporter.sendMail({
          from: `"Blog Website" <${process.env.EMAIL_USER}>`, // sender address
          to: email, // list of receivers
          subject: "Your password:", // Subject line
          text: `Your Password is: ${password}`, // plain text body
          html: `<b>Your password is <strong>${password}</strong></b>`, // html body
      });
      
      // Redirect after sending the email
     res.redirect(`/signin?showAlert=true&message=${encodeURIComponent("Your password has been sent to your email.")}`);
  }
);

app.get("/delete/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    await db.query("DELETE FROM posts WHERE id = $1", [postId]); // Execute the delete query
    if(admin){
      res.redirect("/posts");
    }
    else{
    res.redirect("/userposts"); // Redirect to the user's posts page
  }
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Server Error");
  }
});

// Render OTP Verification Page
app.get("/verify-otp", (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect("/signup");
  }
  res.render("verify-otp.ejs",{
    name : req.session.tempUser.username
  }); // Create this EJS view
});




// Handle OTP Verification
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  // Check if tempUser exists in session
  if (!req.session.tempUser) {
    return res.redirect("/signup");
  }

  const tempUser = req.session.tempUser;

  // Verify OTP
  if (otp === tempUser.otp) {
    try {
      // Hash the password
      const hashedPass = await bcrypt.hash(tempUser.password, saltRound);

      // Insert the user into the database
await db.query(
  "INSERT INTO users(first_name, last_name, username, password,hashed_password) VALUES ($1, $2, $3, $4, $5)",
  [tempUser.first_name, tempUser.last_name, tempUser.username, hashedPass, tempUser.password]
);


      // Clear tempUser from session
      delete req.session.tempUser;

      // Optionally, auto-login the user
      const user = {
        first_name: tempUser.first_name,
        last_name: tempUser.last_name,
        username: tempUser.username,
        // Add other user properties as needed
      };
      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in user after registration:", err);
          return res.status(500).send("Server Error");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Error completing registration:", error);
      res.status(500).send("Server Error");
    }
  } else {
    res.status(400).send("Invalid OTP. Please try again.");
  }
});


// Register new user
// Register new user
app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    // Check if the email is already registered
    const checkEmail = await db.query("SELECT * FROM users WHERE username = $1", [email]);
    if (checkEmail.rows.length > 0) {
        // Render the SigningUp page with a flag
        return res.status(400).render('SigningUp', { 
            message: 'User already exists. Try Signing in', 
            showAlert: true // Add this flag
        });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store user data and OTP in session
    req.session.tempUser = {
      first_name: fname,
      last_name: lname,
      username: email,
      password: password, // Store plain password temporarily; hash after OTP verification
      otp: otp,
    };

    // Send OTP via email
    const info = await transporter.sendMail({
      from: `"Blog Website" <${process.env.EMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: "Your OTP Code", // Subject line
      text: `Your OTP code is ${otp}`, // plain text body
      html: `<b>Your OTP code is <strong>${otp}</strong></b>`, // html body
    });

    console.log("OTP sent: ", info.messageId);

    // Redirect to OTP verification page
    res.redirect("/verify-otp");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Server Error");
  }
});


// Register new post
app.post("/adding", upload.single("image"), async (req, res) => {
  const heading = req.body.head;
  const content = req.body.feed;
  const name = req.user.first_name + " " + req.user.last_name;
  const idd = req.user.id;
  const filePath = req.file.filename; // Ensure this points to the correct file path

  try {
      await db.query(
          "INSERT INTO posts(userid, heading, content, userName, image) VALUES ($1, $2, $3, $4, $5)",
          [idd, heading, content, name, filePath]
      );

      // Redirect to the home page with a success indicator
      res.redirect("/?postAdded=true");
  } catch (error) {
      console.error(error);
      // Redirect back with an error message if needed
      res.redirect("/?postAdded=false");
  }
});


// Register post for user
app.post("/feedback", async (req, res) => {
  const post = req.body.feed;
  const userName = req.user.username;

  try {
    await db.query("UPDATE users SET feedback = $1 WHERE username = $2", [
      post,
      userName,
    ]);
    // Redirect to the feedback page with a success flag
    res.redirect("/?feedbackSubmitted=true"); // Adjust URL as necessary
  } catch (error) {
    console.error(error);
    res.redirect("/?feedbackSubmitted=false"); // Handle errors if necessary
  }
});

// Local strategy for Passport
passport.use(
  "local",
  new LocalStrategy(async function verify(username, password, cb) {
    const checkEmail = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (checkEmail.rows.length > 0) {
      const user = checkEmail.rows[0];
      const StoredHashedPassword = user.password;
      bcrypt.compare(password, StoredHashedPassword, (err, valid) => {
        if (err) return cb(err); // Fixed error handling here
        else {
          if (valid) {
            return cb(null, user);
          } else {
            return cb(null, false); // Sweet Alert
          }
        }
      });
    } else {
      cb("No user found"); // Sweet Alert
    }
  })
);

// Google OAuth strategy with HTTP callback URL
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://personal-blog-site-13z.onrender.com/auth/google/callback/auth/google/secrets", // Use HTTP for local development
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // console.log(profile);
        const fn = profile.name.givenName;
        const ln = profile.name.familyName;
        const email = profile.emails[0].value; // Ensure correct extraction of email
        const result = await db.query(
          "SELECT * FROM users WHERE username = $1",
          [email]
        );

        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (first_name,last_name,username, password) VALUES ($1, $2, $3 ,$4) RETURNING *",
            [fn, ln, email, "google"]
          );
          return cb(null, newUser.rows[0]); // Correctly return the newly created user
        } else {
          return cb(null, result.rows[0]); // Correctly return the existing user
        }
      } catch (error) {
        console.error("Error during Google authentication:", error); // Added error logging
        return cb(error, null);
      }
    }
  )
);

// Passport session management
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Server listening
app.listen(port, () => {
  console.log(`Your server is live at http://localhost:${port}`);
});
