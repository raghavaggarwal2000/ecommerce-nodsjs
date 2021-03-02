const Product = require('../model/product');
const adminTypes = require('../model/admin');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Admin = require('../model/admin');

module.exports.product_get = async (req,res)=>{
const typeID = req.params.id;
let type, product,count;

type = await adminTypes.findById(typeID);
product = await Product.find({type:type.type});
count = product.length;
  res.render('product',{title: type.type,product,typeID,count});
 };
//  '<%=product = data.product%>'
//  console.log('<%=product%>');
 module.exports.productDetails_get = async (req,res) =>{
   let same,a,userId;
   const id = req.params.id;
   if(req.cookies.buyer){
    let token = req.cookies.buyer;
    jwt.verify(token,'Ecommerce secret',(err,decodedToken) =>{
    if(err){
      console.log(err,"err");
    }else{
      userId = decodedToken.id;
    } 
    });
    const check = await User.findById(userId);
    check.wishlist.forEach(data =>{
        // console.log(data);
        if(data.productID == id){
          same = true;       
          a = true;   
        }else{
          same = false;
        }
    });
   }else{
     same = false;
   }
    if(a){
      same = true;
    }
     
  // await adminTypes.find()
  // .then(result =>{
  //   types = result
  // })
  // .catch(err =>{
  //   console.log(err,"admin");
  // });
const details = await Product.findById(id);
  // .then(details =>{
  
    res.render('productDesc',{details,same});

  
 };
 
 // module.exports.mouse_get = async (req,res)=>{
//    const mouse = await Product.find({type: "Mouse"});

//     res.render('mouse',{title:'Mouse',mouse});
// };

module.exports.sort_post = async (req,res)=>{
const {value,typeID} = req.body;
const type = await adminTypes.findById(typeID);
let product;

switch(value){
  case "0" : res.status(201).json({refresh : true});
  break;
  case "1":  product = await Product.find({type:type.type}).sort({price: 1});
  res.status(201).json({product});
  break;
  case "2": product = await Product.find({type:type.type}).sort({price: -1});
  res.status(201).json({product});
    break;
    
  case "3": product = await Product.find({type:type.type}).sort({sold: -1});
  res.status(201).json({product});
  break;
  
  case "4": const arrival = await Product.find({type:type.type});
  const count = arrival.length;
  res.status(201).json({arrival,count});
    break;
  default:console.log("def");
};
};