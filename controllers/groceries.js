const Groceries = require('../models/groceries');

module.exports.index =  async (req,res) => {
    const groceries = await Groceries.find({}).populate('stock');
    const groceries1 = await Groceries.find({});
    console.log(groceries1)
    for(let grocery of groceries1){
        console.log(grocery.image)
    }
  
    res.render('groceriesall/index',{groceries});
}

module.exports.viewCategories = async(req,res)=>{
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
    res.render('groceriesall/groceryCategory',{elenew})
}

module.exports.viewCategoriesProducts = async(req,res)=>{
    const catgry=req.params.cat;
    const groCatgry = await Groceries.find({category:catgry})
    console.log(groCatgry);
    res.render('groceriesall/Kitchen-Essentials',{groCatgry})
}

module.exports.newGroceriesRenderPage = (req,res) => {
    res.render('groceriesall/new');
}

module.exports.addNewGrocery = async(req,res) => {
    const grocery = new Groceries(req.body.Gro);
    grocery.image = req.files.map(f =>({url:f.path,filename:f.filename}))
    await grocery.save();
    console.log(grocery)
    req.flash('success','Successfully added Grocery!')
    res.redirect('/groceries')
}

module.exports.viewProducts =  async(req,res) => {
    const grocery = await Groceries.findById(req.params.id).populate('stock')
    if(!grocery){
        req.flash('error','Cannot found Grocery!')
        return res.redirect('/groceries');
    }
    res.render('groceriesall/specific',{grocery});
}

module.exports.editProduct = async(req,res) => {
    const grocery = req.params.id;
    const grocer  = await Groceries.findById(grocery);
    if(!grocer){
        req.flash('error','Cannot found Grocery!')
        return res.redirect('/groceries');
    }
    console.log(grocer);
    res.render('groceriesall/gromainedit',{grocery,grocer})
}

module.exports.editMainGrocery = async(req,res,next) =>{
    const {name,image,category,description}={...req.body};
    const grocery1 = await Groceries.updateOne({"_id":req.params.id},{$set:{"name":name,"image":req.files.map(f =>({url:f.path,filename:f.filename})),"category":category,"description":description}})
    const grocery = await Groceries.findById(req.params.id).populate('stock')
    const grocer = req.params.id;
    console.log(grocer);
    req.flash('success','Successfully edited Grocery!')
    res.redirect(`/groceries/${grocer}`);    
}

module.exports.deleteMainGrocery = async(req,res) =>{
    const id=req.params.id;
    const delgro = await Groceries.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Grocery!')
    res.redirect('/groceries');
}