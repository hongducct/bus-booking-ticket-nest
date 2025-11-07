# Hướng dẫn Migration Database

## Cài đặt

1. Đảm bảo đã cài đặt PostgreSQL và có database đã tạo
2. Tạo file `.env` từ `.env.example` và cập nhật `DATABASE_URL`

```bash
cp .env.example .env
```

3. Cập nhật `DATABASE_URL` trong file `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/bus_ticket_db
```

## Chạy Migrations

### 1. Chạy tất cả migrations
```bash
npm run migration:run
```

### 2. Xem trạng thái migrations
```bash
npm run migration:show
```

### 3. Revert migration cuối cùng
```bash
npm run migration:revert
```

### 4. Tạo migration mới (sau khi thay đổi entities)
```bash
npm run migration:generate src/database/migrations/YourMigrationName
```

### 5. Tạo migration file trống
```bash
npm run migration:create src/database/migrations/YourMigrationName
```

## Seed Database

Sau khi chạy migrations, seed dữ liệu mẫu:

```bash
npm run seed
```

Hoặc set `SEED_DB=true` trong `.env` để tự động seed khi khởi động (chỉ development).

## Quy trình làm việc

1. **Lần đầu setup:**
   ```bash
   # 1. Tạo database trong PostgreSQL
   createdb bus_ticket_db
   
   # 2. Chạy migrations
   npm run migration:run
   
   # 3. Seed dữ liệu
   npm run seed
   ```

2. **Khi thay đổi entities:**
   ```bash
   # 1. Generate migration từ entities
   npm run migration:generate src/database/migrations/AddNewField
   
   # 2. Review migration file được tạo
   # 3. Chạy migration
   npm run migration:run
   ```

3. **Production:**
   - Đảm bảo `synchronize: false` trong `app.module.ts`
   - Chỉ sử dụng migrations, không dùng `synchronize: true`
   - Chạy migrations trước khi start app

## Lưu ý

- Migration files được lưu trong `src/database/migrations/`
- Không chỉnh sửa migration đã chạy trong production
- Luôn backup database trước khi chạy migrations trong production
- Sử dụng `migration:revert` để rollback nếu cần

