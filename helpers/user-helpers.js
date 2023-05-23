var db = require("../config/connection");
var collection = require("../config/collections");
var bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/collections");

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      console.log(userData);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data);
        });
    });
  },

  doLogin:(userData) =>{

    let response={}
    return new Promise (async (resolve,reject)=>{
        console.log("user")
        let user =await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email});
        if(user){
            bcrypt.compare(userData.Password,user.Password).then((status)=>{   
              if(status){
                console.log("login success");
                response.user=user;
                response.status=true; 
                resolve(response);
              }
              else{
                console.log("Login failed");
                resolve({status:false})
              }
            })
        }
        else{
            console.log("No Account");
            resolve({status:false})
        }
        
    })
  }
  
};
