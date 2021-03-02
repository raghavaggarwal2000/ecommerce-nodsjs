const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    type:{
        type: String,
        required:true
    },
    description:{
        type: String,
        required: true
    },
    sold:{
        type:Number,
        required:true
    },
    profit:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true,
        data: Buffer
    },
    sellerID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'sellers'
    },
    purchaseBy: [
        {type:Object,
            userID:mongoose.Schema.Types.ObjectId
        }
    ]
});

const Product = mongoose.model('products',productSchema);

module.exports = Product;