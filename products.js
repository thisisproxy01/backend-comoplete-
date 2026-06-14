const router = require("express").Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/products — public, supports ?category=&search=&sort=
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, limit = 50 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: "i" };

    const sortMap = {
      "price-asc":  { price: 1 },
      "price-desc": { price: -1 },
      "newest":     { createdAt: -1 },
      "popular":    { reviewCount: -1 },
    };

    const products = await Product.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .limit(Number(limit));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id — admin only (soft delete)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
