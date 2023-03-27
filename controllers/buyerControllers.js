const User = require('../model/user');
const Admin = require('../model/admin');
const jwt = require('jsonwebtoken');
const Product = require('../model/product');
const Seller = require('../model/seller');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const random = (low,high) => Math.random() * (high-low) +low;

const getUserID =  (token) => {
    let userID;
   jwt.verify(token,'Ecommerce secret', async (err,decode)=>{
    if(err){
      console.log('input',err);
      userID =err;
    }else{
      userID = decode.id;
    }
  });
      return userID;
}

module.exports.feedback_get = async (req,res) =>{
res.render('feedback',{title: "Feedback"});
};
module.exports.feedback_post = async (req,res) =>{
console.log(req.body);
};

module.exports.buyerOrders_get = async (req,res) =>{
let count = 0,orders = new Array(),product = new Array(),seller = new Array();
  const token = req.cookies.buyer;
  const id = getUserID(token);

  const user = await User.findById(id);
  user.orders.forEach(data => {
    orders[count] = data;
    count++;
  });
for(let i = 0; i < count ; i++){
product[i] = await Product.findById(orders[i].productID);
seller[i] = await Seller.findById(product[i].sellerID);
}
  res.render('buyerOrders',{title: "Orders",orders,product,count,seller});
};

module.exports.buyerCart_get = async (req,res) =>{
   let count = 0,price = 0,cartID = new Array(), cart = new Array(),seller = new Array(),saveCount = 0,save = new Array(),saveID = new Array(); 
   const token = req.cookies.buyer;
const id = getUserID(token);

  const buyer = await User.findById(id);

  buyer.cart.forEach(item =>{
    count++;
    cartID.push(item);
  });
  buyer.saveLater.forEach(item =>{
saveCount++;
saveID.push(item);
  })
  for(let i = 0; i < count ; i++){
    cart[i] = await Product.findById(cartID[i].productID);
    seller[i] = await Seller.findById(cart[i].sellerID);
price = price + cart[i].price;
  }
  for(let i = 0; i < saveCount; i++){
    save[i] = await Product.findById(saveID[i].productID);
  }

    res.render('buyerCart',{title:"Cart", cart,price,seller,count,saveCount,save});
};


module.exports.buyerProfile_get = async (req,res) =>{
  const token = req.cookies.buyer;
  const id = getUserID(token);

    res.render('buyerProfile',{title:"Profile"});
};

module.exports.buyerWishList_get = async (req,res) =>{
 
    let wishlistID = new Array(),productsInfo = new Array(),count = 0;
  
    const types = await Admin.find();
    // console.log(types);
    let token = req.cookies.buyer;
    const id = getUserID(token);
    const userDetails = await User.findById(id);
    userDetails.wishlist.forEach(item =>{
        //console.log(item)
        wishlistID.push(item);
        count = count + 1;
    });
    for(let i = 0; i < count ; i++){
      productsInfo[i] = await Product.findById(wishlistID[i].productID);
    }
    // await wishlistID.forEach(async (item) =>{
    //     const data = await Product.findById(item.productID)
    //     .then(result =>{
    //       productsInfo.push(result);
    //     })
    //     .catch(err =>{
    //       console.log(err);
    //     });
    //     //   console.log(productsInfo);
    // });
  //  console.log(productsInfo);
    res.render('buyerWishList',{title:"Wishlist", wishlistID, productsInfo,count});
};

module.exports.addToWishList_post = async (req,res)=>{
const {id} = req.body;
    let token = req.cookies.buyer;
    var datetime = new Date();
  const date = datetime.toISOString().slice(0,10);

    jwt.verify(token,'Ecommerce secret' , async (err,decodedToken) =>{
        if(err){
            console.log(err.message),"addWishList";
          res.status(404).json({error:"Please Login"})
        }else{
         const user_id = decodedToken.id;
            // const check = await User.findById(user_id);
            // console.log(check.wishlist);
            // check.wishlist.forEach(data =>{
            //     // console.log(data);
            //     if(data.productID == id){
            //       res.status(401)
            //     }
            // })
            const up = await User.findOneAndUpdate({_id:user_id},{
                $addToSet:{
                 wishlist:{ 
                   productID:id,
                   date:date
                 }          
                }
            });
 
   res.status(201).json({done: user_id})
        }
      });
    };




      module.exports.removeFromWish_post = async (req,res) =>{  
        const {id} = req.body;
        let token = req.cookies.buyer;
        jwt.verify(token,'Ecommerce secret' , async (err,decodedToken) =>{
            if(err){
                console.log(err.message),"addWishList";
              res.status(404).json({error:"Please Login"})
            }else{
             const user_id = decodedToken.id;
                // const check = await User.findById(user_id);
                // console.log(check.wishlist);
                // check.wishlist.forEach(data =>{
                //     // console.log(data);
                //     if(data.productID == id){
                //       res.status(401)
                //     }
                // })
                const up = await User.findOneAndUpdate({_id:user_id},{
                    $pull:{
                     wishlist:{ 
                       productID:id,
                       }          
                    }
                });
     
       res.status(201).json({done: user_id})
            }
          });
};

module.exports.buyerCart_post = async (req,res) =>{
const {id} = req.body;
let token = req.cookies.buyer;
const userID = getUserID(token);

const up = await User.findByIdAndUpdate(userID,{
  $push:{
   cart:{ 
     productID:id,
     }          
  }
});
res.status(201).json({id: userID});
};

module.exports.moveToSaveLater_post = async(req,res) =>{
const {id} = req.body;
let token = req.cookies.buyer;
const userID = getUserID(token);
const up = await User.findByIdAndUpdate(userID,{
  $push:{
    saveLater:{ 
     productID:id,
     }          
  }
});
const del = await User.findOneAndUpdate(userID,{
  $pull:{
    cart:{ 
     productID:id,
     }          
  }
});
res.status(201).json({id: userID});
};

module.exports.removeSaveLater_post = async(req,res) =>{
  const {id} = req.body;
  let token = req.cookies.buyer;
  const userID = getUserID(token);
  const del = await User.findOneAndUpdate(userID,{
    $push:{
      cart:{ 
       productID:id,
       }          
    }
  });
  const up = await User.findByIdAndUpdate(userID,{
    $pull:{
      saveLater:{ 
       productID:id,
       }          
    }
  });

  res.status(201).json({id: userID});
};


module.exports.removeFromCart_post = async (req,res) =>{
  const {id,name} = req.body;

let token = req.cookies.buyer;
const userID = getUserID(token);
  if(name == "cart"){
    const up = await User.findByIdAndUpdate(userID,{
      $pull:{
        cart:{ 
         productID:id,
         }          
      }
    });
    
  }else if (name == "save"){
    const up = await User.findByIdAndUpdate(userID,{
      $pull:{
        saveLater:{ 
         productID:id,
         }          
      }
    });
  }else{
    res.status(404).json({errors:"Not login"})
  }

  res.status(201).json({id: userID});
};

//place order from product Description
module.exports.placeOrderDesc_post = async(req,res) =>{
  const {id,sellerID,price} = req.body;

  var datetime = new Date();
  const orderPlaceDate = datetime.toISOString().slice(0,10);

  let token = req.cookies.buyer;
  const userid = getUserID(token);

  const user = await User.findById(userid);
  if(user.address == null){
    res.status(404).json({redirect});
  }

const seller = await Seller.findByIdAndUpdate(sellerID,{
  $push:{
    sold:{
      productID : id,
      date:orderPlaceDate,
      price,
      buyerAddress: user.address
    }
  }
});
const userUpdate = await User.findByIdAndUpdate(userid,{
  $push:{
    orders:{
      productID : id,
      date:orderPlaceDate,
      price
    }
  }
});

const product = await Product.findById(id);
const profit = product.profit + product.price;
const sellerA = await Seller.findById(sellerID);
const sellerProfit = product.price + sellerA.profit;
const a = await Seller.findByIdAndUpdate(sellerID,{profit:sellerProfit});
const sold = product.sold + 1;
const productUpdate = await Product.findByIdAndUpdate(id,{profit:profit,sold:sold});
const p = await Product.findByIdAndUpdate(id,{
  $push:{
    purchaseBy:{userID:userid}
  }
});
res.status(201).json({id});
};

//place order from cart
module.exports.placeOrderCart_post = async (req,res) =>{
const {count} = req.body;
var datetime = new Date();
const orderPlaceDate = datetime.toISOString().slice(0,10);
let token = req.cookies.buyer;
const id = getUserID(token);
const user = await User.findById(id);
if(user.address == null){
  res.status(404).json({redirect});
}
// var future = new Date(); // get today date
// future.setDate(future.getDate() + 7); // add 7 days
// var finalDate = future.getFullYear() +'-'+ ((future.getMonth() + 1) < 10 ? '0' : '') + (future.getMonth() + 1) +'-'+ future.getDate();
// console.log(finalDate);
// const a = datetime.setDate(new Date().getDate() + 7);
// console.log(a);
// console.log(new Date(new Date().setDate(new Date().getDate() + 7)).slice(0,10));
for(let i = 0; i<count ;i++){
const productID = user.cart[i].productID;
const product = await Product.findById(productID);
const sellerID = product.sellerID;
const sold = product.sold + 1;
const profit = product.profit + product.price;
const sellerA = await Seller.findById(sellerID);
const sellerProfit = product.price + sellerA.profit;
const a = await Seller.findByIdAndUpdate(sellerID,{profit:sellerProfit});
const seller = await Seller.findByIdAndUpdate(sellerID,{
  $push:{
    sold:{
      productID,
      date:orderPlaceDate,
      price:product.price,
      buyerAddress: user.address
    }
  }
});
const userUpdate = await User.findByIdAndUpdate(id,{
  $push:{
    orders:{
      productID,
      date:orderPlaceDate,
      price:product.price
    }
  }
});

const productUpdate = await Product.findByIdAndUpdate(productID,{profit:profit,sold:sold});
const p = await Product.findByIdAndUpdate(productID,{
  $push:{
    purchaseBy:{userID:id}
  }
});
}


res.status(201).json({id});

};



// change buyer information
module.exports.changeAddress_post = async(req,res) =>{
  const {address} = req.body;
  let token = req.cookies.buyer;
  const id = getUserID(token);
  const update =  await User.findByIdAndUpdate(id,{address} );
  console.log("update Address ",update);
 res.redirect('/buyerProfile');
};

module.exports.changeName_post = async(req,res) =>{
  const {namee, lastName} = req.body;
  let token = req.cookies.buyer;
  const id = getUserID(token);
 const update =  await User.findByIdAndUpdate(id,{name:namee,lastName} );
  console.log("update Name ",update);
 res.redirect('/buyerProfile');
};

module.exports.changePhone_post = async(req,res) =>{
  const {phone} = req.body;
  let token = req.cookies.buyer , errors;
const id = getUserID(token);
console.log(phone.length);
if(phone.length <= 9){
  errors = "Length should be 10 digits";
  res.status(404).json({errors});
}
await User.findOne({phone},async (err,result) =>{
  if(err){
    console.log(err);
  }else{

    console.log('re',result);
    if(result == null){
      const update = await User.findByIdAndUpdate(id,{phone});
      res.status(201).json({seller: id});
    }else{
       errors = "This phone number already exist";
      res.status(404).json({errors});
    }
  }
});
};


module.exports.otp_post = async(req,res)=>{
  const {email} = req.body;
  let token = req.cookies.buyer,errors;
  const id = getUserID(token);

  await User.findOne({email},(err,result) =>{
    if(err){
      console.log(err);
    }else{
      if(result == null){
        const otp = Math.round(random(1000,9999));
     var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                service: 'gmail',
                auth: {
                  user: 'mailsender1504@gmail.com',
                  pass: 'zglaktzzeankpauj'
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
        errors = "This email already exist";
        res.status(404).json({errors});
      }
    }
  });
};

module.exports.changeEmail_post = async (req,res) =>{
  const {email} = req.body;
  let token = req.cookies.buyer;
  const id = getUserID(token);

  const update = await User.findByIdAndUpdate(id,{email});
  console.log("email update", update);
  res.status(201).json({id});
};

module.exports.changePassword_post = async (req,res) =>{
  const {password,new_pass} = req.body;
  let token = req.cookies.buyer;
  const id = getUserID(token);
  const data = await User.findById(id);
  try{
    const email = data.email;
    const seller = await User.login(email,password);
    const salt = await bcrypt.genSalt();

    bcrypt.hash(new_pass,salt, async (err,hash) =>{
      if(err){
        console.log(err);
      }
      if(hash){
        const ab = await User.findByIdAndUpdate(id,{password: hash});
    res.status(201).json({buyer : id});
      }
    });   
  }
  catch(err){
    console.log(err);
    if(err.message == "incorrect password"){
      errors = err.message;
     res.status(201).json({errors});
  }
}
};