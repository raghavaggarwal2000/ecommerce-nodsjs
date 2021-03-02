const productOutputControllers = require('../controllers/productOutputControllers');
const router = require('express');


const app = router();

app.get('/items/:id',productOutputControllers.product_get);

app.get('/product/:id',productOutputControllers.productDetails_get);

app.post('/sort',productOutputControllers.sort_post);
//app.get('/mouse', productOutputControllers.mouse_get);

module.exports = app;