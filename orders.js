const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/orders — place order (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { items, paymentMethod, customerPhone, notes } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items in order" });

    // Validate products and build order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || !product.inStock)
        return res.status(400).json({ error: `Product not available: ${item.product}` });

      orderItems.push({
        product: product._id,
        name:    product.name,
        price:   product.price,
        quantity: item.quantity || 1,
      });
      totalAmount += product.price * (item.quantity || 1);
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "jazzcash",
      customerPhone: customerPhone || req.user.phone,
      customerEmail: req.user.email,
      notes,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/my — user's own orders (protected)
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — get single order (protected, own order or admin)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image category")
      .populate("user", "name email");

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/cancel — user cancel pending order
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });
    if (order.status !== "pending")
      return res.status(400).json({ error: "Only pending orders can be cancelled" });

    order.status = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
