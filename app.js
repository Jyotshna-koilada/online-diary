require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const getDate = require(__dirname + '/public/js/date.js');
const bcrpyt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret: process.env.MY_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/memoriesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personMemoriesSchema = new mongoose.Schema({
  date: String,
  words: String,
  description: String
});

const personSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, default: ''},
  password: {type: String, required: true},
  memories: {type: personMemoriesSchema, default: {}}
});

personMemoriesSchema.plugin(passportLocalMongoose);
personMemoriesSchema.plugin(findOrCreate);

personSchema.plugin(passportLocalMongoose);
personSchema.plugin(findOrCreate);

const Person = mongoose.model("Person", personSchema);
const PersonMemories = mongoose.model("PersonMemories", personMemoriesSchema);

passport.use(Person.createStrategy());
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  Person.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/index", (req, res) => {
  res.render("index");
})
app.get("/", (req, res) => {
  res.render("home");
})
app.get("/new", (req, res) => {
  res.render("new", {date: getDate()});
})

app.route("/signin")
  .get((req, res) => {
    res.render("signin");
  })
  .post((req, res) => {
    const person = new Person({
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      password: req.body.password
    });

    req.login(person, (err) => {
      if (!err){
        passport.authenticate("local")(req, res, () => {
          if (!err) {
            res.redirect("/");
          }
        });
      }
    });
  })

  app.route("/signup")
    .get((req, res) => {
      res.render("signup");
    })
    .post((req, res) => {
      let userPassword = req.body.password;
      bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
        // Store hash in your password DB.
      });
      Person.register({firstname: req.body.firstname}, req.body.password, (err, user) => {
        if (err) {
          res.redirect("/signup");
        }
        else{
          User.authenticate(req.body.username, req.body.password, (err, result) => {
            if (!err) {
              res.redirect("/");
            }
          });
        }
      });
    })

app.get("/contact", (req, res) => {
  res.render("contact",{navpage: "navbar"});
})
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/index");
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
})
