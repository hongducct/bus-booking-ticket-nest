# Hướng dẫn Debug API

## Vấn đề: Search không trả về kết quả

### 1. Kiểm tra Database có dữ liệu chưa

```bash
# Kết nối PostgreSQL
psql -U postgres -d bus_ticket_db

# Kiểm tra stations
SELECT * FROM stations;

# Kiểm tra trips
SELECT id, "fromStationId", "toStationId", date, "departureTime" FROM trips LIMIT 5;

# Kiểm tra số lượng trips
SELECT COUNT(*) FROM trips;
```

### 2. Kiểm tra tên Station

Tên station phải khớp chính xác (case-insensitive). Xem danh sách:

```bash
# API call
curl http://localhost:3000/api/stations
```

Hoặc trong Swagger: `http://localhost:3000/api/docs` → Stations → GET /api/stations

### 3. Kiểm tra Date Format

Date phải format: `YYYY-MM-DD` (ví dụ: `2025-01-15`)

**Lưu ý:** Seed data tạo trips với date = ngày mai. Nếu bạn search với date hôm nay sẽ không có kết quả.

### 4. Test Search với Date đúng

```bash
# Lấy ngày mai
# Windows PowerShell
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
echo $tomorrow

# Sau đó test với date đó
curl "http://localhost:3000/api/trips/search?from=Hồ Chí Minh&to=Đà Lạt&date=$tomorrow"
```

### 5. Xem Logs trong Console

Khi search, backend sẽ log:
- Tên stations tìm được
- Available stations nếu không tìm thấy
- Search query details

Kiểm tra console của backend để xem logs.

### 6. Test trực tiếp trong Swagger

1. Mở: `http://localhost:3000/api/docs`
2. Vào section **trips**
3. Chọn **GET /api/trips/search**
4. Click **Try it out**
5. Điền parameters:
   - from: `Hồ Chí Minh`
   - to: `Đà Lạt`
   - date: `2025-11-09` (hoặc ngày mai)
   - passengers: `1`
6. Click **Execute**

### 7. Kiểm tra lại Seed Data

Nếu không có data, chạy lại seed:

```bash
npm run seed
```

**Lưu ý:** Seed tạo trips với date = ngày mai. Nếu bạn muốn test với date khác, cần:
1. Sửa seed.ts để tạo trips với date cụ thể
2. Hoặc tạo trips mới qua API

### 8. Tạo Trip mới để test

```bash
# Lấy station IDs trước
curl http://localhost:3000/api/stations

# Sau đó tạo trip qua API (cần implement endpoint này) hoặc trực tiếp trong database
```

## Swagger Documentation

Truy cập: `http://localhost:3000/api/docs`

Tại đây bạn có thể:
- Xem tất cả API endpoints
- Test API trực tiếp
- Xem request/response schemas
- Xem examples

## Common Issues

### Issue 1: "Stations not found"
**Nguyên nhân:** Tên station không khớp
**Giải pháp:** 
- Kiểm tra danh sách stations: `GET /api/stations`
- Sử dụng tên chính xác (case-insensitive)

### Issue 2: "No trips found"
**Nguyên nhân:** 
- Date không khớp với trips trong database
- Chưa có trips cho route đó
**Giải pháp:**
- Kiểm tra trips trong database
- Seed lại data với date phù hợp

### Issue 3: "Empty array returned"
**Nguyên nhân:** Filters quá strict
**Giải pháp:**
- Bỏ filters (minPrice, maxPrice) để test
- Kiểm tra date format

