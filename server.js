
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function (error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function () {
    console.log("Mongoose connection successful.");
});


// Routes
// ======

// Refresh the database upon loading page

app.get("/clear", function (req, res) {
    console.log("clear route hit");
    Article.remove({}, function (error, result) {

        res.send(result);

    });
});


// A GET request to scrape the website
app.get("/scrape", function (req, res) {
    request("https://www.reddit.com/r/FloridaMan//", function (error, response, html) {
        // Then, load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, grab every p tag with a title class
        $("p.title").each(function (i, element) {

            // Save an empty result object
            var result = {};

            // Add the title text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            // Using Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Save that entry to the db
            entry.save(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    console.log(doc);
                }
            });

        });
    });
    // Tell the browser that we finished scraping the site
    res.send("Scrape Complete");
    console.log("scrape complete")

});

// This will get the articles scraped from the mongoDB
app.get("/articles", function (req, res) {
    console.log("articles route hit");


    Article.find({}, function (error, result) {
        console.log(result);
        res.json(result);

    });

});

// This will grab an article by its ObjectId
app.get("/articles/:id", function (req, res) {


    // Still TO DO


    // Finish the route so it finds one article using the req.params.id,

    // and run the populate method with "note",

    // then responds with the article with the note included
    Article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec(function (error, doc) {
            if (error) {
                res.send(error);
            }
            // Or send the doc to the browser
            else {
                res.send(doc);
            }
        })
});

// Create a new note or replace an existing note
app.post("/articles/:id", function (req, res) {


    // Still TO DO
    // ====

    // save the new note that gets posted to the Notes collection

    // then find an article from the req.params.id

    // and update it's "note" property with the _id of the new note


});


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});