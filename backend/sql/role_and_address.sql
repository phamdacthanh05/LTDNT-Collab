-- Import file này vào phpMyAdmin: mở database `ltdnt-group` → tab Import → chọn file này → Go
-- File này CHỈ bổ sung (không xoá/sửa dữ liệu cũ):
--   1. Thêm cột `address` (địa chỉ giao hàng) vào bảng users đã có sẵn
--   2. Thêm cột `role` (ADMIN | BUYER) vào bảng users, mặc định BUYER cho toàn bộ user hiện tại
--
-- Chạy sau khi đã có sql/init.sql và sql/chat_and_profile.sql.
-- Lưu ý: không dùng "AFTER `phone`" vì DB thực tế không có cột phone; 2 cột mới sẽ được
-- thêm vào cuối bảng — vị trí cột không ảnh hưởng gì đến hoạt động của ứng dụng.

ALTER TABLE `users`
  ADD COLUMN `address` TEXT NULL;

ALTER TABLE `users`
  ADD COLUMN `role` ENUM('ADMIN', 'BUYER') NOT NULL DEFAULT 'BUYER';

-- Sau khi chạy xong, chọn 1 tài khoản làm ADMIN duy nhất (chủ shop) bằng lệnh dưới,
-- đổi email cho đúng tài khoản bạn muốn dùng làm Admin:
-- UPDATE `users` SET `role` = 'ADMIN' WHERE `email` = 'email-cua-ban@example.com';
