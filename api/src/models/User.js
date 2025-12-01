const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Visitor", "Moderator", "Editor"],
    },
    phoneNumber: { type: String },
    address: {
      country: { type: String },
      state: { type: String },
      streetName: { type: String },
      streetNumber: { type: String },
      zipCode: { type: String },
    },
    lastLogin: { type: Date },
    // Mongoose adds createdAt/updatedAt automatically with timestamps: true
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
