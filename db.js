const mysql = require('mysql');

const dbConnection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "product db",
});

module.exports = dbConnection;