const express  = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {specificEditSchema,addGrocerySchema} = require('../schema');
const Groceries = require('../models/groceries');
const {isAdminLoggedIn} = require('../adminMiddleware');
const cgroceries = require('../controllers/stock')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

const validateSpecificEdit =(req,res,next)=>{ 
    const {error} = specificEditSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,404)
    }else{
        next();
    }
}

const validateAddGrocery =(req,res,next)=>{ 
    const {error} = addGrocerySchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,404)
    }else{
        next();
    }
}


router.post('/:id/:eleid',isAdminLoggedIn,catchAsync(cgroceries.proEdit))


router.put('/:gid/edit/:stockid',isAdminLoggedIn,upload.array('image'),validateSpecificEdit,catchAsync(cgroceries.proPutEdit))


router.get('/:id/stockadd',isAdminLoggedIn,catchAsync(cgroceries.addStock))


router.put('/:id/addGroStock',upload.array('image'),isAdminLoggedIn,validateAddGrocery,catchAsync(cgroceries.groAddStock))

router.delete('/:id/stock/:sid',isAdminLoggedIn,catchAsync(cgroceries.deleteStock))

module.exports = router;