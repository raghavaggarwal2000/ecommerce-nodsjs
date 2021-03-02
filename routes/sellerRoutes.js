const router = require('express');
const multer = require('multer');
const Product = require('../model/product');
const {checkseller} = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const Seller = require('../model/seller');
const sellerControllers = require('../controllers/sellerControllers');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, '-')  + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 20
    },
    fileFilter: fileFilter
  });

const app = router();


app.get('/seller',checkseller,sellerControllers.seller);

app.get('/sellerProfile',checkseller,sellerControllers.sellerProfile_get);

app.get('/productInput',checkseller,sellerControllers.productInput_get);
app.get('/allProducts',checkseller,sellerControllers.allProducts_get)

app.get('/allProducts/:id',checkseller,sellerControllers.productDetails_get);
app.get('/sellerOrder',checkseller,sellerControllers.sellerOrder_get);
//post routes

app.post('/changeSellerName',sellerControllers.changeName_post);
app.post('/changeSellerPhone',sellerControllers.changePhone_post);
app.post('/sendOTPEmail',sellerControllers.sendOTPEmail_post);
app.post('/changeSellerEmail',sellerControllers.changeEmail_post);
app.post('/changeSellerAddress',sellerControllers.changeAddress_post);
app.post('/changeSellerPassword',sellerControllers.changePassword_post);

app.post('/productInput',upload.single('image'), async (req,res)=>{
  let sellerID;
  const token = req.cookies.seller;
  jwt.verify(token,'Ecommerce secret', async (err,decode)=>{
    if(err){
      console.log(err);
    }else{
      sellerID = decode.id;
    }
  });

    const {name,price,type,description} = req.body;
  //console.log(req.file);
  const imagePath = req.file.filename;

  const sellerDetails = await Seller.findById(sellerID);
 const email = sellerDetails.email;
 
  const product = await Product.create({name,price,type,description,sold:0,profit:0,image: imagePath, sellerID});

const productID = product._id;
 await Seller.findOneAndUpdate({
   email: email,
 },{
   $addToSet: {
    products:{
      productID: productID,
    } 
   },
 });
  res.redirect('/seller');

});
module.exports = app;