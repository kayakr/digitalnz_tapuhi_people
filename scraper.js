// This is a template for a Node.js scraper on morph.io (https://morph.io).

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
  //console.log("process.env", process.env);
  //console.log("process.env.MORPH_API_KEY=" + process.env.MORPH_API_KEY);
  var api_key = process.env.MORPH_API_KEY;
  //console.log("process.argv", process.argv);
  
  // If no key, we may be running on local.
  console.log("api_key defined?", api_key !== null);
  // per page limit is 100 - is this documented anywhere?
  fetchPage("https://api.digitalnz.org/records.json?and[dc_type]=Name+Authority&and[collection]=TAPUHI&record_type=1&fields=title,record_id&sort=syndication_date&direction=desc&per_page=100&api_key=" + api_key, function (data) {

    //console.log("data=", data);
    let results = JSON.parse(data);
    console.log("results=", results);
    //var results = data.search.results;
    var len = results.search.results.length;
    console.log("len=", len);
    if (len > 0) {
      for(i=0;i<len;i++) {
        var record = results.search.results[i];
        if (record != null) {
          var id = record.record_id;
          var name = record.title;
          console.log('record=', [id, name]);
          updateRow(db, [id, name]);
        }
      }
    }
    readRows(db);

    db.close();
  });
}

initDatabase(run);
