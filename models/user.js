const { date } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    } ,
    address:[ 
        {
        name:{type:String,required:true},
        door:{type:String,required:true},
        street:{type:String,required:true},
        landmark:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        pincode:{type:Number,required:true}
        }
    ],
    dob:{
        type:String,
        required:true
    },
    
    contact:[{
        type:Number,required:true
    }],
     orders:[{
        type:Schema.Types.ObjectID,
        ref:'Order'
    }]
   
})

userSchema.plugin(passportLocalMongoose)

module.exports= mongoose.model('User',userSchema)
