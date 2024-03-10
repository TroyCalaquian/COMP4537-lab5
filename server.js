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

// ChatGPT was used when creating this function
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    connection.connect((err) => {
      if (err) {
        console.log("Connection error message: " + err.message);
        return;
      }

      // If connection is successful, execute the SQL statement to create the table
      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS your_table_name (
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
        const message = "Table created successfully!";
        res.end(message);
        console.log("Table created successfully!");
      });

      if (req.method === GET) {

      }

      if (req.method === POST) {
        
      }
    });
    connection.end();
  })
  .listen(8888);

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
