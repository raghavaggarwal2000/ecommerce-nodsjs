const router = require('express');
const jwt = require('jsonwebtoken');
const {protect,checkAdmin} = require('../middleware/authMiddleware');
const Admin = require('../model/admin');
const User = require('../model/user');
const maxAge = 3*24*60*60;
const app = router();


app.get('/adminLogin',protect,(req,res) =>{

    res.render('adminLogin');
}); 

app.post('/adminLogin',(req,res) =>{
    const {email,password} = req.body;
    const correctEmail = "aggarwalchirag2000@gmail.com";
    const correctPassword = "1234";
    if( correctEmail == email && correctPassword == password)
    {
      const token=  jwt.sign({correctEmail},'Ecommerce secret',{
            expiresIn: maxAge
        });
        res.cookie('admin',token, {httpOnly: true, maxAge: maxAge * 1000});
res.redirect('/adminAddTypes');
    }
});


app.get('/adminAddTypes',checkAdmin,(req,res) => {
    res.render('adminAddTypes');
});

app.post('/adminAddTypes',async (req,res) =>{
const {type} =req.body;
const upload = await Admin.create({type});
res.redirect('/adminAddTypes');
});


module.exports = app;