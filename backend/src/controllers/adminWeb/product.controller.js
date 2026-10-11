// src/controllers/adminWeb/product.controller.js
const prisma = require('../../prisma');

// ============ 1. DANH SÁCH SẢN PHẨM ============
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { _count: { select: { accounts: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const formattedProducts = products.map(p => ({
            ...p,
            available: p._count.accounts,
            price: Number(p.price)
        }));
        res.render('products/index', {
            title: 'Quản lý Sản phẩm',
            products: formattedProducts,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không tải được danh sách sản phẩm.');
        res.redirect('/admin/dashboard');
    }
};

// ============ 2. FORM THÊM/SỬA ============
exports.getProductForm = async (req, res) => {
    const { id } = req.params;
    let product = null;
    if (id) {
        product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            req.flash('error', 'Không tìm thấy sản phẩm.');
            return res.redirect('/admin/products');
        }
    }
    res.render('products/form', {
        title: id ? 'Sửa sản phẩm' : 'Thêm sản phẩm',
        product,
        isEdit: !!id,
        error: req.flash('error'),
        success: req.flash('success')
    });
};

// ============ 3. XỬ LÝ THÊM/SỬA ============
exports.postProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, category, imageUrl, description, isActive } = req.body;

    const payload = {
        name,
        price: parseInt(price),
        category: category || null,
        imageUrl: imageUrl || null,
        description: description || null,
        isActive: isActive === 'on'
    };

    try {
        if (id) {
            await prisma.product.update({ where: { id }, data: payload });
            req.flash('success', 'Đã lưu thay đổi sản phẩm.');
        } else {
            await prisma.product.create({ data: payload });
            req.flash('success', 'Đã thêm sản phẩm mới. Hãy nhập tài khoản vào kho.');
        }
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Lỗi khi lưu sản phẩm.');
        res.redirect(`/admin/products/${id ? id + '/edit' : 'create'}`);
    }
};

// ============ 4. ẨN/HIỆN SẢN PHẨM ============
exports.toggleProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id } });
        await prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive }
        });
        req.flash('success', 'Đã cập nhật trạng thái sản phẩm.');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không cập nhật được trạng thái.');
    }
    res.redirect('/admin/products');
};

// ============ 5. XÓA SẢN PHẨM ============
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const orderItem = await prisma.orderItem.findFirst({ where: { productId: id } });
        if (orderItem) {
            await prisma.product.update({ where: { id }, data: { isActive: false } });
            req.flash('success', 'Sản phẩm đã có người mua, hệ thống chỉ ẩn đi để giữ lịch sử.');
        } else {
            await prisma.$transaction(async (tx) => {
                await tx.conversation.updateMany({ where: { productId: id }, data: { productId: null } });
                await tx.productAccount.deleteMany({ where: { productId: id } });
                await tx.product.delete({ where: { id } });
            });
            req.flash('success', 'Đã xóa sản phẩm và kho tài khoản.');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'Lỗi khi xóa sản phẩm.');
    }
    res.redirect('/admin/products');
};

// ============ 6. QUẢN LÝ KHO TÀI KHOẢN ============
exports.getAccounts = async (req, res) => {
    const products = await prisma.product.findMany({
        include: { _count: { select: { accounts: true } } },
        orderBy: { createdAt: 'desc' }
    });
    const formattedProducts = products.map(p => ({
        ...p,
        available: p._count.accounts
    }));
    res.render('products/accounts', {
        title: 'Kho tài khoản',
        products: formattedProducts,
        success: req.flash('success'),
        error: req.flash('error')
    });
};

exports.postImportAccounts = async (req, res) => {
    const { productId, accountsText } = req.body;

    if (!productId) {
        req.flash('error', 'Vui lòng chọn sản phẩm.');
        return res.redirect('/admin/products/accounts');
    }

    const lines = accountsText.split(/\r?\n/).filter(l => l.trim());
    const accountsToCreate = [];
    let invalid = 0;

    for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
            accountsToCreate.push({
                productId,
                username: parts[0].trim().slice(0, 191),
                password: parts[1].trim().slice(0, 191),
                note: parts[2] ? parts[2].trim().slice(0, 191) : 'Tài khoản demo'
            });
        } else {
            invalid++;
        }
    }

    if (accountsToCreate.length > 0) {
        try {
            await prisma.productAccount.createMany({ data: accountsToCreate });
            const available = await prisma.productAccount.count({ where: { productId } });
            await prisma.product.update({ where: { id: productId }, data: { stock: available } });

            req.flash('success', `Đã nhập thành công ${accountsToCreate.length} tài khoản.` +
                (invalid > 0 ? ` Có ${invalid} dòng sai định dạng đã bị bỏ qua.` : ''));
        } catch (error) {
            console.error(error);
            req.flash('error', 'Lỗi khi nhập tài khoản vào kho.');
        }
    } else {
        req.flash('error', 'Không có dòng nào hợp lệ. Định dạng đúng: email|matkhau|ghichu');
    }
    res.redirect('/admin/products/accounts');
};