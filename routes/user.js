console.log("User Router");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const verifyLogIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;
  console.log("Homepage" + user);
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user });
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
    console.log(response)
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

router.get("/cart", verifyLogIn, async(req, res) => {
  let cartProducts=await userHelpers.getCartProducts(req.session.user._id)
  console.log(cartProducts);
  res.render("user/cart",{cartProducts});
});

router.get("/add-to-cart/:id", verifyLogIn , (req,res)=>{
  console.log("addcart user"+req.session.user._id);
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
})
module.exports = router;
