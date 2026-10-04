-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 01, 2026 lúc 11:34 AM
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
('ef21a20e-e95a-4d25-b2ee-63427a35a12a', '626482d4-e3e6-4844-bf8a-d0161b1992c9', NULL, NULL, 'Tài khoản GPT', '2026-09-14 07:57:39.626', '2026-10-01 08:51:48.710');

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
('8fe95396-46c2-4054-8242-2a72e6c39763', 'ef21a20e-e95a-4d25-b2ee-63427a35a12a', 'ADMIN', NULL, 'không em', 1, '2026-10-01 08:51:01.112'),
('e647c23f-9482-496e-9850-a0d6794ba686', 'ef21a20e-e95a-4d25-b2ee-63427a35a12a', 'USER', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 'có tài khoản GPT plus ko shop', 0, '2026-09-14 07:57:39.626'),
('fd8b73ba-0e60-46fc-a3d3-b159c08f9eda', 'ef21a20e-e95a-4d25-b2ee-63427a35a12a', 'USER', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 'ok', 0, '2026-10-01 08:51:48.715');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `totalAmount` decimal(12,0) NOT NULL,
  `status` enum('PENDING','PAID','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `userId`, `totalAmount`, `status`, `createdAt`, `updatedAt`) VALUES
('42f7e2db-3e2f-417d-b7b4-e2d78498cb84', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 49000, 'DELIVERED', '2026-10-01 09:34:05.972', '2026-10-01 09:34:06.028');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(12,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `productId`, `quantity`, `unitPrice`) VALUES
('f7870f1b-7c39-4fe6-91eb-f505eb6a4d8a', '42f7e2db-3e2f-417d-b7b4-e2d78498cb84', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 1, 49000);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `method` enum('MOMO','WALLET') NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(191) DEFAULT NULL,
  `rawResponse` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `orderId`, `method`, `status`, `transactionId`, `rawResponse`, `createdAt`, `updatedAt`) VALUES
('b4dd949a-9f48-4227-9e5c-fc43d8aa38db', '42f7e2db-3e2f-417d-b7b4-e2d78498cb84', 'WALLET', 'SUCCESS', NULL, NULL, '2026-10-01 09:34:05.972', '2026-10-01 09:34:05.972');

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
('5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'Canva Pro 1 tháng', 'Tài khoản Canva Pro dùng riêng, đầy đủ tính năng premium', 49000, 'Canva Pro', 'https://kelasjuara.id/wp-content/uploads/2025/12/Screenshot-2025-04-18-232844.png', 19, 1, '2026-09-11 17:20:06.063', '2026-10-01 09:34:06.024'),
('5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'Canva Pro 1 năm', 'Tài khoản Canva Pro dùng riêng, hiệu lực 12 tháng', 399000, 'Canva Pro', NULL, 10, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000'),
('5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'ChatGPT Plus 1 tháng', 'Tài khoản ChatGPT Plus, không giới hạn GPT-4', 250000, 'Tài khoản', NULL, 15, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000'),
('5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'CapCut Pro 1 tháng', 'Tài khoản CapCut Pro chỉnh video không watermark', 79000, 'Tool', NULL, 30, 1, '2026-09-11 17:20:06.063', '2026-09-11 17:20:06.000');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_accounts`
--

CREATE TABLE `product_accounts` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_accounts`
--

INSERT INTO `product_accounts` (`id`, `productId`, `username`, `password`, `note`, `createdAt`) VALUES
('99fad2bb-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.002@demo.local', 'Demo@002Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad2c8-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.003@demo.local', 'Demo@003Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad2d2-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.004@demo.local', 'Demo@004Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad2db-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.005@demo.local', 'Demo@005Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad2e4-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.006@demo.local', 'Demo@006Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad306-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.007@demo.local', 'Demo@007Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad310-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.008@demo.local', 'Demo@008Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad319-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.009@demo.local', 'Demo@009Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad321-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.010@demo.local', 'Demo@010Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad32c-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.011@demo.local', 'Demo@011Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad335-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.012@demo.local', 'Demo@012Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad33e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.013@demo.local', 'Demo@013Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad348-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.014@demo.local', 'Demo@014Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad351-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.015@demo.local', 'Demo@015Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad35a-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.016@demo.local', 'Demo@016Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad363-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.017@demo.local', 'Demo@017Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad36c-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.018@demo.local', 'Demo@018Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad376-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.019@demo.local', 'Demo@019Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('99fad37e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1m.020@demo.local', 'Demo@020Cv1m', 'Tài khoản demo', '2026-10-01 09:29:29.216'),
('9a002365-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.001@demo.local', 'Demo@001Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a002399-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.002@demo.local', 'Demo@002Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023a5-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.003@demo.local', 'Demo@003Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023af-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.004@demo.local', 'Demo@004Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023b8-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.005@demo.local', 'Demo@005Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023c2-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.006@demo.local', 'Demo@006Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023e5-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.007@demo.local', 'Demo@007Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023ef-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.008@demo.local', 'Demo@008Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0023f8-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.009@demo.local', 'Demo@009Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a002401-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b1ed-adca-11f1-9aef-2c4d54c30ca8', 'canvapro1y.010@demo.local', 'Demo@010Cv1y', 'Tài khoản demo', '2026-10-01 09:29:29.255'),
('9a0673f6-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.001@demo.local', 'Demo@001Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067448-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.002@demo.local', 'Demo@002Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067464-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.003@demo.local', 'Demo@003Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a06747e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.004@demo.local', 'Demo@004Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067497-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.005@demo.local', 'Demo@005Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a0674af-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.006@demo.local', 'Demo@006Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a0674eb-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.007@demo.local', 'Demo@007Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067505-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.008@demo.local', 'Demo@008Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a06751e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.009@demo.local', 'Demo@009Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067535-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.010@demo.local', 'Demo@010Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a06754f-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.011@demo.local', 'Demo@011Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067567-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.012@demo.local', 'Demo@012Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a067580-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.013@demo.local', 'Demo@013Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a06759a-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.014@demo.local', 'Demo@014Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a0675b2-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b320-adca-11f1-9aef-2c4d54c30ca8', 'gptplus.015@demo.local', 'Demo@015Gpt', 'Tài khoản demo', '2026-10-01 09:29:29.296'),
('9a0dff04-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.001@demo.local', 'Demo@001Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dff55-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.002@demo.local', 'Demo@002Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dff71-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.003@demo.local', 'Demo@003Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dff8c-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.004@demo.local', 'Demo@004Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dffa3-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.005@demo.local', 'Demo@005Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dffbd-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.006@demo.local', 'Demo@006Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0dfffd-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.007@demo.local', 'Demo@007Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0016-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.008@demo.local', 'Demo@008Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0030-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.009@demo.local', 'Demo@009Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0049-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.010@demo.local', 'Demo@010Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0066-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.011@demo.local', 'Demo@011Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e007f-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.012@demo.local', 'Demo@012Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0097-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.013@demo.local', 'Demo@013Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e00b1-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.014@demo.local', 'Demo@014Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e00ca-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.015@demo.local', 'Demo@015Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e00e3-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.016@demo.local', 'Demo@016Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e00fc-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.017@demo.local', 'Demo@017Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0116-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.018@demo.local', 'Demo@018Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e012f-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.019@demo.local', 'Demo@019Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e014a-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.020@demo.local', 'Demo@020Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0164-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.021@demo.local', 'Demo@021Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e017e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.022@demo.local', 'Demo@022Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e01ba-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.023@demo.local', 'Demo@023Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e01d4-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.024@demo.local', 'Demo@024Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e01ee-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.025@demo.local', 'Demo@025Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0206-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.026@demo.local', 'Demo@026Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e021e-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.027@demo.local', 'Demo@027Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0237-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.028@demo.local', 'Demo@028Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e0250-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.029@demo.local', 'Demo@029Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345'),
('9a0e026a-bd7a-11f1-8d70-2c4d54c30ca8', '5bd2b3ac-adca-11f1-9aef-2c4d54c30ca8', 'capcutpro.030@demo.local', 'Demo@030Cc', 'Tài khoản demo', '2026-10-01 09:29:29.345');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_history`
--

CREATE TABLE `purchase_history` (
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
  `expiresAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_history`
--

INSERT INTO `purchase_history` (`id`, `userId`, `orderId`, `productId`, `productName`, `accountUsername`, `accountPassword`, `accountNote`, `unitPrice`, `purchasedAt`, `expiresAt`) VALUES
('eba2342d-a740-4a9d-a01e-493c4ae410c3', '626482d4-e3e6-4844-bf8a-d0161b1992c9', '42f7e2db-3e2f-417d-b7b4-e2d78498cb84', '5bd29faf-adca-11f1-9aef-2c4d54c30ca8', 'Canva Pro 1 tháng', 'canvapro1m.001@demo.local', 'Demo@001Cv1m', 'Tài khoản demo', 49000, '2026-10-01 09:34:06.015', '2026-10-08 09:34:06.015');

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
('626482d4-e3e6-4844-bf8a-d0161b1992c9', 'Trần Anh Tuấn', 'trananhtuan222@gmail.com', '$2a$10$wSkx9IRSvmXzODwWM17tZOBQVNBuDi0HB8yS0XKYqIhdFao0fnvwS', '2026-09-13 05:12:29.823', '2026-10-01 09:34:05.986', 51000, NULL, 'BUYER'),
('73d54169-9161-45f1-8479-18f280f856f1', 'Em Thanh', 'thanhtrick2k5@gmail.com', '$2a$10$WzWgvkgJK5bS3mcHvrz75erWOPaLtJwzeyK9ffbmx2e4xVhql1F4W', '2026-09-11 11:42:02.521', '2026-09-14 14:53:25.535', 0, NULL, 'ADMIN');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
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
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `userId`, `type`, `status`, `amount`, `balanceAfter`, `orderId`, `description`, `transactionId`, `rawResponse`, `createdAt`, `updatedAt`) VALUES
('184f3ab5-6cfb-48a2-a047-fcc5ba373fae', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 'PURCHASE', 'SUCCESS', 49000, 51000, '42f7e2db-3e2f-417d-b7b4-e2d78498cb84', 'Thanh toán đơn hàng #42f7e2db', NULL, NULL, '2026-10-01 09:34:05.990', '2026-10-01 09:34:05.990'),
('c70131ad-a9e5-470a-ba2f-75a7cea43f08', '626482d4-e3e6-4844-bf8a-d0161b1992c9', 'TOPUP', 'SUCCESS', 100000, 100000, NULL, 'Nạp tiền vào ví qua MoMo', 'DEV-1790847233133', '{\"dev\":true}', '2026-10-01 09:33:53.106', '2026-10-01 09:33:53.152');

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
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_userId_idx` (`userId`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_idx` (`orderId`),
  ADD KEY `order_items_productId_idx` (`productId`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_orderId_key` (`orderId`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_accounts`
--
ALTER TABLE `product_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_accounts_productId_idx` (`productId`);

--
-- Chỉ mục cho bảng `purchase_history`
--
ALTER TABLE `purchase_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_history_userId_idx` (`userId`),
  ADD KEY `purchase_history_orderId_idx` (`orderId`),
  ADD KEY `purchase_history_expiresAt_idx` (`expiresAt`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Chỉ mục cho bảng `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_transactions_userId_idx` (`userId`),
  ADD KEY `wallet_transactions_orderId_idx` (`orderId`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`);

--
-- Các ràng buộc cho bảng `product_accounts`
--
ALTER TABLE `product_accounts`
  ADD CONSTRAINT `product_accounts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `purchase_history`
--
ALTER TABLE `purchase_history`
  ADD CONSTRAINT `purchase_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `purchase_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `wallet_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
