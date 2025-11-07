# Troubleshooting Guide

## Lỗi 500 Internal Server Error

### Cách xem lỗi chi tiết

1. **Xem logs trong console của backend:**
   - Khi chạy `npm run start:dev`, tất cả errors sẽ hiển thị trong console
   - Tìm dòng có "Exception caught:" hoặc "Error in search trips:"

2. **Xem error message trong response:**
   - Response sẽ có field `error` chứa stack trace (trong development mode)
   - Field `message` sẽ có thông báo lỗi cụ thể

### Các lỗi thường gặp và cách fix

#### 1. Lỗi: "Stations not found"

**Nguyên nhân:** Tên station không khớp với database

**Cách fix:**
```bash
# Kiểm tra danh sách stations
curl http://localhost:3000/api/stations

# Hoặc trong PostgreSQL
psql -U postgres -d bus_ticket_db
SELECT name FROM stations;
```

**Lưu ý:** Tên station phải chính xác (case-insensitive), ví dụ:
- ✅ "Hồ Chí Minh" 
- ✅ "hồ chí minh" (sẽ tự động match)
- ❌ "Ho Chi Minh" (không match)

#### 2. Lỗi: "No trips found" hoặc empty array

**Nguyên nhân:** 
- Date không khớp với trips trong database
- Chưa có trips cho route đó

**Cách fix:**
```bash
# Kiểm tra trips trong database
psql -U postgres -d bus_ticket_db
SELECT date, COUNT(*) FROM trips GROUP BY date ORDER BY date;

# Xem trips cho route cụ thể
SELECT t.date, t."departureTime", s1.name as from_station, s2.name as to_station 
FROM trips t
JOIN stations s1 ON t."from_station_id" = s1.id
JOIN stations s2 ON t."to_station_id" = s2.id
WHERE s1.name = 'Hồ Chí Minh' AND s2.name = 'Đà Lạt'
ORDER BY t.date;
```

**Giải pháp:**
- Seed lại data: `npm run seed`
- Hoặc search với date có trong database

#### 3. Lỗi: Database connection

**Nguyên nhân:** Không kết nối được PostgreSQL

**Cách fix:**
```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready

# Kiểm tra DATABASE_URL trong .env
echo $DATABASE_URL

# Test kết nối
psql $DATABASE_URL -c "SELECT 1"
```

#### 4. Lỗi: SQL syntax error

**Nguyên nhân:** Query SQL không đúng syntax

**Cách fix:**
- Xem logs trong console để biết query SQL cụ thể
- Kiểm tra TypeORM version compatibility

### Debug Steps

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:3000/api/stations
   ```

2. **Kiểm tra database có data:**
   ```bash
   # Trong PostgreSQL
   SELECT COUNT(*) FROM stations;
   SELECT COUNT(*) FROM trips;
   ```

3. **Test search với date hôm nay:**
   ```bash
   # Windows PowerShell
   $today = (Get-Date).ToString("yyyy-MM-dd")
   curl "http://localhost:3000/api/trips/search?from=Hồ Chí Minh&to=Đà Lạt&date=$today"
   ```

4. **Xem logs chi tiết:**
   - Backend console sẽ log:
     - Stations found/not found
     - Available stations list
     - Search query details
     - Number of trips found

### Test với Swagger

1. Mở: `http://localhost:3000/api/docs`
2. Vào **trips** → **GET /api/trips/search**
3. Click **Try it out**
4. Điền parameters và xem response
5. Nếu có lỗi, sẽ hiển thị chi tiết trong response

### Common Solutions

**Nếu vẫn lỗi 500:**
1. Restart backend: `Ctrl+C` rồi `npm run start:dev`
2. Kiểm tra logs trong console
3. Đảm bảo đã chạy migrations: `npm run migration:run`
4. Đảm bảo đã seed data: `npm run seed`
5. Kiểm tra PostgreSQL đang chạy

**Nếu search trả về empty array:**
1. Kiểm tra date format: `YYYY-MM-DD`
2. Kiểm tra tên stations có đúng không
3. Kiểm tra database có trips cho date đó không
4. Thử search với date khác (hôm nay, ngày mai)

