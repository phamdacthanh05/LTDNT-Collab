-- Import file này vào phpMyAdmin: mở database `ltdnt-group` → tab Import → chọn file này → Go
-- Chỉ tạo 2 bảng cần cho Đăng nhập/Đăng ký/Danh mục sản phẩm. Bảng đơn hàng/thanh toán sẽ thêm sau khi cần.

CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `products` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12,0) NOT NULL,
  `category` VARCHAR(191) NULL,
  `imageUrl` VARCHAR(191) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vài sản phẩm mẫu để test danh mục sản phẩm ngay, xoá/sửa tuỳ ý sau trong phpMyAdmin
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `stock`, `isActive`, `updatedAt`) VALUES
(UUID(), 'Canva Pro 1 tháng', 'Tài khoản Canva Pro dùng riêng, đầy đủ tính năng premium', 49000, 'Canva Pro', 20, 1, NOW()),
(UUID(), 'Canva Pro 1 năm', 'Tài khoản Canva Pro dùng riêng, hiệu lực 12 tháng', 399000, 'Canva Pro', 10, 1, NOW()),
(UUID(), 'ChatGPT Plus 1 tháng', 'Tài khoản ChatGPT Plus, không giới hạn GPT-4', 250000, 'Tài khoản', 15, 1, NOW()),
(UUID(), 'CapCut Pro 1 tháng', 'Tài khoản CapCut Pro chỉnh video không watermark', 79000, 'Tool', 30, 1, NOW());
