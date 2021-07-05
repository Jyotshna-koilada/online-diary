require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const getDate = require(__dirname + '/public/js/date.js');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');

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
  useFindAndModify: false,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personMemoriesSchema = new mongoose.Schema({
  date: String,
  words: String,
  description: String
});

const personSchema = new mongoose.Schema({
  personName: String,
  email: String,
  password: String,
  memories: [personMemoriesSchema]
});

personSchema.plugin(passportLocalMongoose);

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

let loggedInPerson = "", editMemoryId = "";

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/memories", (req, res) => {
  if (req.isAuthenticated()){
    Person.findById(loggedInPerson, (err, person) => {
      if(!err){
        res.render("memories", {memories: person.memories});
      }
    })
  }
  else
    res.redirect("/signin");
})

app.get("/new", (req, res) => {
  if(req.isAuthenticated())
    res.render("new", {date: getDate()});
  else
    res.redirect("/signin");
})
app.post("/new", (req, res) => {
  const newMemory = new PersonMemories({
    date: req.body.date,
    words: req.body.word,
    description: req.body.description
  })
  Person.findByIdAndUpdate(loggedInPerson, {$push: {memories: newMemory}}, (err, person) => {
    if(!err)
      res.redirect("/memories");
    else
      res.redirect("/new");
  })
});

app.post("/edit-this-memory", (req, res) => {
  editMemoryId = req.body.editMemoryId;
  res.redirect("edit");
})
app.get("/edit", (req, res) => {
  Person.findOne({_id: loggedInPerson, "memories._id": editMemoryId}, (err, person) => {
    if(!err){
      let index = -1;
      for(let i=0 ; i<person.memories.length ; i++){
        if(person.memories[i]._id == editMemoryId){
          index = i;
          break;
        }
      }
      res.render("edit", {memory: person.memories[index]});
    }
  })
})
app.post("/edit", (req, res) => {
  Person.findOneAndUpdate({_id: loggedInPerson, "memories._id": editMemoryId},
                          {$set: {"memories.$.date": req.body.date,
                                  "memories.$.words": req.body.words,
                                  "memories.$.description": req.body.description}},
                          (err, result) => {
                              res.redirect("/memories");
  });

})
app.post("/delete", (req, res) => {
  console.log(req.body[0]);

  Person.updateOne({_id: loggedInPerson}, {$pull: {memories: { _id: req.body.deleteMemoryId}}}, (err, result) => {
    if(!err){
      res.redirect("/memories");
    }
  })
})
app.get("/signin", (req, res) => {
  res.render("signin");
})
app.post("/signin", passport.authenticate('local', {failureRedirect: "/signup"}), (req, res) => {
  Person.findOne({username: req.body.username}, (err, person) => {
    loggedInPerson = person._id;
  })
  res.redirect("/memories");
});

app.route("/signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post((req, res) => {
    const newPerson = new Person({
      personName: req.body.fname+" "+req.body.lname,
      username: req.body.email
    });
    Person.register(newPerson, req.body.password, (err, user) => {
      if (err) {
        res.redirect("/signup");
      }
      else{
        res.redirect("/signin");
      }
    });
  })

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});
app.get("/contact", (req, res) => {
  if(req.isAuthenticated())
    res.render("contact",{navpage: "navbar"});
  else{
    res.render("contact",{navpage: "loggedout-navbar"});
  }
})
app.post("/contact", (req, res) => {
  let form = new multiparty.Form();
  let data = {};
  form.parse(req, function (err, fields) {
    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });

    const mail = {
      from: data.name,
      to: process.env.EMAIL,
      subject: `Regarding Mirror website: ${data.service}`,
      text: `Name: ${data.name} \nEmail: ${data.email} \nPhone Number: ${data.number} \nMessage regarding the service: ${data.message}`,
    };

    transporter.sendMail(mail, (err, data) => {
        if(!err)
            res.redirect("success");
        else
            res.redirect("failure");
    });
  });
})

app.get("/success", (req, res) => {
  if(req.isAuthenticated())
    res.render("success",{navpage: "navbar"});
  else{
    res.render("success",{navpage: "loggedout-navbar"});
  }
})
app.get("/failure", (req, res) => {
  if(req.isAuthenticated())
    res.render("failure",{navpage: "navbar"});
  else{
    res.render("failure",{navpage: "loggedout-navbar"});
  }
})

app.get("/signout", (req, res) => {
  req.logout();
  res.redirect("/");
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000");
})
