// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

let api_key = process.env.MORPH_MYSECRET;

function initDatabase(callback) {
  // Set up sqlite database.
  var db = new sqlite3.Database("data.sqlite");
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS data (id TEXT, name TEXT)");
    callback(db);
  });
}

function updateRow(db, id, name) {
  // Insert some data.
  var statement = db.prepare("INSERT INTO data VALUES (?, ?)");
  statement.run(id, name);
  statement.finalize();
}

function readRows(db) {
  // Read some data.
  db.each("SELECT rowid AS id, name FROM data", function(err, row) {
    console.log(row.id + ": " + row.name);
  });
}

function fetchPage(url, callback) {
  // Use request to read in pages.
  request(url, function (error, response, body) {
    if (error) {
      console.log("Error requesting page: " + error);
      return;
    }

    callback(body);
  });
}

function run(db) {
  // Use request to read in pages.
  console.log("process.env", process.env);
  console.log("process.env.MORPH_API_KEY=" + process.env.MORPH_API_KEY);
  var api_key = process.env.MORPH_API_KEY;
  console.log("api_key=" + api_key);
  fetchPage("https://api.digitalnz.org/records.json?and[dc_type]=Name+Authority&and[collection]=TAPUHI&record_type=1&fields=title,record_id&sort=syndication_date&direction=desc&api_key=" + api_key, function (data) {
    // Use cheerio to find things in the page with css selectors.
    //var $ = cheerio.load(body);
    console.log("data=", data.search.results);
    var results = data.search.results;
    var len = results.length;
    console.log("len=", len);
    
/*
    var elements = $("div.media-body span.p-name").each(function () {
      var value = $(this).text().trim();
      updateRow(db, value);
    });

    readRows(db);
*/
    db.close();
  });
}

initDatabase(run);
