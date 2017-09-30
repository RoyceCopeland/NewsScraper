/* Scrape and Display
 * (If you can do this, you should be set for your hw)
 * ================================================== */

// STUDENTS:
// Please complete the routes with TODOs inside.
// Your specific instructions lie there

// Good luck!

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
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the website
app.get("/scrape", function(req, res) {
    request("https://www.reddit.com/r/FloridaMan//", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every p tag with a title class
        $("p.title").each(function(i, element) {

            // Save an empty result object
            var result = {};

            // Add the title text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc) {
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
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
    $.getJSON("/articles", function(data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the information on the page
            $("#scrapedStories").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {


    // TODO: Finish the route so it grabs all of the articles
    Article.find({}, function(error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Or send the doc to the browser
        else {
            res.send(doc);
        }
     
    });

});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {


    // TODO
    // ====

    // Finish the route so it finds one article using the req.params.id,

    // and run the populate method with "note",

    // then responds with the article with the note included
    Article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec(function(error, doc) {
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
app.post("/articles/:id", function(req, res) {


    // TODO
    // ====

    // save the new note that gets posted to the Notes collection

    // then find an article from the req.params.id

    // and update it's "note" property with the _id of the new note


});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});