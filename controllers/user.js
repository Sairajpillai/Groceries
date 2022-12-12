const Groceries = require('../models/groceries');
const Cart = require('../models/cart')
const User = require('../models/user')
const mongoose = require('mongoose');

module.exports.getLogin = (req,res)=>{
    res.render('./user/login');
    }

module.exports.postLogin = (req,res)=>{
    req.flash('success','Successfully Logged In!');
    const redirectUrl = req.session.returnTo || './user/userHome';
    delete req.session.returnTo; 
    res.redirect(redirectUrl);
    }

module.exports.homePage = async(req,res)=>{
    const groceries = await Groceries.find({}).populate('stock'); 
    let grocery = await Groceries.find({}).populate('image');
    
    res.render('user/userHome',{groceries})
}

module.exports.categories = async(req,res)=>{
    const groceries = await Groceries.find({});
    let ele=[];
    for(let cat of groceries){
       ele.push(cat.category);
    }
    function removeDuplicates(data){
      return data.filter((value,index)=>data.indexOf(value)===index);
    }
   let elenew = removeDuplicates(ele);
    console.log(elenew);
    res.render('user/productCategories',{elenew})
  }

module.exports.catCategories = async(req,res)=>{
    const catgry=req.params.cat;
    const groCatgry = await Groceries.find({category:catgry})
    console.log(groCatgry);
    res.render('user/categories/Kitchen-Essentials',{groCatgry})
  }

module.exports.cartCheck = async(req,res)=>{
    const userId = req.user._id;
    let status = "Unordered";
    let cart = await Cart.findOne({ userId,status });
  
    if(cart){
      const grocery = await Groceries.findById(req.params.id).populate('stock')
      res.render('user/categories/userCart',{grocery,cart})
  
    }else{
      const grocery = await Groceries.findById(req.params.id).populate('stock')
      res.render('user/categories/productTest',{grocery})
    }
  }

module.exports.addToCart =  async (req, res) => {
     
    const quantity = req.body.qty;
    const groceryId = req.params.id;
    const productId = req.params.pid;
    let category = req.body.category;
    let price = req.body.price;
    let name = req.body.name;
    let image = req.body.image;
    console.log(image)
    let avbqty = req.body.avbqty;
    if(parseInt(avbqty)<parseInt(quantity)){
     
      req.flash('error',`Only ${avbqty} available`)
      res.redirect(`/user/categories/${category}/${groceryId}`)
    }else{
    
   let qty = parseInt(quantity);
   let cprice = parseInt(price);
   let tprice = qty*cprice;
   const userId = req.user._id;
    let status = "Unordered";
    try {
    
     let cart = await Cart.findOne({ userId,status });
     
     console.log(cart);
  
      if (cart ) {
      
        let itemIndex = await cart.products.findIndex(p => p.productId == productId);
  
        if (itemIndex > -1) {
        
          let productItem = await cart.products[itemIndex];
          console.log(productItem);
          productItem.quantity = quantity;
          productItem.tprice = quantity*price;
          cart.products[itemIndex] = productItem;
          let tamount = await Cart.aggregate([{$match:{"status":"Unordered"}},{"$project":{"status":1,"total":{"$sum":"$products.tprice"}}}])
          let camount = parseInt(tamount[0].total)
          let aupdate = await Cart.updateOne({"_id":cart._id},{$set:{"totalAmount":camount}})
        } else {
         
          cart.products.push({ groceryId,productId, quantity,name,tprice,image,category });
          tamount = await Cart.aggregate([{$match:{"status":"Unordered"}},{"$project":{"status":1,"total":{"$sum":"$products.tprice"}}}])
       
      
      camount = parseInt(tamount[0].total)
          aupdate = await Cart.updateOne({"_id":cart._id},{$set:{"totalAmount":camount}})}
      
        
        cart = await cart.save();
     
        res.redirect(`/user/categories/${category}/${groceryId}`)
      } else{
      
        let status="Unordered";
        let totalAmount = 0;
        const cart = await Cart.create({
         
          userId,
          products: [{ groceryId,productId, quantity,name,tprice,image,category }],
          totalAmount,
          status
          
        });
         tamount = await Cart.aggregate([{$match:{"status":"Unordered"}},{"$project":{"status":1,"total":{"$sum":"$products.tprice"}}}])
        console.log(tamount[0].total)
         camount = parseInt(tamount[0].total)
         aupdate = await Cart.updateOne({"_id":cart._id},{$set:{"totalAmount":camount}})
       
        res.redirect(`/user/categories/${category}/${groceryId}`)
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  }
}

module.exports.removeFromCart = async(req,res)=>{
   
     const userId = req.user._id;
     let status = "Unordered";
     let category = req.params.category;
     let groceryId = req.params.gid;
     let pid = req.params.pid;
     let delpro = await Cart.findOne({userId,status})
     const delprod = await Cart.updateOne({"_id":delpro._id},{$pull:{products:{"productId":pid}}})
     res.redirect(`/user/categories/${category}/${groceryId}`)
   }

module.exports.cartPriceCheck = async(req,res)=>{
   
    const userId = req.user._id;
     status = "Unordered"
     let cart =  await Cart.findOne({ userId,status });
     if(!cart){
       req.flash('error','Cart is Empty!')
       res.redirect('/user/userHome')
     }
     let tamount = await Cart.aggregate([{$match:{"userId":mongoose.Types.ObjectId(userId),"status":"Unordered"}},{"$project":{"status":1,"total":{"$sum":"$products.tprice"}}}])
  
let arr = [0];
for(let ele of cart.products){
     let cartUpd = await Groceries.findOne({"stock._id":ele.productId})
     for(let element of cartUpd.stock){
       if(ele.productId==element._id){
        console.log(element)
         if(element.avbqty==0){
           const stock = await Cart.updateOne({"_id":cart._id},{$push:{outOfStock:{$each:[{"groceryId":ele.groceryId,"productId":ele.productId,"name":ele.name,"quantity":ele.quantity,"tprice":ele.tprice,"image":ele.image,"category":ele.category}]}}});
           console.log(stock)
          
          const delprod = await Cart.updateOne({"_id":cart._id},{$pull:{products:{"productId":ele.productId}}})
          res.redirect('/cartPriceCheck')
         }else if(ele.quantity>element.avbqty){
           let dif = ele.quantity-element.avbqty
          

           let itemIndex = await cart.products.findIndex(p => p.productId == ele.productId);
   
         if (itemIndex > -1) {
         
           let productItem = await cart.products[itemIndex];
           console.log(productItem);
          
           productItem.tprice = ele.tprice/ele.quantity;
           productItem.quantity = dif;
           cart.products[itemIndex] = productItem;
           cart.save()
           res.redirect('/cartPriceCheck')
         }
         }
       }
     }
   }

for(let ele of cart.products){
for(let element of cart.outOfStock){
 if(ele.productId==element.productId){
   const delstock = await Cart.updateOne({"_id":cart._id},{$pull:{outOfStock:{"productId":element.productId}}})
   res.redirect('/cartPriceCheck')
 }
}
}



let amount = tamount[0].total
let updAmount = await Cart.updateOne({"_id":cart._id},{$set:{"totalAmount":amount}})
console.log(updAmount)
if(amount==0){
 req.flash('error','Cart is Empty!')
       res.redirect('/user/userHome')
}else{
res.render('user/categories/cartCheckout',{amount,cart,arr})
}
   }

module.exports.getOrder = async(req,res)=>{
    res.render('user/order');
    }

module.exports.postOrder = async(req,res)=>{
    
    const userId = req.user._id;
    status = "Unordered"
    let cart =  await Cart.findOne({ userId,status });
    //Testing

   
for(let ele of cart.products){
  let cartUpd = await Groceries.findOne({"stock._id":ele.productId})
  for(let element of cartUpd.stock){
    if(ele.productId==element._id){
      let diff = parseInt(element.avbqty)-parseInt(ele.quantity);
       if(diff<0){
        const stock = await Cart.updateOne({"_id":cart._id},{$push:{outOfStock:{$each:[{"groceryId":ele.groceryId,"productId":ele.productId,"name":ele.name,"quantity":ele.quantity,"tprice":ele.tprice,"image":ele.image,"category":ele.category}]}}});
        const delprod = await Cart.updateOne({"_id":cart._id},{$pull:{products:{"productId":ele.productId}}})
        
       }
       else{
        const grocerUpdated = await Groceries.updateOne({"_id": ele.groceryId ,"stock._id":element._id},{$set:{"stock.$.avbqty":diff}})
        
       }

    }
  }
}
let tamount = await Cart.aggregate([{$match:{"userId":mongoose.Types.ObjectId(userId),"status":"Unordered"}},{"$project":{"status":1,"total":{"$sum":"$products.tprice"}}}])
let amount = tamount[0].total
let updAmount = await Cart.updateOne({"_id":cart._id},{$set:{"totalAmount":amount}})
console.log(updAmount)
if(amount==0){
  req.flash('error','Cart is Empty!')
        res.redirect('/user/userHome')
}else{


   
    let {name,door,street,landmark,city,state,pincode} = req.body.oadd;
      let ptype = req.body.slct;
  let todayDate = new Date().toISOString().slice(0, 10);
      const d = new Date();
     d.setDate(d.getDate() + 7);
      const addDelAddress = await Cart.updateOne({"_id":cart._id},{$set:{daddress:{"name":name,"door":door,"street":street,"landmark":landmark,"city":city,"state":state,"pincode":pincode}}})
      console.log(addDelAddress);
    
      if(ptype==="COD"){
        let cart1 =  await Cart.findOne({ userId,status });
       if(cart1.card){
        const delprod = await Cart.updateOne({"_id":cart1._id},{$unset:{card:""}})
        const addDelAddress = await Cart.updateOne({"_id":cart._id},{$set:{"paytype":ptype,"bdate":todayDate,"ddate": d.toISOString().slice(0, 10)}})
        let cart2 =  await Cart.findOne({ userId,status });
        
        upStatus = "Ordered";
        let updCart = await Cart.updateOne({"_id":cart._id},{$set:{"status":upStatus}})
        res.render('user/finalAcknowledgement',{cart2})
      }else{
        const addDelAddress = await Cart.updateOne({"_id":cart._id},{$set:{"paytype":ptype,"bdate":todayDate,"ddate": d.toISOString().slice(0, 10)}})
        let cart2 =  await Cart.findOne({ userId,status });
     
        upStatus = "Ordered"; 
        let updCart = await Cart.updateOne({"_id":cart._id},{$set:{"status":upStatus}})
        res.render('user/finalAcknowledgement',{cart2})}
      }else{
        const addDelAddress = await Cart.updateOne({"_id":cart._id},{$set:{"paytype":ptype,"bdate":todayDate,"ddate": d.toISOString().slice(0, 10)}})
  res.render('user/oOrder.ejs')
      }

    }
  }

module.exports.orderConfirm = async(req,res)=>{
    const userId = req.user._id;
     status = "Unordered"
     let cart =  await Cart.findOne({ userId,status });
     let {cardname,cardnumber,expmonth,expyear,cvv} = req.body;
     const confirmOrder = await Cart.updateOne({"_id":cart._id},{$set:{card:{"name":cardname,"cardNo":cardnumber,"expiryMonth":expmonth,"expiryYear":expyear}}})
     let cart2 =  await Cart.findOne({ userId,status });
      //new Updated
     upStatus = "Ordered";
     let updCart = await Cart.updateOne({"_id":cart._id},{$set:{"status":upStatus}})
     res.render('user/finalAcknowledgement',{cart2})
   }

module.exports.viewOrders = async(req,res)=>{
    const userId = req.user._id;
     status = "Ordered"
     let cart = await Cart.find({userId,status})
     
     res.render('user/orderView',{cart})
   }

module.exports.orderSummary = async(req,res)=>{
    let cartId = req.body.productId;
    let cart =  await Cart.findById(cartId);
    res.render('user/specificOrder',{cart})
  }

  module.exports.review = async(req,res)=>{
    let cartId = req.params.orderid;
    let {rating,body}=req.body.review; 
    const confirmOrder = await Cart.updateOne({"_id":cartId},{$set:{ratings:{"nstars":rating,"description":body}}})
    let cart =  await Cart.findById(cartId);
    res.render('user/specificOrder',{cart})
  }

  
  module.exports.logout = (req,res)=>{
    req.logout();
    req.flash("success","Successfully logged Out!")
    res.redirect('/login')
  }