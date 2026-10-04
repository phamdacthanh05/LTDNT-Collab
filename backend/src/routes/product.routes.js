const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// GET /api/products?category=Canva+Pro  -> danh sách sản phẩm đang bán
router.get('/', async (req, res) => {
  const { category } = req.query;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: String(category) } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ products });
});

// GET /api/products/:id -> chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }

  res.json({ product });
});

module.exports = router;
