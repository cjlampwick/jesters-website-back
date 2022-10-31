const mongoose = require("mongoose");
const reserveCoworkingSchema = new mongoose.Schema({

  dateFrom: {
    type: Date,
    required: [true, "Please provide an date from!"],
    unique: false,
  },

  dateTo: {
    type: Date,
    required: [true, "Please provide an date to!"],
    unique: false,
  },

  userIdPagar: {
    type: mongoose.ObjectId,
    required: [true, ""],
    unique: false,
  },

  halfFrom: {
    type: Number,
    required: [true, "Please provide an hour"],
    unique: false,
  },
  // paymentid:{
  //   type: Boolean,

  // }
  halfTo: {
    type: Number,
    required: [true, "Please provide an hour"],
    unique: false,
  },
})
module.exports = mongoose.model.reserve || mongoose.model("Reserve", reserveCoworkingSchema);