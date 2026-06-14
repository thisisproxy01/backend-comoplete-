const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items:         [orderItemSchema],
  totalAmount:   { type: Number, required: true },
  currency:      { type: String, default: "PKR" },
  status:        {
    type: String,
    enum: ["pending", "paid", "processing", "completed", "cancelled", "refunded"],
    default: "pending",
  },
  paymentMethod: { type: String, enum: ["jazzcash", "stripe", "alfalah", "meezan", "cod"], default: "jazzcash" },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "failed", "refunded"], default: "unpaid" },
  deliveryKeys:  [{ type: String }],   // digital keys/codes delivered after payment
  notes:         { type: String, default: "" },
  customerPhone: { type: String, default: "" },
  customerEmail: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
