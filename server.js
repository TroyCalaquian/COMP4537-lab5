const mysql = require("mysql2");
const url = require("url");
const http = require("http");
const strings = require("./lang/messages/en/user");
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
      res.end(
        JSON.stringify({
          error: `${strings.messages.tableCreationError} ${err.message}`,
        })
      );
      console.log("Error creating table: " + err.message);
      return;
    }

    // If table creation is successful, send a success response to the client
    console.log("Table created successfully!");
  });
});

// ChatGPT was used when creating this function
const server = http
  .createServer(function (req, res) {
    if (req.method === GET && req.url.startsWith("/lab5/api/v1/sql")) {
      const parsedUrl = url.parse(req.url, true);
      const query = parsedUrl.query["query"];
      if (!query) {
        // res.writeHead(400, {
        //   "Content-Type": "application/json",
        //   "Access-Control-Allow-Origin": "*",
        //   "Access-Control-Allow-Methods": "*",
        //   "Access-Control-Allow-Headers": "*",
        // });
        res.statusCode = 400; // Set the status code to 400
        res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
        res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
        res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
        res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

        res.end(
          JSON.stringify({ error: `${strings.messages.noQueryProvided}` })
        );
        return;
      }

      const decodedQuery = decodeURIComponent(query);
      const splitQuery = decodedQuery.split(" ");
      if (splitQuery[0].toUpperCase() === "SELECT") {
        connection.query(decodedQuery, (err, result) => {
          if (err) {
            res.statusCode = 400; // Set the status code to 400
            res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
            res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
            res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
            res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

            res.end(
              JSON.stringify({
                error: `${strings.messages.badQuery}: ${err.message}`,
              })
            );
            return;
          }

          res.statusCode = 200; // Set the status code to 200
          res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
          res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
          res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
          res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

          const jsonResult = JSON.stringify({ results: result });
          res.end(jsonResult);
        });
      } else {
        res.statusCode = 400; // Set the status code to 400
        res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
        res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
        res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
        res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

        res.end(JSON.stringify({ error: strings.messages.selectOnly }));
      }
    } else if (req.method === POST && req.url.startsWith("/lab5/api/v1/sql")) {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          const query = jsonData.query.trim();
          console.log("Query: " + query);
          const splitQuery = query.split(" ");
          if (splitQuery[0].toUpperCase() === "INSERT") {
            connection.query(query, (err, result) => {
              if (err) {
                res.statusCode = 400; // Set the status code to 400
                res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
                res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
                res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
                res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

                res.end(
                  JSON.stringify({
                    error: `${strings.messages.badQuery}: ${err.message}`,
                  })
                );
                return;
              }

              res.statusCode = 200; // Set the status code to 200
              res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
              res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
              res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
              res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

              const jsonResult = JSON.stringify({ results: result });
              res.end(jsonResult);
            });
          } else {
            res.statusCode = 400; // Set the status code to 400
            res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
            res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
            res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
            res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

            res.end(JSON.stringify({ error: strings.messages.insertOnly }));
          }
        } catch (error) {
          res.statusCode = 500; // Set the status code to 500
          res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
          res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
          res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
          res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

          res.end(
            JSON.stringify({
              error: `${strings.messages.JSONerror}: ${error.message}`,
            })
          );
        }
      });
    } else {
      res.statusCode = 404; // Set the status code to 404
      res.setHeader("Content-Type", "application/json"); // Set the Content-Type header
      res.setHeader("Access-Control-Allow-Origin", "*"); // Set the Access-Control-Allow-Origin header
      res.setHeader("Access-Control-Allow-Methods", "*"); // Set the Access-Control-Allow-Methods header
      res.setHeader("Access-Control-Allow-Headers", "*"); // Set the Access-Control-Allow-Headers header

      res.end(JSON.stringify({ error: strings.messages.pageNotFound }));
    }
  })
  .listen(8888);

// Close the database connection when the server is stopped
process.on("SIGINT", () => {
  server.close(() => {
    connection.end();
    console.log("Server stopped. Database connection closed.");
    process.exit();
  });
});
