const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const {check, goseller} = require('./middleware/authMiddleware');
const productOutputRoutes = require('./routes/productoutputRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./model/admin');
const app = express();

const dbURI = 'mongodb+srv://clg-project:test1234@clg-project.xksl3.mongodb.net/clg-project?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify:false})
.then(result => {
    console.log('connected');
    app.listen(3000);  
})
.catch(err => console.log('app.listen',err));

app.set('view engine','ejs');

app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
   //middleware(used to convert data from form into string)
   app.use(cookieParser());
 
   app.use( express.static( "public" ) );

   //enrcypt pass
   app.use(express.json());

    app.get('*',check);
  
   app.get('/',goseller,async (req,res) => {    
    res.render('index',{title:"Home Page" });

});
app.use(authRoutes,sellerRoutes,buyerRoutes,adminRoutes,productOutputRoutes);
//    app.use(authRoutes,sellerRoutes,buyerRoutes,adminRoutes,productOutputRoutes);