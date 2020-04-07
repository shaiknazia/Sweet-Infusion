// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || "development";
const express = require("express");
const bodyParser = require("body-parser");
const sass = require("node-sass-middleware");
const app = express();
const morgan = require("morgan");
// const cookieSession = require("cookie-session");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load SMS API - Twilio
const MessagingResponse = require("twilio").twiml.MessagingResponse;



// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/styles",
  sass({
    src: __dirname + "/styles",
    dest: __dirname + "/public/styles",
    debug: true,
    outputStyle: "expanded",
  })
);
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const menuRoutes = require("./routes/menu");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// app.use("/api/menu", menuRoutes(db));

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  menuRoutes
    .getAllMenuItems(db)
    .then((obj) => {
      res.render("index", { menu_items: obj });
    })
    .catch((err) => {
      res.render("error");
    });
});

// Menu Page
app.get("/menu", (req, res) => {
  menuRoutes.getAllMenuItems(db).then((obj) => {
    res.render("menu", { menu_items: obj });
  });
});

//template file do ajax request make a request to /api/menu... this is done in app.js

// app.post("/menu", (req, res) => {
//   ITEMS EDITED FROM rest-menu
// })

app.get("/cart", (req, res) => {
  res.render("cart");
});

// Jason put this code in. I am trying to get the SMS to work.
// This works. When the checkout button is clicked, it
// sends a text message.
app.post("/cart", function (req, res) {
  // sendSMSText('Hello from Jason again!')
});

app.get("/restaurant", function (req, res) {
  res.render("restaurant");
});

app.get("/complete", function (req, res) {
  res.render("complete");
});

app.post("/complete", function (req, res) {
  // req.body
});





// This posts to /sms, but I don't think we actually need the /sms page.
// This is used for the SMS API (Twilio). When it recieves a text from a customer,
// it immediatly responds back with a message. -> twiml.message();
app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();
  twiml.message("Your order is ready for pick-up!!!");
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

// This is a test... The message code is set into a function
// WHen the function is called, it's sends a text.
// Need to figure out how to call this function when a button
// is clicked.
// const accountSid = '';
// const authToken = '';
// const client = require('twilio')(accountSid, authToken);
// const sendSMSText = function(message) {
//   client.messages
//     .create({
//       body: message,
//       from: '+15406573369',
//       to: '+14165353345'
//     }).then(message => console.log(message.sid));
// };
// sendSMSText('Hello from Jason again!')



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
