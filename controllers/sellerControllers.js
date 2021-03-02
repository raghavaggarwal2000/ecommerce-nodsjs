const Seller = require('../model/seller');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const Product = require('../model/product');
const bcrypt = require('bcrypt');
const adminType = require('../model/admin');
const nodemailer = require('nodemailer');


const random = (low,high) => Math.random() * (high-low) +low;

 const getSellerID = (token) => {
    let sellerID;
  jwt.verify(token,'Ecommerce secret', async (err,decode)=>{
    if(err){
      console.log('input',err);
      sellerID =err;
    }else{
      sellerID = decode.id;
    }
  });
      return sellerID;
}
module.exports.seller = (req,res) =>res.render('sellerindex',{title:"Seller"});

module.exports.sellerProfile_get = async (req,res) =>{

res.render('sellerProfile',{title: 'Profile'});
};
module.exports.sellerOrder_get = async (req,res) =>{  
  let count,orders = new Array(),products = new Array(),i=0,users = new Array();
  const token = req.cookies.seller;
  const sellerID = getSellerID(token);
  const seller = await Seller.findById(sellerID);
  count = seller.sold.length;
  for(i = 0; i < count; i++){
    orders[i] = seller.sold[i];
    products[i] = await Product.findById(orders[i].productID);
  }

  res.render('sellerOrders',{title:'Orders',count,orders,products}); 
};


module.exports.productInput_get = async (req,res)=>{
  const types = await adminType.find();
  
    res.render('productinput',{title:'Products Input',types});
}; 
module.exports.productDetails_get = (req,res) =>{
  const id = req.params.id;

  Product.findById(id)
  .then(result => {
    res.render('sellerProductDetails',{title:'Product Details', details: result})
  })
  .catch(err => console.log(err));
};
module.exports.allProducts_get = async (req,res) =>{
  let neww, arr= new Array(), products = new Array(),count = 0;  
  const token = req.cookies.seller;
    const sellerID = getSellerID(token);
 
  const details = await Seller.findById(sellerID);

details.products.forEach(data => {
  products[count] = data;

  count++;
});
//console.log(products);
 
//  for(let i = 0; i < count; i++){
//     console.log(i);
//  }

 for(let i = 0; i < count; i++){

  arr[i] = await Product.findById(products[i].productID);
       console.log(arr[i]);
     //   console.log(arr[i]);          
 }
 res.render('sellerAllProduct',{title:'All Products', products : arr});
      
    
 };

//seller Profile update routes

module.exports.changeName_post = async (req,res) =>{
  const {namee, lastName} = req.body;
  const token = req.cookies.seller;
  const id = getSellerID(token);

   Seller.findByIdAndUpdate(id,{name:namee,lastName} , (err,result) =>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
    }
  });
res.redirect('/sellerProfile');
};

module.exports.changePhone_post = async (req,res) =>{
  const {phone} = req.body;
  const token = req.cookies.seller;
  const id = getSellerID(token);
  if(phone.length <= 9){
    errors = "Length should be 10 digits";
    res.status(404).json({errors});
  }
 await Seller.findOne({phone}, async (err,result) =>{
    if(err){
      console.log(err);
    }else{
      if(result == null){
        const update = await Seller.findByIdAndUpdate(id,{phone});
        res.status(201).json({seller: id});
       }else{
         const errors = "This phone number already exist";
         res.status(404).json({errors});
       }
    }
  });

  };

  module.exports.sendOTPEmail_post = async (req,res) =>{
  const {email} = req.body;
  const token = req.cookies.seller;
  const id = getSellerID(token);

  const check = await Seller.findOne({email});

  if(check == null){
             const otp = Math.round(random(1000,9999));
     var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'mailsender1504@gmail.com',
                  pass: 'googletalk1'
                }
              });
              
              var mailOptions = {
                from: 'mailsender1504@gmail.com',
                to: `${email}`,
                subject: 'OTP',
                text: `${otp}`
                // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                 
                  console.log('Email sent: ' + info.response);
                  res.status(201).json({otp});
                }
              });
  }else{
    const errors = "This email already exist";
    res.status(404).json({errors});
  }
};

  module.exports.changeEmail_post = async (req,res) =>{
    const {email} = req.body;
    const token = req.cookies.seller;
  const id = getSellerID(token);
 const update = await Seller.findByIdAndUpdate(id,{email});
   res.status(201).json({id});
  };

  module.exports.changeAddress_post = async (req,res) =>{
    const {address} = req.body;
        const token = req.cookies.seller;
  const id = getSellerID(token);
   const update = await Seller.findByIdAndUpdate(id,{address});
   res.redirect('/sellerProfile');
  };

  module.exports.changePassword_post = async(req,res) =>{
    const {password,new_pass} = req.body;
    const token = req.cookies.seller;
    const id = getSellerID(token);
    const data = await Seller.findById(id);
try{

  const email = data.email;
  const seller = await Seller.login(email,password);
  const salt = await bcrypt.genSalt();
console.log(salt);
 bcrypt.hash(new_pass,salt, async (err,hash) =>{
  if(err){
    console.log(err);
  }
  if(hash){

    const ab = await Seller.findByIdAndUpdate(id,{password: hash});
res.status(201).json({seller : id});
  }
});   
}catch(err){
  console.log(err);
  if(err.message == "incorrect password"){
    errors = err.message;
   res.status(201).json({errors});
  }  
}
  };