console.log("User Router");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const e = require("express");

const verifyLogIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
let cartCount = (req, res, next) => {
  userHelpers.getCartCount(req.session.user._id);
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log("Homepage");
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(user._id);
  }

  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

/* GET login page */
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { logInErr: req.session.logInErr });
    req.session.logInErr = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.logInErr = "Incorrect Username or Password";
      res.redirect("/login");
    }
  });
});

/* GET signup page */
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignUp(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", verifyLogIn, async (req, res) => {
  let user = req.session.user;

  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  let cartProducts = await userHelpers.getCartProducts(req.session.user._id);
  let total = 0;
  if (cartProducts != null) {
    total = await userHelpers.getTotalPrice(user._id);
  }

  console.log(cartProducts);
  console.log(user);
  res.render("user/cart", { cartProducts, user, cartCount, total });
});

router.get("/add-to-cart/:id", verifyLogIn, (req, res) => {
  if (req.session.user) {
    console.log("ajax call");
    console.log("addcart user");
    console.log(req.params.id);
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  } else {
    res.redirect("/login");
  }
});

//Change Quantity in cart
router.post("/change-quantity", async (req, res, next) => {
  console.log("ajax quantity");
  console.log(req.body);
  userHelpers.updateQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalPrice(req.body.userId);
    res.json(response);
  });
});

router.post("/remove-cart-product", (req, res, next) => {
  console.log("remove api call");
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response);
    console.log("removed");
  });
});

router.get("/place-order", verifyLogIn, async (req, res, next) => {
  let total = await userHelpers.getTotalPrice(req.session.user._id);
  console.log(total);
  res.render("user/place-order", { total, user: req.session.user });
});

router.post("/place-order", verifyLogIn, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.body.userId);
  let total = await userHelpers.getTotalPrice(req.body.userId);
  console.log(req.body);
  if (req.body.Payment == "COD") {
    userHelpers.placeOrder(req.body, products, total).then((response) => {
      res.json(response);
    });
  }
  console.log(req.body);
});

router.get("/order-success", (req, res, next) => {
  res.render("user/order-success", { user: req.session.user });
});

router.get("/orders", async (req, res, next) => {
  if (req.session.user) {
    let orders =await userHelpers.getUserOrders(req.session.user._id);
    console.log(orders);
    res.render("user/orders", { orders, user: req.session.user });
  }
  else{
    res.redirect("/login")
  }
});

module.exports = router;
