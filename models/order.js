const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    groid:[{
        type:String,
    }],
    paytype:{
        type:String,  
    },
    card:[{
        name:{type:String},
        cardNo:{type:Number},
        expiryDate:{type:String}
    }],
    cart:[{
        type:String
    }],
    bdate:{
        type:Date
    },
    ddate:{
        type:Date
    },
    ostatus:{
        type:String
    },
    ratings:[{
        nstars:{type:Number},
        description:{type:String}       
    }],
    amount:{
        type:Number
    },
    daddress:[{    
            name:{type:String},
            door:{type:String},
            street:{type:String},
            landmark:{type:String},
            city:{type:String},
            state:{type:String},
            pincode:{type:Number}
            }]
})

module.exports= mongoose.model('Order',orderSchema)
