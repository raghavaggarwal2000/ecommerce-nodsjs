const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, goseller } = require('./middleware/authMiddleware');
const productOutputRoutes = require('./routes/productoutputRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./model/admin');
const app = express();

const dbURI = 'mongodb+srv://clg-project:test1234@clg-project.xksl3.mongodb.net/clg-project?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(result => {
        console.log('open on localhost:3000')
        console.log('connected');
        app.listen(3000);
    })
    .catch(err => console.log('app.listen', err));

// this is used to register for view engine
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

//middleware(create cookies)
app.use(cookieParser());

// This is used so that front end can access images or css files from public folder
app.use(express.static("public"));

//enrcypt pass
app.use(express.json());

app.get('*', check);

app.get('/', goseller, async (req, res) => {
    res.render('index', { title: "Home Page" });
}); 

app.use(authRoutes, sellerRoutes, buyerRoutes, adminRoutes, productOutputRoutes);
//    app.use(authRoutes,sellerRoutes,buyerRoutes,adminRoutes,productOutputRoutes);