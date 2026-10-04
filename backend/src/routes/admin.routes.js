// src/routes/admin.routes.js
// MỚI: API quản trị (sản phẩm + kho tài khoản) — chỉ tài khoản role = ADMIN mới gọi được.
const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdminRole } = require('../middleware/adminRole.middleware');

const router = express.Router();
router.use(requireAuth, requireAdminRole);

const CHUNK_SIZE = 5000; // chèn từng lô 5.000 dòng để không vượt max_allowed_packet
const MAX_PER_REQUEST = 200000;

// "email|matkhau" hoặc "email:matkhau" hoặc "email|matkhau|ghi chú"
function parseLine(line) {
  const raw = line.trim();
  if (!raw) return null;

  let parts;
  if (raw.includes('|')) parts = raw.split('|');
  else if (raw.includes('\t')) parts = raw.split('\t');
  else {
    const i = raw.indexOf(':'); // chỉ tách ở dấu ':' đầu tiên (mật khẩu có thể chứa ':')
    parts = i === -1 ? [raw] : [raw.slice(0, i), raw.slice(i + 1)];
  }

  const username = (parts[0] || '').trim();
  const password = (parts[1] || '').trim();
  const note = parts.length > 2 ? parts.slice(2).join('|').trim() : '';
  if (!username || !password || username.length > 191 || password.length > 191) return null;
  return { username, password, note: note ? note.slice(0, 191) : null };
}

// ---------- Quản lý sản phẩm (thêm / sửa / xoá) ----------
const MAX_PRICE = 999999999999; // cột price là DECIMAL(12,0)

// Kiểm tra & làm sạch dữ liệu sản phẩm từ client. partial=true khi sửa (chỉ kiểm tra field có gửi lên).
function parseProductBody(body, { partial = false } = {}) {
  const data = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has('name')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return { error: 'Vui lòng nhập tên sản phẩm' };
    if (name.length > 191) return { error: 'Tên sản phẩm tối đa 191 ký tự' };
    data.name = name;
  }

  if (!partial || has('price')) {
    const price = Number(body.price);
    if (body.price === '' || body.price === null || !Number.isInteger(price) || price < 1) {
      return { error: 'Giá phải là số nguyên lớn hơn 0 (đơn vị: đồng)' };
    }
    if (price > MAX_PRICE) return { error: 'Giá quá lớn' };
    data.price = price;
  }

  if (has('description')) {
    const d = typeof body.description === 'string' ? body.description.trim() : '';
    if (d.length > 5000) return { error: 'Mô tả tối đa 5000 ký tự' };
    data.description = d || null;
  }

  if (has('category')) {
    const c = typeof body.category === 'string' ? body.category.trim() : '';
    if (c.length > 191) return { error: 'Danh mục tối đa 191 ký tự' };
    data.category = c || null;
  }

  if (has('imageUrl')) {
    const u = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    if (u) {
      if (u.length > 191) return { error: 'Link ảnh tối đa 191 ký tự (hãy dùng link ngắn hơn)' };
      if (!/^https?:\/\/\S+$/i.test(u)) return { error: 'Link ảnh phải bắt đầu bằng http:// hoặc https://' };
    }
    data.imageUrl = u || null;
  }

  if (has('isActive')) {
    data.isActive = body.isActive === true || body.isActive === 'true';
  }

  return { data };
}

// GET /api/admin/products -> toàn bộ sản phẩm (kể cả đang ẩn) + số tài khoản còn trong kho
router.get('/products', async (req, res) => {
  try {
    const [products, counts] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.productAccount.groupBy({ by: ['productId'], _count: { _all: true } }),
    ]);
    const countMap = new Map(counts.map((c) => [c.productId, c._count._all]));

    res.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        imageUrl: p.imageUrl,
        price: p.price,
        isActive: p.isActive,
        available: countMap.get(p.id) || 0,
      })),
    });
  } catch (err) {
    console.error('admin list products error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// POST /api/admin/products  body: { name, price, description?, category?, imageUrl?, isActive? }
// Số lượng (stock) KHÔNG nhập tay: nó luôn bằng số tài khoản trong kho, nhập hàng ở màn "Kho tài khoản".
router.post('/products', async (req, res) => {
  try {
    const { data, error } = parseProductBody(req.body || {});
    if (error) return res.status(400).json({ message: error });

    const product = await prisma.product.create({
      data: { ...data, stock: 0, isActive: data.isActive ?? true },
    });
    res.status(201).json({
      message: `Đã thêm sản phẩm "${product.name}". Hãy nhập tài khoản vào kho để bắt đầu bán.`,
      product,
    });
  } catch (err) {
    console.error('admin create product error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// PUT /api/admin/products/:id  (gửi field nào sửa field đó)
router.put('/products/:id', async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const { data, error } = parseProductBody(req.body || {}, { partial: true });
    if (error) return res.status(400).json({ message: error });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    // Đơn cũ giữ nguyên giá cũ (order_items.unitPrice), chỉ đơn mới áp dụng giá mới
    const product = await prisma.product.update({ where: { id: existing.id }, data });
    res.json({ message: `Đã cập nhật "${product.name}"`, product });
  } catch (err) {
    console.error('admin update product error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// DELETE /api/admin/products/:id
//  - Sản phẩm CHƯA từng có đơn hàng: xoá hẳn (kèm các tài khoản còn trong kho).
//  - Sản phẩm ĐÃ có đơn hàng: không xoá được vì sẽ mất lịch sử đơn của khách -> chuyển sang ẨN (isActive=false).
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const orderCount = await prisma.orderItem.count({ where: { productId: product.id } });
    if (orderCount > 0) {
      await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
      return res.json({
        deleted: false,
        hidden: true,
        message: `"${product.name}" đã có ${orderCount} dòng đơn hàng nên không thể xoá hẳn (sẽ làm mất lịch sử đơn của khách). Sản phẩm đã được ẨN khỏi cửa hàng.`,
      });
    }

    const removedAccounts = await prisma.$transaction(async (tx) => {
      await tx.conversation.updateMany({ where: { productId: product.id }, data: { productId: null } });
      const r = await tx.productAccount.deleteMany({ where: { productId: product.id } });
      await tx.product.delete({ where: { id: product.id } });
      return r.count;
    });

    res.json({
      deleted: true,
      hidden: false,
      message: `Đã xoá "${product.name}"` + (removedAccounts ? ` và ${removedAccounts.toLocaleString('vi-VN')} tài khoản còn trong kho.` : '.'),
    });
  } catch (err) {
    console.error('admin delete product error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// POST /api/admin/products/:id/accounts
// body: { text: "email1|pass1\nemail2|pass2" }  hoặc  { accounts: [{ username, password, note? }] }
router.post('/products/:id/accounts', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    let parsed = [];
    let invalid = 0;

    if (typeof req.body.text === 'string') {
      for (const line of req.body.text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const acc = parseLine(line);
        if (acc) parsed.push(acc);
        else invalid++;
      }
    } else if (Array.isArray(req.body.accounts)) {
      for (const a of req.body.accounts) {
        const username = typeof a?.username === 'string' ? a.username.trim() : '';
        const password = typeof a?.password === 'string' ? a.password.trim() : '';
        if (username && password && username.length <= 191 && password.length <= 191) {
          parsed.push({ username, password, note: a.note ? String(a.note).slice(0, 191) : null });
        } else invalid++;
      }
    } else {
      return res.status(400).json({ message: 'Thiếu dữ liệu: gửi "text" (mỗi dòng email|matkhau) hoặc "accounts"' });
    }

    if (parsed.length === 0) {
      return res.status(400).json({ message: 'Không có dòng hợp lệ nào. Định dạng đúng: email|matkhau (mỗi tài khoản 1 dòng)' });
    }
    if (parsed.length > MAX_PER_REQUEST) {
      return res.status(400).json({ message: `Mỗi lần chỉ nhập tối đa ${MAX_PER_REQUEST.toLocaleString('vi-VN')} tài khoản` });
    }

    let inserted = 0;
    for (let i = 0; i < parsed.length; i += CHUNK_SIZE) {
      const chunk = parsed.slice(i, i + CHUNK_SIZE).map((a) => ({ ...a, productId: product.id }));
      const r = await prisma.productAccount.createMany({ data: chunk });
      inserted += r.count;
    }

    const available = await prisma.productAccount.count({ where: { productId: product.id } });
    await prisma.product.update({ where: { id: product.id }, data: { stock: available } });

    res.status(201).json({
      message: `Đã thêm ${inserted.toLocaleString('vi-VN')} tài khoản vào "${product.name}"`,
      inserted,
      invalid,
      available,
    });
  } catch (err) {
    console.error('admin import accounts error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi nhập tài khoản, vui lòng thử lại' });
  }
});

module.exports = router;
