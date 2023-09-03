const express = require("express");
const db = require("./db");
const path = require("path");
const cookieParser = require("cookie-parser");

const port = 5000;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

// Login Route

app.get("/login", (req, res) => {
  let data = [];
  res.render("login", data);
});

app.post("/login", async (req, res) => {
  const { u_mail, u_password } = req.body;
  const selectQuery =
    "SELECT * FROM users WHERE u_mail = ? and  u_password = ?";

  await db.query(selectQuery, [u_mail, u_password], (err, rows) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data from the database");
    } else {
      if (rows.length > 0) {
        res.cookie("user_role", rows[0].r_id);
        res.cookie("user", rows[0].u_id).redirect("/dashboard");
      } else {
        res.send(
          '<script>alert("Wrong Email and Password"); window.location = "/login";</script>'
        );
      }
    }
  });
});

// Register Route

app.get("/register", (req, res) => {
  const sqlQuery = "SELECT * FROM role";

  db.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data from the database");
    } else {
      const data = {
        roles: rows,
      };

      // If you want to render the roles in the response, you can do this
      res.render("register", data);
    }
  });
});

app.post("/register", async (req, res) => {
  const { u_name, u_mail, u_password, r_id } = req.body;
  let userExist = await checkUserExist(u_mail);

  if (!userExist) {
    const insertQuery =
      "INSERT INTO users (u_name, u_mail, u_password, r_id) VALUES (?, ?, ?, ?)";

    // Then, insert the user after fetching roles
    await db.query(
      insertQuery,
      [u_name, u_mail, u_password, r_id],
      (err, result) => {
        if (err) {
          console.error("Error executing insert query:", err);
          res.status(500).send("Error registering user");
        } else {
          res.redirect("/login");
        }
      }
    );
  } else {
    res.send(
      '<script>alert("User already exists. Please choose a different Email."); window.location = "/register";</script>'
    );
  }
});

// Logout Route

app.get("/logout", (req, res) => {
  // Clear the user's cookie
  res.clearCookie("user");
  res.clearCookie("user_role");

  // Redirect to the login or home page
  res.redirect("/login"); // Change '/login' to your desired destination
});

// Forgot Password

app.get("/forgotPassword", (req, res) => {
  let data = [];
  res.render("forgotPassword", data);
});

app.post("/forgotPassword", async (req, res) => {
  const { u_mail } = req.body;
  const selectQuery = "SELECT * FROM users WHERE u_mail = ?";

  await db.query(selectQuery, [u_mail], (err, rows) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data from the database");
    } else {
      if (rows.length > 0) {
        res.cookie("user_role", rows[0].r_id);
        res.cookie("user_id", rows[0].u_id).redirect("/resetPassword");
      } else {
        res.send(
          '<script>alert("Wrong Email"); window.location = "/forgotPassword";</script>'
        );
      }
    }
  });
});

// Reset Password
app.get("/resetPassword", (req, res) => {
  let data = [];
  res.render("resetPassword", data);
});

app.post("/resetPassword", (req, res) => {
  const { u_password } = req.body;
  let currentUser = req.cookies.user_id;
  console.log(currentUser);
  const updateQuery = "UPDATE users SET u_password = ? WHERE u_id = ?";

  db.query(updateQuery, [u_password, currentUser], (err, result) => {
    if (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.redirect("login");
    }
  });
});

// Dash Board Route

app.get("/dashboard", (req, res) => {
  let activeuser = req.cookies.user;
  let userRole = req.cookies.user_role;
  const currentRole = parseInt(userRole, 10);
  const currentUser = parseInt(activeuser, 10);

  if (!currentUser) {
    res.redirect("/login");
  }

  const userdata = "SELECT * FROM users";
  const productdata = "SELECT * FROM products";

  db.query(productdata, (err, productRows) => {
    if (err) {
      console.error("Error executing product query:", err);
      res.status(500).send("Error fetching product data from the database");
      return; // Exit early on error
    }

    db.query(userdata, (err, userRows) => {
      if (err) {
        console.error("Error executing user query:", err);
        res.status(500).send("Error fetching user data from the database");
        return; // Exit early on error
      }

      // Find the current user's data
      const currentUserData = userRows.find(
        (user) => user.u_id === currentUser
      );

      const data = {
        products: productRows,
        users: userRows,
        currentUserName: currentUserData ? currentUserData.u_name : "",
        currentUserEmail: currentUserData ? currentUserData.u_mail : "",
        currentUserPassword: currentUserData ? currentUserData.u_password : "",
        currentUser: currentUser,
        currentRole: currentRole,
      };

      res.render("dashboard", data);
    });
  });
});

app.post("/dashboard", async (req, res) => {
  const { product_name, product_price, product_quantity } = req.body;
  let currentUser = req.cookies.user;
  const insertQuery =
    "INSERT INTO products (product_name, product_price, product_quantity, u_id) VALUES (?, ?, ?, ?)";

  // Then, insert the user after fetching roles
  await db.query(
    insertQuery,
    [product_name, product_price, product_quantity, currentUser],
    (err, result) => {
      if (err) {
        console.error("Error executing insert query:", err);
        res.status(500).send("Error registering user");
      } else {
        res.redirect("/dashboard");
      }
    }
  );
});

// Delete Route

app.get("/deleteproduct/:id", (req, res) => {
  const product_id = req.params.id;
  const deleteQuery = "DELETE FROM products WHERE product_id = ?";

  db.query(deleteQuery, [product_id], (err, rows) => {
    if (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.redirect("/dashboard");
    }
  });
});

app.get("/deleteUser/:id", (req, res) => {
  const u_id = req.params.id;
  const deleteQuery = "DELETE FROM users WHERE u_id = ?";

  db.query(deleteQuery, [u_id], (err, rows) => {
    if (err) {
      console.error("Error deleting User:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.send(
        '<script>alert("User Deleted"); window.location = "/dashboard";</script>'
      );
    }
  });
});

// Edit Product

app.post("/editProduct", async (req, res) => {
  const { product_id, product_name, product_price, product_quantity } =
    req.body; // Expecting the updated product data in the request body

  const updateQuery =
    "UPDATE products SET product_name = ?, product_price = ?, product_quantity = ? WHERE product_id = ?";

  db.query(
    updateQuery,
    [product_name, product_price, product_quantity, product_id],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log("Product updated successfully");
        res.redirect("dashboard");
      }
    }
  );
});

app.post("/editUser", async (req, res) => {
  const { u_id, u_name, u_password } = req.body; // Expecting the updated user data in the request body

  const updateQuery =
    "UPDATE users SET u_name = ?, u_password = ? WHERE u_id = ?";

    db.query(updateQuery, [u_name, u_password, u_id], (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log("User updated successfully");
        res.redirect("/dashboard");
      }
    });
});

let checkUserExist = (usermail) => {
  return new Promise((resolve, reject) => {
    const selectQuery = "SELECT * FROM users WHERE u_mail = ? ";
    db.query(selectQuery, [usermail], (err, rows) => {
      if (err) {
        return reject(false);
      } else {
        if (rows.length > 0) return resolve(true);
        return resolve(false);
      }
    });
  });
};

app.listen(port, () => console.log(`Server is now listening on port ${port}`));