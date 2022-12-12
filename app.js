if(process.env.NODE_ENV!=="production"){
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const groceries = require('./routes/groceries');
const stock = require('./routes/stock');
const Groceries = require('./models/groceries');
const passport = require('passport');
const localStrategy = require('passport-local')
const User = require('./models/user')
const Order = require('./models/order')
const userRoutes = require('./routes/user')
const Cart = require('./models/cart')
const {isAdminLoggedIn} = require('./adminMiddleware');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/groceries-all'
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
  replaceWith: '_',
}));

const secret = process.env.SECRET || 'thishouldbeabettersecret!'

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});


store.on("error",function(e){
  console.log(e)
})

const sessionConfig = {
  store,
  name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())





app.use(passport.initialize());
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/groceries',groceries);
app.use('/groceries',stock);
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    res.render('Home')
})


app.get('/showOrders/',isAdminLoggedIn, function(req, res) {
  var perPage =10;
    var page = req.params.page || 1;

  Cart.find({})
           .skip((perPage * page) - perPage)
           .limit(perPage).exec(function(err,data){
                if(err) throw err;
          Cart.countDocuments({}).exec((err,count)=>{          
  res.render('showProducts', { records: data,
  current: page,
  pages: Math.ceil(count / perPage) });
  
});
  });
  
});

app.get('/showOrders/:page',isAdminLoggedIn, function(req, res) {
  var perPage = 10;
    var page = req.params.page || 1;

  Cart.find({})
           .skip((perPage * page) - perPage)
           .limit(perPage).exec(function(err,data){
                if(err) throw err;
          Cart.countDocuments({}).exec((err,count)=>{          
  res.render('showProducts', { records: data,
  current: page,
  pages: Math.ceil(count / perPage) });
  
});
  });
  
});


app.get("/productSearch", async(req, res)=>{
  var noMatch = null;
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
     
      let gro = await Groceries.find({name: regex});
      Groceries.find({name: regex}, async(err, products)=>{
         if(err){
             console.log(err);
         } else {
            if(products.length < 1) {
                noMatch = "No products match that query, please try again.";
                req.flash("error",`${noMatch}`);
                res.redirect('/user/userHome')
            }else{
              let proId = await products[0]._id;
              let proCat = await products[0].category;
              res.redirect(`/user/categories/${proCat}/${proId}`)

            }
            
         }
      });
});


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get("/adminProductSearch", async(req, res)=>{
  var noMatch = null;
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    
      let gro = await Groceries.find({name: regex});
      Groceries.find({name: regex}, async(err, products)=>{
         if(err){
             console.log(err);
         } else {
            if(products.length < 1) {
                noMatch = "No products match that query, please try again.";
                req.flash("error",`${noMatch}`);
                res.redirect('/user/userHome')
            }else{
              let proId = await products[0]._id;
              let proCat = await products[0].category;
              res.redirect(`/groceries/${proId}`)

            }
            
         }
      });
});


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.all('*',(req,res,next) => {
    next(new ExpressError('Page Not Found!',404))
})

app.use((err,req,res,next) => {
   const{statusCode=500}=err;
   if(!err.message) err.message="Oh No! Something Went Wrong";
   res.status(statusCode).render('error',{err});
   
})

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log("Hello from Groceries!")
})