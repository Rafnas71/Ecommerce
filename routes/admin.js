console.log("Importing admin router");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

/* GET view products page. */
router.get("/", function (req, res, next) {
  console.log("Handling admin route");
  productHelpers.getAllProducts().then((products)=>{
    res.render("admin/view-products", { admin: true, products});
  });
});


/* GET add product page. */
router.get("/add-product", (req, res) => {
  res.render("admin/add-product", { admin: true });
});

/* POST add product page. */
router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);
  console.log("Add product post req");

  if (req.files && req.files.Image) {
    console.log("req file found");
    console.log(req.files.Image);
    productHelpers.addProduct(req.body, (id) => {
      let image = req.files.Image;
      image.mv("./public/images/product-images/"+id+".jpg",(err)=>{
        if(!err){
          res.redirect("/admin")
        }
        else{
          console.log(err)
        }
})
});   
}})

router.get('/delete-product/:id',(req,res)=>{
  let productId = req.params.id;
  console.log(productId)
  productHelpers.deleteProduct(productId);
  res.redirect("/admin")
});

router.get('/edit-product/:id',async(req,res)=>{
  console.log("edit id"+ req.params.id)
  let product =await productHelpers.getProductDetails(req.params.id).then((product)=>{
    ///console.log(product);
    res.render("admin/edit-product",{ admin:true, product});
  })
});

router.post('/edit-product/:id',(req,res)=>{
  let image = req.files.Image;
  let id=req.params.id;
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    console.log("updated");
    res.redirect("/admin")
    if(req.files.Image){
      image.mv("./public/images/product-images/"+id+".jpg")
    }
  })
})

module.exports = router;
