const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
type:{
    type: String,
    required:true
}
});

const Admin = mongoose.model('admin',adminSchema);

module.exports = Admin;