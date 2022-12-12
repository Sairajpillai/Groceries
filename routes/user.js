const express = require('express')
const router=express.Router();
const mongoose = require('mongoose');
const User=require('../models/user')
const Groceries = require('../models/groceries');
const Cart = require('../models/cart')
const passport = require('passport')
var nodemailer = require('nodemailer');
var ageCalculator = require('age-calculator');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
let {AgeFromDateString, AgeFromDate} = require('age-calculator');
const {isLoggedIn} = require('../middleware');
const {userRegisterSchema,userRegisterSchemaOTP,userPasswordReset,userOrder,userCard,review} = require('../schema');
const user = require('../controllers/user')


const validateRegister =(req,res,next)=>{ 
  const {error} = userRegisterSchema.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}

const validateRegisterOTP =(req,res,next)=>{ 
  const {error} = userRegisterSchemaOTP.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}

const validateResetPassword =(req,res,next)=>{ 
  const {error} = userPasswordReset.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}

const validateUserOrder =(req,res,next)=>{ 
  const {error} = userOrder.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}

const validateUserCard =(req,res,next)=>{ 
  const {error} = userCard.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}

const validateReview =(req,res,next)=>{ 
  const {error} = review.validate(req.body);
  if(error){
      const msg = error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg,404)
  }else{
      next();
  }
}


router.get('/userRegister',(req,res)=>{
    res.render('./user/register')
})

function gennum(){
    otp= Math.floor(Math.random() * 100000) + 1;
    }
    router.post('/register',validateRegister,catchAsync(async(req,res,next)=>{
        const {email,username,password}=req.body;
       
        try{
            gennum();
            console.log(otp);
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_ID,
                  pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                  rejectUnauthorized: false
              }
              });
              
              var mailOptions = {
                from: process.env.EMAIL_ID,
                to: `${email}`,
                subject: 'OTP for Registration in Groceries!',
                text: `${otp}`
              };
              
             transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  
                 
                } else {
                  
                  
                }
              });
             
        }catch(e){
            console.log(e);
    
        }
        
      
       res.render('./user/otpver',{otp,email,username,password});
    }))
    gennum();
  
    router.post('/verRegister',validateRegisterOTP,catchAsync(async(req,res,next)=>{
        const {email,username,password,verotp,contact,dob} = req.body;
        const{drname,door,street,landmark,pincode,state,city} = req.body.address;
    
        const uage=dob.toString();
        let ageval = new AgeFromDateString(uage).age;
       
        if(ageval>=18){

       
        
            const user = new User({email,username,contact,dob});
       const registeredUser = await User.register(user,password); 
        
        const addaddress = await User.updateOne({"_id":user._id},{$push:{address:{$each:[{"name":drname,"door":door,"street":street,"landmark":landmark,"city":city,"state":state,"pincode":pincode}]}}}); 
       
       req.login(registeredUser,err=>{
         if (err) return next(err);
         req.flash('success','Successfully Registered!')
         res.redirect('./user/userHome')
       })
  }
        else{
          req.flash('error','Age must be greater than or equal to 18!')
          res.redirect('/userRegister')
        }
    
    }))


    router.get('/changePassword',isLoggedIn,(req,res)=>{
        res.render('./user/changePassword');
      })


      router.post('/changePasswordS1',isLoggedIn,catchAsync(async(req,res,next)=>{
        const uemail=req.body.email;
        let user = await User.findOne({email:uemail})
        
        User.findOne({email:uemail}).then(function(sanitizedUser){
          if (sanitizedUser){
            try{
              gennum();
              console.log(otp);
              var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                  },
                  tls: {
                    rejectUnauthorized: false
                }
                });
                
                var mailOptions = {
                  from: process.env.EMAIL_ID,
                  to: `${uemail}`,
                  subject: 'OTP for Password Change!',
                  text: `${otp},${user.username}`
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                res.render('./user/cPassVerOtp',{uemail});
          }catch(e){
              console.log(e);
      
          }
          }else{
            req.flash('error','User Does Not Exist!')
            res.redirect('/changePassword')
          }
        })
      }))
      
      router.post('/verotpcpass',validateResetPassword,isLoggedIn,catchAsync(async(req,res,next)=>{
        const cpotp=req.body.cpotp;
        const uemail=req.body.email;
        const npass=req.body.npass;
      
        User.findOne({email:uemail}).then(function(sanitizedUser){
          if (sanitizedUser){
            sanitizedUser.setPassword(npass, function(){
                sanitizedUser.save();
               
                req.flash('success','Successfully changed Password!')
       res.redirect('./user/userHome')
            });
        } else {
          req.flash('error','User Does Not Exist!')
          res.redirect('/changePassword')
        }
      },function(err){
        console.error(err);
      })
     
      
      }))


      

      router.get('/forgotPassword',(req,res)=>{
        res.render('./user/forgotPassword');
      })


      router.post('/forgotPasswordS1',catchAsync(async(req,res,next)=>{
        const uemail=req.body.email;
        User.findOne({email:uemail}).then(function(sanitizedUser){
         
          if (sanitizedUser){
            try{
              gennum();
              console.log(otp);
              var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                  },
                  tls: {
                    rejectUnauthorized: false
                }
                });
                
                var mailOptions = {
                  from: process.env.EMAIL_ID,
                  to: `${uemail}`,
                  subject: 'OTP for Forget Password!',
                  text: `${otp}`
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                res.render('./user/verfPass',{uemail});
          }catch(e){
              console.log(e);
      
          }
          }else{
            req.flash('error','User Does Not Exist!')
            res.redirect('/forgotPassword')
          }
        })
      }))
      
      router.post('/forPassOtp',validateResetPassword,catchAsync(async(req,res,next)=>{
        const cpotp=req.body.cpotp;
        const uemail=req.body.email;
        const npass=req.body.npass;
     
        User.findOne({email:uemail}).then(function(sanitizedUser){
          if (sanitizedUser){
            sanitizedUser.setPassword(npass, function(){
                sanitizedUser.save();
               
                req.flash('success','Successfully changed Password!')
       res.redirect('/login')
            });
        } else {
          req.flash('error','User Does Not Exist!')
          res.redirect('/forgotPassword')
        }
      },function(err){
        console.error(err);
   
      
      }))

router.get('/login',user.getLogin)

router.post('/login',passport.authenticate('local',{failureFlash: 'Invalid username or password.',failureRedirect:'/login'}),user.postLogin) 

router.get('/user/userHome',isLoggedIn,user.homePage)

router.get('/user/userCategories',isLoggedIn,catchAsync(user.categories))

router.get('/user/categories/:cat',isLoggedIn,catchAsync(user.catCategories))



    router.get('/user/categories/:category/:id',isLoggedIn,catchAsync(user.cartCheck))
   
   router.post('/user/categories/:id/cart/:pid',isLoggedIn,catchAsync(user.addToCart));

      router.delete('/user/removeFromCart/:gid/:pid/:category',isLoggedIn,catchAsync(user.removeFromCart))

      router.get('/cartPriceCheck',isLoggedIn,catchAsync(user.cartPriceCheck))

      router.get('/user/order',isLoggedIn,user.getOrder)

        router.post('/order',isLoggedIn,validateUserOrder,catchAsync(user.postOrder))
        
        router.post('/orderConfirm',isLoggedIn,validateUserCard,catchAsync(user.orderConfirm))
        

      router.post('/user/finalOrderPage',isLoggedIn,catchAsync(async(req,res)=>{
        let userId = req.body.userId;
        let cartId = req.body.cartId;
        let user = await User.findById(userId);
        let cart =await Cart.findById(cartId);
        let delArr = ["Order Id:"+cart._id+" "+"Amount:"+cart.totalAmount+" "+"Delivery Date:"+cart.ddate]
        try{
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
        }
        });
        
        var mailOptions = {
          from: process.env.EMAIL_ID,
          to: `${user.email}`,
          subject: 'OTP for Order Summary!',
          text: `${delArr}`
        };
        
       transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
           
          } else {
            console.log('Email sent: ' + info.response);
            
          }
        });
       
  }catch(e){
      console.log(e);

  }
  
  req.flash('error','Some Prducts might be removed according to their availability!')
 res.redirect('/user/userHome');
      }))

      router.get('/viewOrders',isLoggedIn,user.viewOrders)
      
      router.post('/user/order/orderSummary',isLoggedIn,catchAsync(user.orderSummary))

      router.post('/user/:orderid/review',isLoggedIn,validateReview,catchAsync(user.review))

      router.get('/account',isLoggedIn,async(req,res)=>{
        const userId = req.user._id;
        let user = await User.findById(userId);
       res.render('./user/account',{user})
      })

      router.put('/updateProfile',isLoggedIn,async(req,res)=>{
        const userId = req.user._id;
        let {uname,uemail,ucnum,udob} =  {...req.body}
        const updateProfile = await User.updateOne({"_id":userId},{$set:{"name":uname,"email":uemail,"contact":ucnum}});
        req.flash("success","Successfully Updated Profile!");
        res.redirect('/account');
       
      })
      router.delete('/deleteUser',isLoggedIn,async(req,res)=>{
        const userId = req.user._id;
        let res1 = await User.findByIdAndDelete(userId)
        console.log(res1);
        req.logout();
    req.flash("success","Successfully Deleted Account!")
    res.redirect('/login')
      })

      router.get('/logout',user.logout)

module.exports=router;