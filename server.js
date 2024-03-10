const mysql = require("mysql2");
const url = require("url");
const http = require("http");
const GET = "GET";
const POST = "POST";

const connection = mysql.createConnection({
  host: "localhost",
  user: "troy",
  password: "DigitalOcean",
  database: "Lab5",
});

connection.connect((err) => {
  if (err) {
    // TODO: Change to sending error and front facing string
    console.log("Connection error message: " + err.message);
    return;
  }

  // If connection is successful, execute the SQL statement to create the table
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS PATIENTS (
          patientID INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          dob DATE
        ) ENGINE=InnoDB;
    `;

  connection.query(createTableQuery, (err, result) => {
    if (err) {
      // If there's an error creating the table, send an error response to the client
      res.end("Error: Unable to create the table");
      console.log("Error creating table: " + err.message);
      return;
    }

    // If table creation is successful, send a success response to the client
    console.log("Table created successfully!");
  });
});

// ChatGPT was used when creating this function
http
  .createServer(function (req, res) {
    if (req.method === GET && req.url.startsWith("/lab5/api/v1/sql")) {
      const parsedUrl = url.parse(req.url, true);
      const query = parsedUrl.query["query"];
      if (!query) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
        });
        res.end(JSON.stringify({ error: "No query provided" }));
        return;
      }

      const decodedQuery = decodeURIComponent(query);
      const splitQuery = decodedQuery.split(" ");
      if (splitQuery[0].toUpperCase() === "SELECT") {
        connection.query(decodedQuery, (err, result) => {
          if (err) {
            res.writeHead(400, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "*",
            });
            res.end(JSON.stringify({ error: "Bad query: " + err.message }));
            return;
          }

          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          });

          const jsonResult = JSON.stringify({ results: result });
          res.end(jsonResult);
        });
      } else {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
        });
        res.end(JSON.stringify({ error: "Only SELECT queries are allowed" }));
      }
    } else {
      res.writeHead(404, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      });
      res.end(JSON.stringify({ error: "Page not found!" }));
    }
  })
  .listen(8888);

// Close the database connection when the server is stopped
process.on("SIGINT", () => {
  connection.end();
  console.log("Server stopped. Database connection closed.");
  process.exit();
});

// CODE:
// server {
//     server_name comp4537labs.com www.comp4537labs.com;

//     location / {
//         proxy_pass http://localhost:8888;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_cache_bypass $http_upgrade;
//     }
// }
