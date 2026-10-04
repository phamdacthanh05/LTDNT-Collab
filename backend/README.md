# Digital Resources – Backend

# Digital Resources – Backend

Node.js + Express + MySQL (qua Prisma ORM, quản lý bằng phpMyAdmin) + JWT auth + MoMo (đã loại bỏ VNPay). Xem thêm `../HUONG_DAN_V2.md` cho các chức năng mới.

## Cài đặt

1. **Cài Laragon** (laragon.org, chọn bản Full) hoặc XAMPP — tự động cài sẵn MySQL + phpMyAdmin.
2. Mở Laragon, bấm **Start All** để chạy MySQL.
3. Mở trình duyệt vào `http://localhost/phpmyadmin`, bấm **New** ở cột trái, đặt tên database là `digital_resources`, bấm Create. (Chỉ cần tạo database rỗng — các bảng bên trong sẽ do Prisma tự tạo ở bước dưới, không cần tạo tay.)
4. **Cách nhanh nhất (khuyên dùng nếu bạn quen phpMyAdmin):** vào phpMyAdmin → mở database `ltdnt-group` (hoặc tên bạn đặt) → tab **Import** → chọn file `sql/init.sql` có sẵn trong thư mục này → bấm **Go**. File này tự tạo 2 bảng `users`, `products` (kèm vài sản phẩm mẫu), không cần gõ lệnh gì cả.

   Sau đó trong thư mục backend chỉ cần chạy:
   ```bash
   npm install
   npx prisma generate   # chỉ sinh code Prisma Client, KHÔNG đụng vào database, chạy rất nhanh
   npm run dev
   ```

   **Cách khác (dùng lệnh, tự động hơn):** thay vì import SQL, chạy `npx prisma migrate dev --name init` — lệnh này tự tạo bảng y hệt file SQL trên, nhưng đọc trực tiếp từ `prisma/schema.prisma`. Dùng cách nào cũng được, không cần làm cả hai.

5. Quay lại phpMyAdmin, mở database `digital_resources` → bạn sẽ thấy các bảng `users`, `products`, `orders`, `order_items`, `payments` đã được Prisma tự tạo. Từ giờ bạn có thể **thêm/sửa dữ liệu (vd thêm sản phẩm) trực tiếp trong phpMyAdmin như bình thường**, hoặc dùng `npx prisma studio` (giao diện tương tự nhưng đẹp hơn, hiểu quan hệ giữa các bảng tốt hơn).

> Muốn dùng PostgreSQL/Supabase thay vì MySQL: đổi `provider = "mysql"` thành `"postgresql"` trong `prisma/schema.prisma`, và đổi `DATABASE_URL` sang dạng `postgresql://...`.

## Test nhanh bằng curl

```bash
# Đăng ký
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyen Van A","email":"a@test.com","password":"123456"}'

# Đăng nhập
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"123456"}'
```

## Thanh toán MoMo khi dev local

MoMo cần gọi ngược (IPN/return) về server của bạn, nên `localhost` sẽ
không nhận được callback (backend đã có API `/api/payments/momo/sync` tự hỏi MoMo để bù lại). Khi test trên điện thoại thật, dùng **ngrok**:

```bash
ngrok http 4000
# copy URL https://xxxx.ngrok-free.app, cập nhật vào MOMO_IPN_URL,
# MOMO_REDIRECT_URL trong .env rồi restart server
```

## Việc cần làm tiếp theo

- [ ] Thêm route admin để thêm/sửa/xoá sản phẩm (hiện tại phải thêm trực tiếp qua `npx prisma studio`)
- [ ] Sau khi `Payment.status = SUCCESS`, tự động gửi thông tin sản phẩm (tài khoản/license key) cho khách qua email hoặc trong app
- [ ] Đăng ký tài khoản merchant thật với MoMo khi ra production (khác với sandbox)
- [ ] Thêm rate-limiting cho `/api/auth/login` để chống brute-force
