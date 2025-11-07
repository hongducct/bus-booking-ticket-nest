# Quick Start Guide

## Bắt đầu nhanh với PostgreSQL

### 1. Cài đặt PostgreSQL

Đảm bảo bạn đã cài đặt PostgreSQL trên máy. Nếu chưa có:
- Windows: Download từ [postgresql.org](https://www.postgresql.org/download/windows/)
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### 2. Tạo Database

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE bus_ticket_db;

# Thoát
\q
```

### 3. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật `DATABASE_URL` trong file `.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bus_ticket_db
```

**Lưu ý:** Thay `your_password` bằng password PostgreSQL của bạn.

### 4. Cài đặt Dependencies

```bash
npm install --legacy-peer-deps
```

### 5. Chạy Migrations

```bash
# Chạy tất cả migrations để tạo tables
npm run migration:run
```

### 6. Seed Database (Tùy chọn)

```bash
# Thêm dữ liệu mẫu
npm run seed
```

### 7. Chạy Server

```bash
# Development mode
npm run start:dev

# Server sẽ chạy tại http://localhost:3000
```

## Troubleshooting

### Lỗi kết nối database

- Kiểm tra PostgreSQL đang chạy: `pg_isready`
- Kiểm tra `DATABASE_URL` trong `.env` đúng chưa
- Đảm bảo database đã được tạo

### Lỗi migration

- Xóa database và tạo lại: `DROP DATABASE bus_ticket_db; CREATE DATABASE bus_ticket_db;`
- Chạy lại migrations: `npm run migration:run`

### Lỗi UUID extension

PostgreSQL cần extension `uuid-ossp`. Migration sẽ tự động tạo, nhưng nếu lỗi:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Next Steps

- Xem [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) để biết cách quản lý migrations
- Xem [README.md](./README.md) để biết các API endpoints
- Xem [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) để tích hợp với frontend

