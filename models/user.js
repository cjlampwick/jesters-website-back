 const mongoose = requier('mongoose');
 const Schema = mongoose.Schema

 const userSchema = new Schema({
    user : String,
    password : String
 })

 const User = mongoose.model('User', userSchema);
 
 module.exports = User;