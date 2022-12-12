const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.groceriesSchema = Joi.object({
    Gro:Joi.object({
        name:Joi.string().required().escapeHTML(),
       //// image:Joi.string().required(),
        category:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML()
    }).required(),
   /**  Stock:Joi.object({
        qty:Joi.string().required().min(0),
        price:Joi.number().required().min(1),
        avbqty:Joi.string().required().min(0),
        simage:Joi.string().required(),
        //image:Joi.string().required(),
    }).required() */
})

module.exports.specificEditSchema = Joi.object({
    EleID:Joi.string().required().escapeHTML(),
    QTY:Joi.string().required().escapeHTML(),
    GroceryID:Joi.string().required().escapeHTML(),
    PRICE:Joi.number().required().min(1),
  //  image:Joi.string().required(),
    AVBQTY:Joi.string().required().min(0).escapeHTML(),
})

module.exports.addGrocerySchema = Joi.object({
    groceryid:Joi.string().required().escapeHTML(),
    qty:Joi.string().required().escapeHTML(),
    avbqty:Joi.string().required().min(0),
    price:Joi.number().required().min(1),
   // image:Joi.string().required(),
})

module.exports.editMainGrocerySchema = Joi.object({
    name:Joi.string().required().escapeHTML(),
    category:Joi.string().required().escapeHTML(),
    description:Joi.string().required().escapeHTML(),
    //image:Joi.string().required(),
})

module.exports.userRegisterSchema = Joi.object({
    email:Joi.string().required().escapeHTML(),
    username:Joi.string().required().escapeHTML(),
    password:Joi.string().required().min(8),
})

module.exports.userRegisterSchemaOTP = Joi.object({
   address:Joi.object({
        drname:Joi.string().required().escapeHTML(),
        door:Joi.string().required().escapeHTML(),
        street:Joi.string().required().escapeHTML(),
       landmark:Joi.string().required().escapeHTML(),
       pincode:Joi.number().required().min(6),
       state:Joi.string().required().escapeHTML(),
       city:Joi.string().required().escapeHTML()
    }).required(),
        email:Joi.string().required().escapeHTML(),
        username:Joi.string().required().escapeHTML(),
       password:Joi.string().required().min(8),
        //verotp:Joi.string().required().escapeHTML(),
        contact:Joi.number().required().min(10),
        dob:Joi.string().required().escapeHTML()
})

module.exports.userPasswordReset = Joi.object({
    email:Joi.string().required().escapeHTML(),
   // cpotp:Joi.string().required().escapeHTML(),
    npass:Joi.string().required().escapeHTML()
})

module.exports.userOrder = Joi.object({
    slct:Joi.string().required().escapeHTML(),
    oadd:Joi.object({
        name:Joi.string().required().escapeHTML(),
        door:Joi.string().required().escapeHTML(),
        street:Joi.string().required().escapeHTML(),
        landmark:Joi.string().required().escapeHTML(),
        city:Joi.string().required().escapeHTML(),
        state:Joi.string().required().escapeHTML(),
        pincode:Joi.number().required(),
    })
})

module.exports.userCard = Joi.object({
    cardname:Joi.string().required().escapeHTML(),
    cardnumber:Joi.number().required(),
    expmonth:Joi.number().required(),
    expyear:Joi.number().required(),
    cvv:Joi.number().required()
})

module.exports.review = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        body:Joi.string().required()
    }).required()
})