const express = require('express');
const mysql = require('mysql');
const path = require('path');

const port = 5000;

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "product db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/user", (req, res) => {
  const data = {
    name: "Mohammad", // Replace with your data
  };

  res.render("index", data);
});


app.listen(port, () => console.log(`Server is now listening on port ${port}`));
