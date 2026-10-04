-- =====================================================================
-- migration_v2.sql — Cập nhật DB cho các chức năng mới
-- Cách dùng: phpMyAdmin → chọn database `ltdnt-group` → tab Import → chọn file này → Go
-- File an toàn khi chạy lại nhiều lần (CREATE TABLE IF NOT EXISTS, seed có điều kiện).
--
-- Bổ sung:
--   1. orders, order_items, payments   (bản dump cũ chưa có 3 bảng này; payments chỉ còn MOMO)
--   2. product_accounts                (kho tài khoản: mỗi dòng = 1 tài khoản bán được 1 lần)
--   3. purchase_history                (lịch sử mua hàng, tự xoá sau 7 ngày)
--   4. Dữ liệu demo cho product_accounts (tài khoản giả, xoá bằng lệnh ghi ở cuối file)
-- =====================================================================

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
