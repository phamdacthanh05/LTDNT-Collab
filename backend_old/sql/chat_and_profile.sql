-- Import file này vào phpMyAdmin: mở database của bạn → tab Import → chọn file này → Go
-- File này CHỈ bổ sung (không xoá/sửa dữ liệu cũ):
--   1. Thêm cột walletBalance vào bảng users đã có sẵn (mặc định = 0, không ảnh hưởng user cũ)
--   2. Tạo 2 bảng mới: conversations, messages

ALTER TABLE `users`
  ADD COLUMN `walletBalance` DECIMAL(12, 0) NOT NULL DEFAULT 0 AFTER `phone`;

CREATE TABLE `conversations` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NULL,
  `orderId` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `conversations_userId_idx` (`userId`),
  KEY `conversations_productId_idx` (`productId`),
  KEY `conversations_orderId_idx` (`orderId`),
  CONSTRAINT `conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `conversations_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `messages` (
  `id` VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `senderRole` ENUM('USER', 'ADMIN') NOT NULL,
  `senderUserId` VARCHAR(191) NULL,
  `content` TEXT NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `messages_conversationId_idx` (`conversationId`),
  KEY `messages_senderUserId_idx` (`senderUserId`),
  CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`),
  CONSTRAINT `messages_senderUserId_fkey` FOREIGN KEY (`senderUserId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
