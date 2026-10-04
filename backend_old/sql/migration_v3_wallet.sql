-- =====================================================================
-- MIGRATION v3: VÍ TIỀN (nạp qua MoMo, mua hàng trừ ví)
-- Chạy 1 lần trên database `ltdnt-group` (phpMyAdmin -> tab SQL), sau đó chạy:
--     cd backend && npx prisma generate
-- An toàn khi chạy lại (dùng IF NOT EXISTS / MODIFY).
-- =====================================================================

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
