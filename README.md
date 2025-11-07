# Bus Ticket Booking API

Backend API cho hệ thống đặt vé xe khách, được xây dựng với NestJS và TypeORM. hongducct

## Tính năng

- 🔍 Tìm kiếm chuyến xe theo điểm đi, điểm đến, ngày đi
- 🎫 Quản lý ghế ngồi (chọn ghế, giữ ghế, đặt ghế)
- 📝 Đặt vé và quản lý đơn hàng
- 🔎 Tra cứu vé theo mã đơn hàng, số điện thoại, email
- 🚌 Quản lý nhà xe, tuyến đường, trạm dừng
- 💳 Hỗ trợ nhiều phương thức thanh toán

## Công nghệ sử dụng

- **NestJS** - Framework Node.js
- **TypeORM** - ORM cho database
- **PostgreSQL** - Database
- **class-validator** - Validation cho DTOs
- **TypeScript** - Ngôn ngữ lập trình

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Cấu hình Database
Tạo file `.env` từ `.env.example`:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/bus_ticket_db
PORT=3000
NODE_ENV=development
```

### 3. Chạy Migrations
```bash
# Chạy tất cả migrations
npm run migration:run

# Xem trạng thái migrations
npm run migration:show
```

### 4. Seed Database (tùy chọn)
```bash
npm run seed
```

### 5. Chạy ứng dụng
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Migration Commands

- `npm run migration:generate src/database/migrations/Name` - Tạo migration từ entities
- `npm run migration:create src/database/migrations/Name` - Tạo migration file trống
- `npm run migration:run` - Chạy tất cả migrations
- `npm run migration:revert` - Revert migration cuối cùng
- `npm run migration:show` - Xem trạng thái migrations
- `npm run seed` - Seed dữ liệu mẫu

Xem chi tiết trong [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## API Endpoints

### Trips (Chuyến xe)

- `GET /api/trips/search?from=...&to=...&date=...&passengers=...` - Tìm kiếm chuyến xe
- `GET /api/trips/:id` - Lấy thông tin chi tiết chuyến xe
- `GET /api/trips/:id/seats` - Lấy danh sách ghế của chuyến xe
- `POST /api/trips/:id/seats/hold` - Giữ ghế (body: `{ seatIds: string[] }`)
- `POST /api/trips/:id/seats/release` - Giải phóng ghế (body: `{ seatIds: string[] }`)

### Bookings (Đặt vé)

- `POST /api/bookings` - Tạo đơn đặt vé
- `GET /api/bookings` - Lấy danh sách đơn hàng
- `GET /api/bookings/:id` - Lấy thông tin đơn hàng
- `GET /api/bookings/search?query=...` - Tìm kiếm đơn hàng
- `PUT /api/bookings/:id/cancel` - Hủy đơn hàng
- `PUT /api/bookings/:id/payment` - Cập nhật phương thức thanh toán

### Stations (Trạm dừng)

- `GET /api/stations` - Lấy danh sách trạm dừng
- `GET /api/stations/popular-routes` - Lấy danh sách tuyến đường phổ biến

## Cấu trúc Database

### Entities

- **Station** - Trạm dừng (bến xe)
- **BusCompany** - Nhà xe
- **Trip** - Chuyến xe
- **Seat** - Ghế ngồi
- **Booking** - Đơn đặt vé
- **BookingSeat** - Ghế trong đơn đặt vé

### Migrations

Database sử dụng TypeORM migrations để quản lý schema. Tất cả migrations được lưu trong `src/database/migrations/`.

**Lưu ý:** `synchronize: false` trong production - chỉ sử dụng migrations.

## Dữ liệu mẫu

Chạy `npm run seed` để seed dữ liệu mẫu bao gồm:
- 9 trạm dừng
- 6 nhà xe
- 8 chuyến xe mẫu
- Ghế ngồi cho mỗi chuyến xe

## Kết nối Frontend

Backend đã được cấu hình CORS để kết nối với frontend React tại:
- `http://localhost:5173`
- `http://localhost:3000`
- `http://localhost:5174`

## Port mặc định

Server chạy tại port **3000** (có thể thay đổi qua biến môi trường `PORT`)

## Tài liệu tham khảo

- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn bắt đầu nhanh
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn quản lý migrations
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Hướng dẫn tích hợp frontend

## Lưu ý

- **Database:** Sử dụng PostgreSQL, cần tạo database trước khi chạy migrations
- **Migrations:** Luôn chạy migrations trước khi start app (`npm run migration:run`)
- **Synchronize:** Đã tắt (`synchronize: false`) - chỉ sử dụng migrations trong production
- **Seed:** Chạy `npm run seed` để thêm dữ liệu mẫu sau khi migrations
