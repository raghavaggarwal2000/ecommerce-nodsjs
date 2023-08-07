const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
        required: true
    },
    address:{
        type: String,
        required: true,
        default: 'null'
    },
    otp:{
        type:Number
    },
    active:{
        type:Boolean,
        default:true
    },
    cart:[
        {
            type:Object,
            productID: mongoose.Schema.ObjectId
        }
    ],
    saveLater:[
        {
            type:Object,
            productID: mongoose.Schema.ObjectId
        }
    ],
    wishlist:[
        {type:Object,
            productID: mongoose.Schema.ObjectId,
            date: String
        }
    ],
    orders:[
        {
            type:Object,
            productID: mongoose.Schema.ObjectId,
            date:String,
            price: Number
            // deliver: String
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
userSchema.pre('save',async function(next){
const salt = await bcrypt.genSalt();
this.password = await bcrypt.hash(this.password,salt);   
next();
});

//static method to login user
userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email});
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email ');
};

const User = mongoose.model('users',userSchema);

module.exports = User;