const router = require('express');
const {checkbuyer} = require('../middleware/authMiddleware');
const buyerControllers = require('../controllers/buyerControllers');
const app = router();

app.get('/feedback',buyerControllers.feedback_get);

app.get('/buyerCart',checkbuyer,buyerControllers.buyerCart_get);

app.get('/buyerProfile',checkbuyer,buyerControllers.buyerProfile_get);

app.get('/buyerWishList',checkbuyer,buyerControllers.buyerWishList_get);

app.get('/buyerOrders',checkbuyer,buyerControllers.buyerOrders_get);

app.post('/feedback',buyerControllers.feedback_post);

app.post('/placeOrderDesc',buyerControllers.placeOrderDesc_post);
app.post('/placeOrderCart',buyerControllers.placeOrderCart_post);

app.post('/addtowish',buyerControllers.addToWishList_post);

app.post('/addToCart',buyerControllers.buyerCart_post);

app.post('/removeFromWish',buyerControllers.removeFromWish_post);

app.post('/moveToLater',buyerControllers.moveToSaveLater_post);

app.post('/moveToCart',buyerControllers.removeSaveLater_post);

app.post('/removeCart',buyerControllers.removeFromCart_post);

// edit buyer profile
app.post('/changeBuyerAddress',buyerControllers.changeAddress_post);
app.post('/changeBuyerName',buyerControllers.changeName_post);
app.post('/changeBuyerPhone',buyerControllers.changePhone_post);
app.post('/changeBuyerPassword',buyerControllers.changePassword_post);
app.post('/changeBuyerEmail',buyerControllers.changeEmail_post);
app.post('/sendBuyerOTP',buyerControllers.otp_post);

module.exports = app;