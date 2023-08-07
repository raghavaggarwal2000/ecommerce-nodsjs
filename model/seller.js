const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const sellerSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Please enter email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [4,'Min length of password in 4']
    },
    account:{
        type:String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true
    },
    address:{
        type: String,
        required: true,
        default: 'null'
    },
    profit:{
            type:Number,
            default:0
    },
    otp:{
        type:Number
    },
    active:{
        type:Boolean,
        default:true
    },
    products:[
        {
            type:Object,
            productID: mongoose.Schema.Types.ObjectId
           
        }
    ],   
     sold:[
        {
            type:Object,
            productID: mongoose.Schema.ObjectId,
            date:String,
            price: Number,
            buyerAddress: String
        }
    ]
        // ,
    // name:{
    //     type:String
    // },
    // phone:{
    //     type:String,
    //     unique:true
    // }
});
//hashing password
//not using arrow function because this value wont work 
sellerSchema.pre('save',async function(next){
const salt = await bcrypt.genSalt();
this.password = await bcrypt.hash(this.password,salt);   
next();
});

//static method to login seller
sellerSchema.statics.login = async function(email,password){
    const seller = await this.findOne({email});
    if(seller) {
        const auth = await bcrypt.compare(password, seller.password);
        if(auth){
            return seller;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email ');
};

const Seller = mongoose.model('sellers',sellerSchema);

module.exports = Seller;