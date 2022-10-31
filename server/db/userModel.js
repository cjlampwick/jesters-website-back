const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: [true, "Please provide a Fullname!"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },
  dateBirth: {
    type: Date,
    required: [true, "Please provide a date of birth!"],
    unique: false,
  },
  dni: {
    type: Number,
    required: [true, "Please provide a DNI!"],
    unique: false,
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
})
module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);