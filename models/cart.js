const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [
      {
        groceryId:String,
        productId: String,
        quantity: Number,
        name: String,
        tprice: Number,
         image:String,
        category:String
      }
    ],
    outOfStock:[
      {
        groceryId:String,
        productId: String,
        quantity: Number,
        name: String,
        tprice: Number,
        image:String,
        category:String
      }
    ],
    totalAmount:Number,
    status: {
    type:String
    },
     paytype:{
        type:String,  
    },
    card:{
        name:{type:String},
        cardNo:{type:Number},
        expiryMonth:{type:Number},
        expiryYear:{type:Number}
    },
    bdate:{
      type:String
  },
  ddate:{
      type:String
  },
  ratings:[{
    nstars:{type:Number},
    description:{type:String}     }  
],
daddress:{    
  name:{type:String},
  door:{type:String},
  street:{type:String},
  landmark:{type:String},
  city:{type:String},
  state:{type:String},
  pincode:{type:Number}
  }
});

module.exports = mongoose.model("Cart", CartSchema);