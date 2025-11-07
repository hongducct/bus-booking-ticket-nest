# API Documentation

Base URL: `http://localhost:3000/api`

## 📋 Danh sách API Endpoints

### 1. Trips (Chuyến xe)

#### Tìm kiếm chuyến xe
```
GET /trips/search
```

**Query Parameters:**
- `from` (required): Điểm đi (ví dụ: "Hồ Chí Minh")
- `to` (required): Điểm đến (ví dụ: "Đà Lạt")
- `date` (required): Ngày đi (format: YYYY-MM-DD)
- `passengers` (optional): Số hành khách (default: 1)
- `minPrice` (optional): Giá tối thiểu
- `maxPrice` (optional): Giá tối đa
- `busType` (optional): Loại xe (seat, sleeper, limousine)
- `timeSlot` (optional): Khung giờ (morning, afternoon, evening)
- `sortBy` (optional): Sắp xếp (price, time, rating)

**Example:**
```
GET /api/trips/search?from=Hồ Chí Minh&to=Đà Lạt&date=2025-01-15&passengers=1
```

**Response:**
```json
[
  {
    "id": "uuid",
    "company": {
      "id": "uuid",
      "name": "BX Nam Nghĩa - Quảng Bình",
      "rating": 4.8
    },
    "fromStation": {
      "id": "uuid",
      "name": "Hồ Chí Minh",
      "city": "Hồ Chí Minh"
    },
    "toStation": {
      "id": "uuid",
      "name": "Đà Lạt",
      "city": "Đà Lạt"
    },
    "date": "2025-01-15",
    "departureTime": "08:00",
    "arrivalTime": "14:40",
    "duration": 400,
    "price": "250000.00",
    "busType": "sleeper",
    "totalSeats": 36,
    "availableSeats": 28,
    "amenities": ["Wifi", "Nước uống", "Điều hòa", "Giường nằm"]
  }
]
```

#### Lấy thông tin chi tiết chuyến xe
```
GET /trips/:id
```

**Example:**
```
GET /api/trips/123e4567-e89b-12d3-a456-426614174000
```

#### Lấy danh sách ghế của chuyến xe
```
GET /trips/:id/seats
```

**Response:**
```json
[
  {
    "id": "uuid",
    "tripId": "uuid",
    "number": "A1",
    "row": 0,
    "floor": 1,
    "status": "available",
    "holdUntil": null
  }
]
```

#### Giữ ghế
```
POST /trips/:id/seats/hold
```

**Body:**
```json
{
  "seatIds": ["uuid1", "uuid2"]
}
```

#### Giải phóng ghế
```
POST /trips/:id/seats/release
```

**Body:**
```json
{
  "seatIds": ["uuid1", "uuid2"]
}
```

---

### 2. Bookings (Đặt vé)

#### Tạo đơn đặt vé
```
POST /bookings
```

**Body:**
```json
{
  "tripId": "uuid",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerEmail": "email@example.com",
  "pickupPoint": "Bến xe Miền Đông",
  "dropoffPoint": "Bến xe Đà Lạt",
  "seats": [
    { "seatId": "uuid1" },
    { "seatId": "uuid2" }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "orderId": "VX1734567890123",
  "trip": { ... },
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "totalPrice": "500000.00",
  "status": "pending",
  "bookingDate": "2025-01-10T10:00:00.000Z"
}
```

#### Lấy danh sách đơn hàng
```
GET /bookings
```

#### Lấy thông tin đơn hàng
```
GET /bookings/:id
```

#### Tìm kiếm đơn hàng
```
GET /bookings/search?query=VX1234567890
```

**Query Parameters:**
- `query`: Mã đơn hàng, số điện thoại hoặc email

#### Hủy đơn hàng
```
PUT /bookings/:id/cancel
```

#### Cập nhật phương thức thanh toán
```
PUT /bookings/:id/payment
```

**Body:**
```json
{
  "paymentMethod": "momo"
}
```

**Payment Methods:** `momo`, `bank`, `card`, `cash`

---

### 3. Stations (Trạm dừng)

#### Lấy danh sách trạm dừng
```
GET /stations
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Hồ Chí Minh",
    "city": "Hồ Chí Minh",
    "address": "Bến xe Miền Đông"
  }
]
```

#### Lấy danh sách tuyến đường phổ biến
```
GET /stations/popular-routes
```

---

## 🧪 Cách Test API

### 1. Sử dụng cURL

```bash
# Tìm kiếm chuyến xe
curl "http://localhost:3000/api/trips/search?from=Hồ Chí Minh&to=Đà Lạt&date=2025-01-15"

# Lấy danh sách trạm
curl "http://localhost:3000/api/stations"

# Tạo đơn đặt vé
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "uuid",
    "customerName": "Test User",
    "customerPhone": "0901234567",
    "seats": [{"seatId": "uuid"}]
  }'
```

### 2. Sử dụng Postman/Insomnia

Import file `postman_collection.json` (sẽ tạo sau) hoặc tạo request thủ công với các endpoint trên.

### 3. Sử dụng Browser

Mở browser và truy cập:
- `http://localhost:3000/api/stations`
- `http://localhost:3000/api/trips/search?from=Hồ Chí Minh&to=Đà Lạt&date=2025-01-15`

### 4. Sử dụng Swagger (nếu có)

Nếu đã cài Swagger, truy cập: `http://localhost:3000/api/docs`

---

## 📝 Lưu ý

- Tất cả dates phải format: `YYYY-MM-DD`
- Tất cả times phải format: `HH:mm`
- UUIDs được tự động generate
- CORS đã được enable cho frontend
- Validation được áp dụng cho tất cả requests

