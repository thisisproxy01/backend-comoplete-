const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  category:    {
    type: String,
    enum: ["Games", "AI Tools", "Software", "Gift Cards", "Subscriptions", "Top Up", "Game Items", "Accounts"],
    required: true,
  },
  price:       { type: Number, required: true },
  originalPrice: { type: Number, default: null },   // for showing crossed-out price
  currency:    { type: String, default: "PKR" },
  badge:       { type: String, default: "" },        // e.g. "MOST POPULAR", "SALE"
  brand:       { type: String, default: "" },        // e.g. "Netflix", "Xbox"
  image:       { type: String, default: "" },
  inStock:     { type: Boolean, default: true },
  isActive:    { type: Boolean, default: true },
  rating:      { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  deliveryType:{ type: String, enum: ["instant", "manual"], default: "instant" },
  duration:    { type: String, default: "" },        // e.g. "1 Month", "1 Year"
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
