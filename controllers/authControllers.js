const User = require('../model/user');
const jwt = require('jsonwebtoken');
const { create } = require('../model/user');
const Seller = require('../model/seller');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const random = (low,high) => Math.random() * (high-low) +low;

const HandleErrors = (err) =>{
    let errors = {email:'', password:''};

    if(err.message.includes('incorrect email')){
        errors.email = 'Email is not registered'
        return errors;
    }
    
    if(err.message.includes('incorrect password')){
        errors.password = 'Password is incorrect';
        return errors;
    }
    
    //duplication email in mongodb
    if(err.code == 11000){
        //console.log('signup_post',err.code);
        errors.email = 'That email is already registered';
    return errors;       
    }

    //checking password
    if(err.message.includes('Min length of password in 4')){
     errors.password = 'Minimum length of password can of 4';
     return errors;
    }
   
}

const maxAge = 3*24*60*60;
const createBuyertoken = (id , account) => {
    return jwt.sign({id , account},'Ecommerce secret',{
        expiresIn: maxAge
    });
}
const createSellertoken = (id , account) => {
    return jwt.sign({id , account},'Ecommerce secret',{
        expiresIn: maxAge
    });
}

module.exports.forgot_get = async (req,res) =>{
res.render('forgot',{title: 'Forgot Password'});
};

module.exports.signup_get = (req,res) =>{
    res.render('signup',{title:'Signup'});
};

module.exports.login_get = (req,res) =>{
//     var datetime = new Date();
//     var timeInMss = new Date().getTime()
//     console.log(timeInMss);
//   console.log(datetime.toISOString().slice(0,10));

    res.render('login',{title:'Login'});
};

module.exports.forgot_post = async (req,res) =>{
const {no,account,email,password} = req.body;
let id;
if(no == 1){
if(account == "seller"){
   Seller.findOne({email})
   .then(result =>{
    if(result == null){
        res.status(404).json({errors:"Email doesn't exist"});
    }else{
       id = result._id;
    }
   })
   .catch(err=> console.log(err,"buyer forgot error"));
}else{
    User.findOne({email})
    .then(result =>{
        if(result == null){
            res.status(404).json({errors:"Email doesn't exist"});
        }else{          
            id = result._id;
        }
    })
    .catch(err=> console.log(err,"user forgot error"));
}
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
    const salt = await bcrypt.genSalt();
    bcrypt.hash(password,salt, async (err,hash) =>{
        if(err){
            console.log(err);
        }else{
            if(account == "seller"){
                Seller.findOneAndUpdate({email},{password:hash})
                .then(result =>{
                    res.status(201).json({id:result._id});
                })
                .catch(err => console.log(err));
            }else{
                User.findOneAndUpdate({email},{password:hash})
                .then(result =>{
                    res.status(201).json({id:result._id});
                })
                .catch(err => console.log(err));
            }
        }
    });
}
};

module.exports.signup_post = async (req,res) =>{
    
    const {email,password,account,name,lastName,phone} = req.body;
   


 let user,check;
    if(account === "buyer"){
        user = await  User.findOne({email});
        check = await User.findOne({phone});
    }else{
         user = await  Seller.findOne({email});
         check = await Seller.findOne({phone});
    }
        
          
          let errors = {email:'', password:''};
       if(user || check){
           if(user){
            errors.email = 'This email is already registered';
            res.status(404).send({errors});
           }else if(check){
               errors.phone = 'This phone is already registered'
               res.status(404).send({errors});
           }
    
       }else{
           if(password.length < 4){
            errors.password = 'Min length of password is 4';
            res.status(404).send({errors});
           }else{
            const otp = Math.round(random(1000,9999));
            if(account === "buyer"){
                user = await User.create({ 
                    email:email,
                    password: password,
                    account: account,
                    name:name, 
                    lastName: lastName,
                    phone: phone,
                    otp:otp,
                    active: false
                });
            }else{
                user = await Seller.create({
                    email:email,
                    password: password,
                    account: account,
                    name:name, 
                    lastName: lastName,
                    phone: phone,
                    otp:otp,
                    active: false
                });
            }
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
                }
              });
               res.status(201).json({email, _id: user._id, account });
           }
       }      
};
module.exports.login_post =async (req,res) =>{
    const {email,password,account} = req.body;
   // console.log(req.body);
   try{
       if(account == "buyer"){
        const user = await User.login(email,password);
        const token = createBuyertoken(user._id , user.account);
        res.cookie('buyer',token, {httpOnly: true, maxAge: maxAge * 1000});

    res.status(200).json({user : user._id});
       }else{
        const seller = await Seller.login(email,password);
        const token = createSellertoken(seller._id, seller.account);
        res.cookie('seller',token,{httpOnly: true, maxAge: maxAge *1000});
        res.status(201).json({seller:seller._id});
       }

   }catch(err){
    console.log(err.message);
    const errors = HandleErrors(err);
    res.status(404).json({errors});
   }
};

module.exports.logout_get = (req, res) => {
    res.cookie('buyer','',{maxAge:1});
    res.cookie('seller','',{maxAge:1});
    res.redirect('/');
}

module.exports.otp_get = async (req,res)=>{
    const id = req.params.id;
    let user = await User.findById(id);
    if(!user){
        user = await Seller.findById(id);
    }
    const link = `/otp/${id}`
    res.render('otp',{title: "OTP", link: link, account: user.account});
}

module.exports.otp_post = async (req,res) =>{
    const id = req.params.id
    const account = req.body.account;
    let user;
    if(account === "buyer")
        user = await User.findById(id);
    else
        user = await Seller.findById(id);
    if(user.otp == req.body.otp){

        if(account === "buyer"){
            const user = await User.findByIdAndUpdate(id, {
                $set: {
                    otp:"",
                    active:true
                }
            })
            const token = createBuyertoken(user._id , user.account);
            res.cookie('buyer',token, {httpOnly: true, maxAge: maxAge * 1000});
            res.status(201).json({user:user._id});
        }else{
            const seller = await Seller.findByIdAndUpdate(id, {
                $set:{
                    otp:"",
                    active: true
                }
            })

          const token = createSellertoken(seller._id, seller.account);
          res.cookie('seller',token,{httpOnly: true, maxAge: maxAge *1000});
          res.status(201).json({seller:seller._id});
        }
       

    }else{
        const error = 'Otp not match'; 
        res.status(404).json({error})
    }
}