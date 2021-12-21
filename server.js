const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
//--------------------------------------------------------------------------------
// connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.on("open", () => {
  console.log("MongoDB connection established successfully");
});

// create schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  exercises: [{ description: String, duration: Number, date: Date }],
});

// create user model
const userName = mongoose.model("userName", userSchema);

// create endpoint
app.post("/api/users", (req, res) => {
  const newUser = new userName({ username: req.body.username });
  newUser.save((err, data) => {
    if (err) {
      res.json("Username already taken");
    } else {
      res.json({ username: newUser.username, _id: newUser._id });
    }
  });
});

app.get("/api/users", (req, res) => {
  userName.find({}, (err, users) => {
    if (!err) {
      const allUsers = users.map((user) => {
        return { _id: user._id, username: user.username };
      });
      res.json(allUsers);
    } else {
      return;
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const date = req.body.date ? new Date(req.body.date) : new Date();

  userName.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Unknown userId" });
    } else {
      data.exercises.push({
        date: date.toDateString(),
        duration: +req.body.duration,
        description: req.body.description,
      });
      data.save(data.exercises);
      res.json({
        _id: id,
        username: data.username,
        date: date.toDateString(),
        duration: +req.body.duration,
        description: req.body.description,
      });
    }
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;

  userName.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Unknown userId" });
    } else {
      res.json({
        _id: data._id,
        username: data.username,
        count: data.exercises.length,
        log: data.exercises,
      });
    }
  });
});

//--------------------------------------------------------------------------------

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
