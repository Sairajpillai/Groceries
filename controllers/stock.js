const Groceries = require('../models/groceries');

module.exports.proEdit = async(req,res)=>{
    const abc={...req.body};
    console.log(abc)
    const gid=req.params.id;
    res.render('groceriesall/groceryedit',{abc,gid});
}

module.exports.proPutEdit = async(req,res,next)=>{
    const {EleID,QTY,gid,GroceryID,PRICE,AVBQTY,image}= {...req.body}
    console.log(GroceryID);
     const grocerUpdated = await Groceries.updateMany({"_id": GroceryID ,"stock._id":EleID},{$set:{"stock.$.image":req.files.map(f =>({url:f.path,filename:f.filename})),"stock.$.qty":QTY,"stock.$.price":PRICE,"stock.$.avbqty":AVBQTY}})
     const grocery =  await Groceries.findById(GroceryID).populate('stock');
     console.log(grocerUpdated);
     req.flash('success','Successfully edited Stock!')
     res.redirect(`/groceries/${GroceryID}`);
 }

 module.exports.addStock = async(req,res) =>{
    const said = req.params.id;
    res.render('groceriesall/product',{said});
}

module.exports.groAddStock = async(req,res,next)=>{
    const {groceryid,qty,price,avbqty,image} = {...req.body}
    const stock = await Groceries.updateOne({"_id":groceryid},{$push:{stock:{$each:[{"image":req.files.map(f =>({url:f.path,filename:f.filename})),"qty":qty,"price":price,"avbqty":avbqty}]}}});
    const grocery =  await Groceries.findById(groceryid).populate('stock');
    req.flash('success','Successfully added Stock!')
   res.redirect(`/groceries/${groceryid}`);
}

module.exports.deleteStock = async(req,res) => {
    const id=req.params.id;
    const sid=req.params.sid;
    console.log(sid,id);
    const delstock = await Groceries.updateOne({"_id":id},{$pull:{stock:{"_id":sid}}})
    const grocery = await Groceries.findById(id);
    req.flash('success','Successfully deleted Stock!')
    res.redirect(`/groceries/${id}`);
    }