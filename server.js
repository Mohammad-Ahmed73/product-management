const express = require('express');
const db = require('./db');
const path = require('path');
const { exit } = require('process');
const bodyParser = require('body-parser');
const { rejects } = require('assert');
const cookieParser = require('cookie-parser');

const port = 5000;

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(cookieParser());


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
        // console.log("userData", rows[0].u_id);
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
    
    const insertQuery = 'INSERT INTO users (u_name, u_password, r_id) VALUES (?, ?, ? )';

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
  const sql = 'SELECT * From products'
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching data from the database');
    } else {
      const data = {
        products: rows,
      };
      // console.log(data)
      res.render('dashboard', data);
    }
  });
});

app.post("/dashboard", async (req, res) => {
  const { product_name, product_price, product_quantity } = req.body;
  let currentUser = req.cookies.user;
  const insertQuery = 'INSERT INTO products (product_name, product_price, product_quantity, u_id) VALUES (?, ?, ?, ?)';

    // Then, insert the user after fetching roles
    await db.query(insertQuery, [product_name, product_price, product_quantity, currentUser], (err, result) => {
      if (err) {
        console.error('Error executing insert query:', err);
        res.status(500).send('Error registering user');
      } else {
        res.redirect('/dashboard');
      }
    });
});

app.get("/deleteproduct/:id", async (req, res) => {
  const product_id = req.params.id;
  //const { product_id } = req.body;
  const deleteQuery = 'DELETE FROM products WHERE product_id = ?';
  db.query(deleteQuery, [product_id], (err, rows) => {
    if (err) {
      
    } else {
      res.redirect('/dashboard')
    }
  })
    // Then, insert the user after fetching roles
    // await db.query(insertQuery, [product_id, u_id], (err, result) => {
    //   if (err) {
    //     console.error('Error executing insert query:', err);
    //     res.status(500).send('Error registering user');
    //   } else {
    //     res.redirect('/dashboard');
    //   }
    // });
});


// app.put("/editProduct/:id", async (req, res) => {
//   const product_id = req.params.id;
//   const updatedProductData  = req.body;
//   const updateQuery = 'UPDATE products SET product_name = ?, product_price = ?, product_quantity = ? WHERE product_id = ?';
//   console.log(req.body)
//   db.query(updateQuery, [ updatedProductData.product_id, updatedProductData.product_name, updatedProductData.product_price, updatedProductData.product_quantity,product_id], (err, rows) => {
//     if (err) {
//       console.error('Error executing insert query:', err);
//       res.status(500).send('Error registering user');
//     } else {
//       res.redirect('/dashboard')
//     }
//   })
// });


app.post('/editProduct', async (req, res) => {
  // const productId = req.params.productId;
  const { product_id, product_name, product_price, product_quantity } = req.body; // Expecting the updated product data in the request body

  const updateQuery = 'UPDATE products SET product_name = ?, product_price = ?, product_quantity = ? WHERE product_id = ?';

  db.query(updateQuery, [product_name, product_price, product_quantity, product_id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Product updated successfully');
      res.status(200).json({ message: 'Product updated successfully' });
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