const mongoose = require("mongoose");
const compradorSchema = new mongoose.Schema({

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
  dni: {
    type: Number,
    required: [true, "Please provide a DNI!"],
    unique: false,
  },
  ticketType: {
    type: Number,
    required: [true, "Please provide a ticketType"],
    unique: false,
  },
})
module.exports = mongoose.model.comprador || mongoose.model("Comprador", compradorSchema);