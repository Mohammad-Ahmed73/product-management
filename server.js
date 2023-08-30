const express = require('express');
const db = require('./db');
const path = require('path');
const { exit } = require('process');
const bodyParser = require('body-parser');
const { rejects } = require('assert');

const port = 5000;

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies


app.get("/login", (req, res) => {
  let data = [];
  res.render("login", data);
});

app.post("/login", async (req, res) => {

  const { u_name, u_password } = req.body;
  const selectQuery = 'SELECT * FROM users WHERE u_name = ? and  u_password = ?';

  await db.query(selectQuery, [u_name, u_password], (err, rows) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching data from the database');
    } else {
      if (rows.length > 0) {
        console.log("userData", rows[0].u_id);
        res.cookie('user', rows[0].u_id).redirect("/dashboard");

        // res.redirect("/dashboard");
      } else {
        res.redirect("/login");
        res.status(500).send('Error registering user');
      }
    }
  });
});

app.get("/register", (req, res) => {
  const sqlQuery = 'SELECT * FROM role';

  db.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching data from the database');
    } else {
      const data = {
        roles: rows,
      };

      // If you want to render the roles in the response, you can do this
      res.render('register', data);
    }
  });
});

app.post("/register", async (req, res) => {
  const { u_name, u_password, r_id } = req.body;
  let userExist = await checkUserExist(u_name);

  if (!userExist) {
    const insertQuery = 'INSERT INTO users (u_name, u_password, r_id) VALUES (?, ?, ?)';

    // Then, insert the user after fetching roles
    await db.query(insertQuery, [u_name, u_password, r_id], (err, result) => {
      if (err) {
        console.error('Error executing insert query:', err);
        res.status(500).send('Error registering user');
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.redirect('/register');
  }
});


app.get("/dashboard", (req, res) => {
  const sql = 'SELECT * From users'
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching data from the database');
    } else {
      const data = {
        users: rows,
      };
      console.log(data)
      res.render('dashboard', data);
    }
  });
});

// app.post("/dashboard", async (req, res) => {
//   const { product_name, product_price, product_quantity } = req.body;
//   const insertQuery = 'INSERT INTO products (product_name, product_price, product_quantity) VALUES (?, ?, ?)'; // Change 'users' to 'products' if that's the correct table name

//   try {
//     await db.query(insertQuery, [product_name, product_price, product_quantity]);
//     console.log("Product added successfully");
//     res.redirect("/dashboard"); // Redirect to the dashboard after successful insert
//   } catch (err) {
//     console.error('Error executing insert query:', err);
//     res.status(500).send('Error adding product');
//   }
// });

app.post("/dashboard", async (req, res) => {
  const { product_name, product_price, product_quantity } = req.body;
  const insertQuery = 'INSERT INTO products (product_name, product_price, product_quantity) VALUES (?, ?, ?)';

    // Then, insert the user after fetching roles
    await db.query(insertQuery, [product_name, product_price, product_quantity], (err, result) => {
      if (err) {
        console.error('Error executing insert query:', err);
        res.status(500).send('Error registering user');
      } else {
        res.redirect('/dashboard');
      }
    });
});

let checkUserExist = (username) => {
  return new Promise((resolve, reject) => {
    const selectQuery = 'SELECT * FROM users WHERE u_name = ? ';
    db.query(selectQuery, [username], (err, rows) => {
      if (err) {
        return reject(false);
      } else {
        if (rows.length > 0) return resolve(true);
        return resolve(false);
      }
    })
  });
}

app.listen(port, () => console.log(`Server is now listening on port ${port}`));