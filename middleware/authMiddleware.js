const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Seller = require('../model/seller');
const Admin = require('../model/admin');


//checks if its admin or not

const checkAdmin = (req,res,next)=>{
    if(req.cookies.admin){
        let token = req.cookies.admin;
      jwt.verify(token,'Ecommerce secret' , async (err,decodedToken) =>{
        if(err){
            console.log(err.message);
            next();
        }else{
          
      next();
        }
      });
    }else{
        res.redirect('/adminLogin');
        next();
    }
}

//seller cant access index page so making sure he goes to /seller
const goseller = (req,res,next)=>{
    if(req.cookies.seller){
        let token = req.cookies.seller;
        jwt.verify(token, 'Ecommerce secret', async (err, decodedToken) => {
            if (err) {
              console.log(err.message);
           next();
            } else {          
                  let seller = await Seller.findById(decodedToken.id);
                  res.locals.seller =  seller;
           res.redirect('/seller');
            }
          });

    }else{
        next();
    }
};

//checking is logged in person is a seller
const checkseller = (req,res,next)=>{
    if(req.cookies.seller){
        let token = req.cookies.seller;
        jwt.verify(token, 'Ecommerce secret', async (err, decodedToken) => {
            if (err) {
              console.log(err.message);
           next();
            } else {          
                  let seller = await Seller.findById(decodedToken.id);
                  res.locals.seller =  seller;
              next(); 
            }
          });

    }else{
        res.redirect('/signup');
    }
}
//checking if logged in person is a buyer
const checkbuyer = (req,res,next)=>{
    if(req.cookies.buyer){
        let token = req.cookies.buyer;
        jwt.verify(token, 'Ecommerce secret', async (err, decodedToken) => {
            if (err) {
              console.log(err.message,"checkbuyer");
              res.redirect('/signup');
            } else {          
                  let buyer = await User.findById(decodedToken.id);
                  res.locals.buyer =  buyer;
              next(); 
            }
          });
                                                
    }else{
        res.redirect('/signup');
    }

}
//protecting routes for login and signup
const protect = (req,res,next) =>{
    if(req.cookies.buyer){     
           res.redirect('/');
    }else if(req.cookies.seller){
        res.redirect('/seller');
    }
    // else if(req.cookies.admin){
    //    res.redirect('/adminAddTypes')
    // }
    else{
        next();
    }

}
//checking if logged in or not
const check = async (req,res,next) =>{
    const types = await Admin.find();
    res.locals.types = types
    let token;
    if(req.cookies.buyer){
        token = req.cookies.buyer;
    }else if(req.cookies.seller){
        token = req.cookies.seller
    }else{
        const account = {account : 'abc'};
        res.locals.token = account;
        res.locals.seller = null;
        res.locals.buyer = null;
       next();
    }
    if(token){
        jwt.verify(token, 'Ecommerce secret', async (err, decodedToken) => {
            if (err) {
              console.log(err.message);
           next();
            } else {
             // console.log(decodedToken);
              res.locals.token = decodedToken;
              if(decodedToken.account == 'seller'){
                  let seller = await Seller.findById(decodedToken.id);
                  res.locals.seller =  seller;
                //   res.redirect('/seller');
              }else{
                  let buyer = await User.findById(decodedToken.id);
                  res.locals.buyer = buyer;
              }
              next(); 
            }
          });
    }
    
};





module.exports = {check,protect,checkseller, goseller, checkbuyer,checkAdmin}; 