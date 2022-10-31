const mongoose = require("mongoose");
const AppointmentSchema = new mongoose.Schema({
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

  userId: {
    type: mongoose.ObjectId,
    required: [true, ""],
    unique: false,
  },

  halfFrom: {
    type: Number,
    required: [true, "Please provide an hour"],
    unique: false,
  },

  halfTo: {
    type: Number,
    required: [true, "Please provide an hour"],
    unique: false,
  },
});
module.exports =
  mongoose.model.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
