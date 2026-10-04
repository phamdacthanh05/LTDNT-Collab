-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 01, 2026 lúc 09:15 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ltdnt-group`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `conversations`
--

CREATE TABLE `conversations` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `orderId` varchar(191) DEFAULT NULL,
  `subject` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `conversations`
--

INSERT INTO `conversations` (`id`, `userId`, `productId`, `orderId`, `subject`, `createdAt`, `updatedAt`) VALUES
('ef21a20e-e95a-4d25-b2ee-63427a35a12a', '626482d4-e3e6-4844-bf8a-d0161b1992c9', NULL, NULL, 'Tài khoản GPT', '2026-09-14 07:57:39.626', '2026-09-14 07:57:39.626');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `senderRole` enum('USER','ADMIN') NOT NULL,
  `senderUserId` varchar(191) DEFAULT NULL,
  `content` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `messages`
--

INSERT INTO `messages` (`id`, `conversationId`, `senderRole`, `senderUserId`, `content`, `isRead`, `createdAt`) VALUES
('e647c23f-9482-496e-9850-a0d6794ba686', 'ef21a20e-e95a-4d25-b2ee-63427a35a12a', 'USER', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 'có tài khoản GPT plus ko shop', 0, '2026-09-14 07:57:39.626');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,0) NOT NULL,
  `category` varchar(191) DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `imageUrl`, `stock`, `isActive`, `createdAt`, `updatedAt`) VALUES
('5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'Canva Pro 1 tháng', 'Tài khoản Canva Pro dùng riêng, đầy đủ tính năng premium', 49000, 'Canva Pro', 'https://kelasjuara.id/wp-content/uploads/2025/12/Screenshot-2025-04-18-232844.png', 20, 1, '2026-09-11 17:20:06.063', '2026-09-12 15:55:25.505'),
('5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'Canva Pro 1 năm', 'Tài khoản Canva Pro dùng riêng, hiệu lực 12 tháng', 399000, 'Canva Pro', NULL, 10, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000'),
('5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'ChatGPT Plus 1 tháng', 'Tài khoản ChatGPT Plus, không giới hạn GPT-4', 250000, 'Tài khoản', NULL, 15, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000'),
('5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'CapCut Pro 1 tháng', 'Tài khoản CapCut Pro chỉnh video không watermark', 79000, 'Tool', NULL, 30, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `walletBalance` decimal(12,0) NOT NULL DEFAULT 0,
  `address` text DEFAULT NULL,
  `role` enum('ADMIN','BUYER') NOT NULL DEFAULT 'BUYER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `fullName`, `email`, `passwordHash`, `createdAt`, `updatedAt`, `walletBalance`, `address`, `role`) VALUES
('626482d4-e3e6-4844-bf8a-d0161b1992c9', 'Trần Anh Tuấn', 'trananhtuan222@gmail.com', '$2a$10$wSkx9IRSvmXzODwWM17tZOBQVNBuDi0HB8yS0XKYqIhdFao0fnvwS', '2026-09-13 05:12:29.823', '2026-09-13 05:12:29.823', 0, NULL, 'BUYER'),
('73d54169-9161-45f1-8479-18f280f856f1', 'Em Thanh', 'thanhtrick2k5@gmail.com', '$2a$10$WzWgvkgJK5bS3mcHvrz75erWOPaLtJwzeyK9ffbmx2e4xVhql1F4W', '2026-09-11 11:42:02.521', '2026-09-14 14:53:25.535', 0, NULL, 'ADMIN');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversations_userId_idx` (`userId`),
  ADD KEY `conversations_productId_idx` (`productId`),
  ADD KEY `conversations_orderId_idx` (`orderId`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversationId_idx` (`conversationId`),
  ADD KEY `messages_senderUserId_idx` (`senderUserId`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);
--
-- ===== PHẦN BỔ SUNG (v2): đơn hàng, kho tài khoản, lịch sử mua hàng =====
-- Gồm: orders, order_items, payments (chỉ MoMo), product_accounts, purchase_history
-- + dữ liệu demo cho kho tài khoản. Bản dump cũ chưa có orders/order_items/payments.
--

-- ---------------------------------------------------------------------
-- 1. Đơn hàng / chi tiết đơn / thanh toán
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `totalAmount` decimal(12,0) NOT NULL,
  `status` enum('PENDING','PAID','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `orders_userId_idx` (`userId`),
  CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(12,0) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_orderId_idx` (`orderId`),
  KEY `order_items_productId_idx` (`productId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- method chỉ còn 'MOMO' (đã loại bỏ VNPay)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `method` enum('MOMO') NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(191) DEFAULT NULL,
  `rawResponse` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_orderId_key` (`orderId`),
  CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------
-- 2. Kho tài khoản của sản phẩm
--    Khi khách mua: lấy N dòng -> XOÁ khỏi bảng này -> chép sang purchase_history
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_accounts` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_accounts_productId_idx` (`productId`),
  CONSTRAINT `product_accounts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------
-- 3. Lịch sử mua hàng (lưu tài khoản/mật khẩu khách vừa mua, hết hạn sau 7 ngày)
--    productId KHÔNG có khoá ngoại: vẫn giữ lịch sử kể cả khi sản phẩm bị xoá
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_history` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `orderId` varchar(191) DEFAULT NULL,
  `productId` varchar(191) NOT NULL,
  `productName` varchar(191) NOT NULL,
  `accountUsername` varchar(191) NOT NULL,
  `accountPassword` varchar(191) NOT NULL,
  `accountNote` varchar(191) DEFAULT NULL,
  `unitPrice` decimal(12,0) NOT NULL,
  `purchasedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_history_userId_idx` (`userId`),
  KEY `purchase_history_orderId_idx` (`orderId`),
  KEY `purchase_history_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `purchase_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `purchase_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------
-- 4. Dữ liệu demo cho kho tài khoản (TÀI KHOẢN GIẢ — chỉ để test luồng mua hàng)
--    Số lượng khớp với cột `stock` hiện có: Canva 1 tháng 20, Canva 1 năm 10, ChatGPT Plus 15, CapCut 30.
--    Chỉ chèn khi sản phẩm đó chưa có tài khoản nào nên chạy lại file sẽ không bị nhân đôi.
--    Muốn có 100.000 tài khoản? Đổi số 30 ở dưới thành 100000 (hoặc dùng màn hình Admin → Kho tài khoản).
-- ---------------------------------------------------------------------
SET @@max_recursive_iterations = 1000000;

INSERT INTO `product_accounts` (`id`, `productId`, `username`, `password`, `note`)
WITH RECURSIVE seq (n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 20)
SELECT UUID(), '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', CONCAT('canvapro1m.', LPAD(n, 3, '0'), '@demo.local'), CONCAT('Demo@', LPAD(n, 3, '0'), 'Cv1m'), 'Tài khoản demo' FROM seq
WHERE NOT EXISTS (SELECT 1 FROM `product_accounts` WHERE `productId` = '5bd29faf-adca-11f1-9aef-2c4d54c30ca8');

INSERT INTO `product_accounts` (`id`, `productId`, `username`, `password`, `note`)
WITH RECURSIVE seq (n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 10)
SELECT UUID(), '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', CONCAT('canvapro1y.', LPAD(n, 3, '0'), '@demo.local'), CONCAT('Demo@', LPAD(n, 3, '0'), 'Cv1y'), 'Tài khoản demo' FROM seq
WHERE NOT EXISTS (SELECT 1 FROM `product_accounts` WHERE `productId` = '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8');

INSERT INTO `product_accounts` (`id`, `productId`, `username`, `password`, `note`)
WITH RECURSIVE seq (n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 15)
SELECT UUID(), '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', CONCAT('gptplus.', LPAD(n, 3, '0'), '@demo.local'), CONCAT('Demo@', LPAD(n, 3, '0'), 'Gpt'), 'Tài khoản demo' FROM seq
WHERE NOT EXISTS (SELECT 1 FROM `product_accounts` WHERE `productId` = '5bd2b320-adca-11f1-9aef-2c4d54c30ca8');

INSERT INTO `product_accounts` (`id`, `productId`, `username`, `password`, `note`)
WITH RECURSIVE seq (n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 30)
SELECT UUID(), '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', CONCAT('capcutpro.', LPAD(n, 3, '0'), '@demo.local'), CONCAT('Demo@', LPAD(n, 3, '0'), 'Cc'), 'Tài khoản demo' FROM seq
WHERE NOT EXISTS (SELECT 1 FROM `product_accounts` WHERE `productId` = '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8');

-- Đồng bộ products.stock = số tài khoản thực tế còn trong kho
UPDATE `products` p
SET p.`stock` = (SELECT COUNT(*) FROM `product_accounts` a WHERE a.`productId` = p.`id`);

-- ---------------------------------------------------------------------
-- (Tuỳ chọn) Tự xoá lịch sử quá 7 ngày ngay trong MySQL, không phụ thuộc backend.
-- Backend Node đã tự dọn mỗi giờ nên KHÔNG bắt buộc. Muốn dùng thì bỏ comment 2 lệnh dưới:
--   SET GLOBAL event_scheduler = ON;
--   CREATE EVENT IF NOT EXISTS `purge_purchase_history` ON SCHEDULE EVERY 1 HOUR
--     DO DELETE FROM `purchase_history` WHERE `expiresAt` < NOW(3);
--
-- Xoá toàn bộ tài khoản demo khi bạn nhập hàng thật:
--   DELETE FROM `product_accounts` WHERE `username` LIKE '%@demo.local';
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- ===== PHẦN BỔ SUNG (v3): VÍ TIỀN =====
-- Nạp tiền vào ví qua MoMo; mua hàng trừ tiền trong ví. Admin không có số dư.
-- ---------------------------------------------------------------------
-- 1. Cho phép đơn hàng ghi nhận phương thức thanh toán bằng ví
ALTER TABLE `payments`
  MODIFY `method` enum('MOMO','WALLET') NOT NULL;

-- 2. Sổ giao dịch ví: mỗi lần nạp (TOPUP) / trừ tiền mua hàng (PURCHASE) / hoàn tiền (REFUND)
--    Với TOPUP, `id` chính là mã đơn gửi sang MoMo (có tiền tố "TOPUP_").
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('TOPUP','PURCHASE','REFUND') NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `amount` decimal(12,0) NOT NULL,
  `balanceAfter` decimal(12,0) DEFAULT NULL,
  `orderId` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `transactionId` varchar(191) DEFAULT NULL,
  `rawResponse` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `wallet_transactions_userId_idx` (`userId`),
  KEY `wallet_transactions_orderId_idx` (`orderId`),
  CONSTRAINT `wallet_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `wallet_transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Admin KHÔNG có số dư: đảm bảo mọi tài khoản ADMIN có walletBalance = 0
--    (tiền thu của shop nằm trong MoMo của chủ shop, không quản lý trong app).
UPDATE `users` SET `walletBalance` = 0 WHERE `role` = 'ADMIN';

-- 4. Đơn cũ đang PENDING (từ luồng "mỗi sản phẩm thanh toán 1 lần qua MoMo") không còn dùng nữa -> huỷ
UPDATE `orders` SET `status` = 'CANCELLED' WHERE `status` = 'PENDING';

-- (Chỉ để TEST) cấp thử 500.000đ cho khách demo, bỏ comment nếu cần:
-- UPDATE `users` SET `walletBalance` = 500000 WHERE `email` = 'trananhtuan222@gmail.com';

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
