var db = require("../config/connection");
var collection = require("../config/collections");
var bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/collections");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");

module.exports = {
  doSignUp: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      console.log(userData);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          let insertedId = data.insertedId;
          db.get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: insertedId })
            .then((user) => {
              console.log("find user" + user);
              resolve(user);
            });
        });
    });
  },

  doLogin: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      console.log("user auth");
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("No Account");
        resolve({ status: false });
      }
    });
  },

  addToCart: (prodId, userId) => {
    let proObj = {
      proId: new ObjectId(prodId),
      quantity: 1,
    };

    return new Promise(async (resolve, reject) => {
      console.log("addcart user " + prodId);
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ userId: new ObjectId(userId) });

      if (userCart) {
        console.log(userCart + new Object(prodId));
        let proExist = await userCart.products.findIndex(
          (product) =>
            product.proId.toString() === new ObjectId(prodId).toString()
        );
        console.log(proExist);
        console.log(userCart.products);
        if (proExist != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              {
                userId: new ObjectId(userId),
                "products.proId": new ObjectId(prodId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              console.log("product  quantity updated");
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { userId: new ObjectId(userId) },
              { $push: { products: proObj } }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          userId: new ObjectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    console.log("getcart" + userId);
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { userId: new ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              proId: "$products.proId",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              proId: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
          // {
          //   $lookup: {
          //     from: collection.PRODUCT_COLLECTION,
          //     let: { prodList: "$products" },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ["$_id", "$$prodList"],
          //           },
          //         },
          //       },
          //     ],
          //     as: "cartItems",
          //   },
          // },
        ])
        .toArray();
      if (cartItems) {
        resolve(cartItems);
      } else {
        resolve(null);
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = null;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: new ObjectId(userId) });
      console.log("cart:" + cart);
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  updateQuantity: (details) => {
    console.log(details);

    details.count = parseInt(details.count);

    return new Promise((resolve, reject) => {
      if (details.quantity == 1 && details.count == -1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: new ObjectId(details.cartId) },
            {
              $pull: { products: { proId: new ObjectId(details.proId) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: new ObjectId(details.cartId),
              "products.proId": new ObjectId(details.proId),
            },
            {
              $inc: { "products.$.quantity": parseInt(details.count) },
            }
          )
          .then(() => {
            console.log("product  quantity updated");
            resolve({ status: true });
          });
      }
    });
  },

  removeCartProduct: (details) => {
    console.log("remove function");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: new ObjectId(details.cartId) },
          {
            $pull: { products: { proId: new ObjectId(details.proId) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },

  getTotalPrice: (user) => {
    return new Promise(async (resolve, reject) => {
      let userId = user.toString();
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { userId: new ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              proId: "$products.proId",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              proId: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    { $toDouble: "$quantity" },
                    { $toDouble: "$product.Price" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      if (total[0] != null) {
        resolve(total[0].total);
      } else {
        resolve();
      }
    });
  },

  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let status = order.Payment === "COD" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          address: order.Address,
          mobile: order.Mobile,
          pincode: order.Pincode,
        },
        userId: new ObjectId(order.userId),
        paymentMethod: order.Payment,
        products: products,
        total: total,
        status: status,
        date:new Date()
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .deleteOne({ userId: new ObjectId(order.userId) });
          resolve({ placed: true });
        });
    });
  },

  getUserOrders: async (userId) => {
    console.log("userId getOrders");    
    return new Promise(async(resolve, reject) => {
      try {
        console.log(userId)       
        let orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({userId:new ObjectId(userId)})
          .toArray();
        resolve(orders);        
      } catch (error) {
        reject(error);
      }
    });
  }
};
