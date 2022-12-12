const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroceriesSchema = new Schema({
    name: {type: String,
           required: true},
    image:[{
        url:String,
        filename:String
    }
    ],
    category:  {type: String,
           required: true},
    description:  {type: String,
            required: true},
    stock: [
        {
            image:[{url:String,filename:String}],
          /**  image:{type: String,required:true},*/
            qty : {type: String,required:true},
             price: {type: Number,required:true},
             avbqty :{type: String,required:true}
        }
    ]
});

module.exports = mongoose.model('Groceries',GroceriesSchema);