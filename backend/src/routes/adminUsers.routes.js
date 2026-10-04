const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdminRole } = require('../middleware/adminRole.middleware');

const router = express.Router();

// Tất cả các route trong này đều yêu cầu đăng nhập và có quyền ADMIN
router.use(requireAuth, requireAdminRole);

// 1. GET /api/admin/users -> Lấy danh sách toàn bộ người dùng
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    console.error('admin get users error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// 2. POST /api/admin/users -> Thêm người dùng mới
router.post('/', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên và email' });
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống' });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: password || '123456', // Mật khẩu mặc định nếu không nhập
        role: role || 'BUYER',
      },
    });
    res.status(201).json({ message: 'Thêm người dùng thành công', user: newUser });
  } catch (err) {
    console.error('admin create user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// 3. PUT /api/admin/users/:id -> Sửa thông tin & phân quyền user
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, role, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const updateData = { fullName, email, role };
    if (password) {
      updateData.passwordHash = password; 
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ message: 'Đã cập nhật thông tin người dùng', updated });
  } catch (err) {
    console.error('admin update user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// 4. DELETE /api/admin/users/:id -> Xóa người dùng
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error('admin delete user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

module.exports = router;