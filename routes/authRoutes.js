const authController = require('../controllers/authControllers');
const router = require('express');
const {protect} = require('../middleware/authMiddleware');

const app = router();

app.get('/signup',protect, authController.signup_get);
app.get('/login',protect, authController.login_get);

app.post('/signup', authController.signup_post);
app.post('/login', authController.login_post);

app.get('/logout',authController.logout_get);

app.get('/otp/:id',protect,authController.otp_get);
app.post('/otp/:id',authController.otp_post);

app.get('/forgot',protect,authController.forgot_get);
app.post('/forgot',authController.forgot_post);

module.exports = app;