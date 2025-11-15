# Hướng dẫn Setup Backend

## 1. Cài đặt Dependencies

```bash
npm install
```

## 2. Cấu hình Database

Tạo file `.env` với nội dung:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bus_ticket_db
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

## 3. Chạy Migrations

```bash
# Chạy tất cả migrations
npm run migration:run

# Xem trạng thái migrations
npm run migration:show
```

## 4. Tạo Admin User

```bash
npm run create-admin
```

Sau khi chạy, bạn sẽ có:
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Lưu ý**: Đổi mật khẩu sau lần đăng nhập đầu tiên!

## 5. Seed Database (Optional)

```bash
npm run seed
```

## 6. Chạy Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 7. API Documentation

Sau khi chạy server, truy cập:
- Swagger UI: `http://localhost:3000/api/docs`

## 8. API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Statistics (Chỉ Admin)
- `GET /api/statistics/dashboard` - Thống kê tổng quan
- `GET /api/statistics/revenue?startDate=...&endDate=...` - Doanh thu theo khoảng thời gian
- `GET /api/statistics/top-routes?limit=10` - Top tuyến đường
- `GET /api/statistics/users-by-role` - Số lượng user theo role

### Bookings
- `GET /api/bookings` - Lấy danh sách bookings (user chỉ thấy của mình, admin thấy tất cả)
- `POST /api/bookings` - Tạo booking mới
- `GET /api/bookings/search?orderId=...&email=...` - Tìm kiếm booking

### Trips
- `GET /api/trips/search?from=...&to=...&date=...` - Tìm kiếm chuyến xe

### Stations
- `GET /api/stations` - Lấy danh sách trạm dừng

## 9. Roles

- **USER**: Người dùng thông thường, chỉ xem được bookings của chính mình
- **ADMIN**: Quản trị viên, xem được tất cả bookings và truy cập thống kê

## 10. Troubleshooting

### Migration không chạy được
```bash
# Kiểm tra kết nối database
# Đảm bảo DATABASE_URL đúng trong .env
npm run migration:show
```

### Không đăng nhập được
- Kiểm tra xem bảng `users` đã được tạo chưa
- Chạy lại migration: `npm run migration:run`
- Tạo lại admin: `npm run create-admin`

