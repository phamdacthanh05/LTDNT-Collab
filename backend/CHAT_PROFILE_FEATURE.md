> **Cập nhật v2:** các API `/api/chat/admin/*` không còn dùng `x-admin-secret` nữa mà dùng JWT của tài khoản role `ADMIN` (xem `../HUONG_DAN_V2.md`). Biến `ADMIN_SECRET` không còn cần thiết.

# Tính năng mới: Trang cá nhân & Tin nhắn trong app

File này mô tả riêng phần vừa thêm — không thay thế `README.md` gốc.

## 1. Cập nhật database

Import file `sql/chat_and_profile.sql` vào phpMyAdmin (giống cách bạn đã làm với `sql/init.sql`):
mở database → tab **Import** → chọn file → **Go**.

File này sẽ:
- Thêm cột `walletBalance` vào bảng `users` (mặc định = 0, KHÔNG mất dữ liệu user cũ)
- Tạo 2 bảng mới: `conversations`, `messages`

## 2. Thêm 1 dòng vào file `.env` (tự thêm, mình không tự sửa `.env` của bạn)

Mở file `.env`, thêm dòng này vào cuối:

```
ADMIN_SECRET="doi-thanh-chuoi-bi-mat-rieng-cua-ban"
```

Dòng này dùng để bảo vệ các API phía Admin/Shop (trả lời tin nhắn) — chưa có hệ thống tài khoản Admin riêng nên tạm dùng 1 "mã bí mật" cho nhanh.

## 3. Sinh lại Prisma Client

```bash
npx prisma generate
```

(Không cần `migrate` vì bạn import SQL tay ở bước 1 rồi.)

## 4. Các API mới

**Trang cá nhân** (cần đăng nhập, gắn `Authorization: Bearer <token>`):
- `GET /api/profile/me` — thông tin tài khoản + số dư ví
- `PUT /api/profile/me` — body `{ fullName?, phone? }`
- `PUT /api/profile/change-password` — body `{ oldPassword, newPassword }`
- `GET /api/profile/orders` — lịch sử đơn hàng

**Tin nhắn (phía người mua — cần đăng nhập)**:
- `POST /api/chat/conversations` — body `{ message, productId?, orderId?, subject? }`
- `GET /api/chat/conversations` — danh sách hội thoại của tôi
- `GET /api/chat/conversations/:id` — chi tiết 1 hội thoại
- `POST /api/chat/conversations/:id/messages` — body `{ content }`

**Tin nhắn (phía Admin/Shop — test bằng Postman, không có UI)**:
Thêm header `x-admin-secret: <giá trị ADMIN_SECRET trong .env>` vào các request:
- `GET /api/chat/admin/conversations` — xem tất cả hội thoại
- `GET /api/chat/admin/conversations/:id` — xem chi tiết 1 hội thoại bất kỳ
- `POST /api/chat/admin/conversations/:id/messages` — body `{ content }` — trả lời khách

## 5. Cách vào 2 màn hình mới trên app (web)

App hiện chưa có thanh điều hướng (tab bar) nối tới 2 màn hình này (vì không được sửa file cũ),
nên khi chạy `npx expo start --web`, bạn gõ thẳng vào thanh địa chỉ trình duyệt:

- `http://localhost:8081/profile` — trang cá nhân
- `http://localhost:8081/chat` — danh sách tin nhắn

(đổi cổng `8081` theo cổng thực tế Expo báo khi bạn chạy `npx expo start --web`)

Khi nào bạn muốn, mình có thể làm thêm 1 thanh tab bar điều hướng (Trang chủ / Sản phẩm / Tin nhắn / Cá nhân) — việc đó cần sửa `_layout.tsx` nên phải có sự đồng ý của bạn trước vì nó đụng vào file cũ.
