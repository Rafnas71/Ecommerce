var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");

module.exports = {
  addProduct: (product, callback) => {
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        console.log(data.insertedId);

        callback(data.insertedId);
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        callback(null, error);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: new ObjectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getProductDetails: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: new ObjectId(id) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProduct: (id, product) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              Name: product.Name,
              Price: product.Price,
              Description: product.Category,
              Description: product.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
};
