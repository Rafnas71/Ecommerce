console.log("Importing admin router");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

/* GET view products page. */
router.get("/", function (req, res, next) {
  console.log("Handling admin route");
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render("admin/view-products", { admin: true, products});
  })
  }
  
);

/* GET add product page. */
router.get("/add-product", (req, res) => {
  res.render("admin/add-product", { admin: true });
});

/* POST add product page. */
router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log("Add product post req");

  if (req.files && req.files.Image) {
    console.log("req file found");
    console.log(req.files.Image);
    productHelpers.addProduct(req.body, (id) => {
      let image = req.files.Image;
      image.mv("./public/images/product-images/"+id+".jpg",(err)=>{
        if(!err){
          res.render("admin/add-product",{admin:true})
        }
        else{
          console.log(err)
        }
})
});
}})
module.exports = router;
