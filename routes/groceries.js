const express  = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {groceriesSchema,editMainGrocerySchema} = require('../schema');
const Groceries = require('../models/groceries');
var nodemailer = require('nodemailer');
const {isAdminLoggedIn} = require('../adminMiddleware');
const passport = require('passport')
const cgroceries = require('../controllers/groceries')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


const validateGroceries =(req,res,next)=>{ 
    const {error} = groceriesSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,404)
    }else{
        next();
    }
}


const validateMainGroceryEdit =(req,res,next)=>{ 
    const {error} = editMainGrocerySchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,404)
    }else{
        next();
    }
}



function gennum(){
    otp= Math.floor(Math.random() * 100000) + 1;
    }
router.get('/adminLogin',async(req,res)=>{
    let email = "sairajpillai8@gmail.com"
    try{
        gennum();
        console.log(otp);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              //user: 'typroject37@gmail.com',
              ////pass: 'Pass@123'
              user:process.env.EMAIL_ID,
              pass:process.env.EMAIL_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
          }
          });
          
          var mailOptions = {
            from: process.env.EMAIL_ID,
            to: `${email}`,
            subject: 'OTP for Admin Login!',
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
res.render('groceriesall/adminLogin')
})

gennum();

 
router.post('/admin',passport.authenticate('local',{failureFlash: 'Invalid username or password.',failureRedirect:'/groceries/adminLogin'}),(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    let vernum  = process.env.ADMIN_USERNAME;
    let verp = process.env.ADMIN_PASSWORD;
    console.log(username,password,vernum,verp)
    if(vernum===username && verp===password){
        req.flash('success','Successfully Logged In!');
        const redirectUrl = req.session.returnTo || '/groceries';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }else{
        req.flash('error','Wrong credentials!')
        res.redirect('/groceries/adminLogin')
    }
    })
    
    router.get('/adminLogout',(req,res)=>{
        req.logout();
        req.flash("success","Successfully logged Out!")
        res.redirect('/groceries/adminLogin')
      })


router.get('/',isAdminLoggedIn,catchAsync(cgroceries.index))

router.get('/categories/add/view/product',isAdminLoggedIn,catchAsync(cgroceries.viewCategories))

router.get('/admin/categories/:cat',isAdminLoggedIn,cgroceries.viewCategoriesProducts)

router.get('/new',isAdminLoggedIn,catchAsync(cgroceries.newGroceriesRenderPage))



router.post('/',isAdminLoggedIn,upload.array('image'),validateGroceries,catchAsync(cgroceries.addNewGrocery))

router.get('/:id',isAdminLoggedIn,catchAsync(cgroceries.viewProducts))

router.get('/:id/editGrocery',isAdminLoggedIn,catchAsync(cgroceries.editProduct))

router.put('/:id/main/grocery/edit',isAdminLoggedIn,upload.array('image'),validateMainGroceryEdit,catchAsync(cgroceries.editMainGrocery))

router.delete('/:id',isAdminLoggedIn,catchAsync(cgroceries.deleteMainGrocery))

module.exports=router;