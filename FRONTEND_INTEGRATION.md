# Hướng dẫn tích hợp Frontend với Backend

## Cấu hình API Base URL

Trong frontend React, tạo file `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';

export async function searchTrips(params: {
  from: string;
  to: string;
  date: string;
  passengers?: number;
  minPrice?: number;
  maxPrice?: number;
  busType?: string;
  timeSlot?: string;
  sortBy?: 'price' | 'time' | 'rating';
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/trips/search?${queryParams}`);
  if (!response.ok) throw new Error('Failed to search trips');
  return response.json();
}

export async function getTrip(id: string) {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`);
  if (!response.ok) throw new Error('Failed to get trip');
  return response.json();
}

export async function getTripSeats(tripId: string) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/seats`);
  if (!response.ok) throw new Error('Failed to get seats');
  return response.json();
}

export async function holdSeats(tripId: string, seatIds: string[]) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/seats/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  });
  if (!response.ok) throw new Error('Failed to hold seats');
  return response.json();
}

export async function createBooking(bookingData: {
  tripId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupPoint?: string;
  dropoffPoint?: string;
  seats: { seatId: string }[];
}) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error('Failed to create booking');
  return response.json();
}

export async function getBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  if (!response.ok) throw new Error('Failed to get bookings');
  return response.json();
}

export async function searchBooking(query: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search booking');
  return response.json();
}

export async function cancelBooking(bookingId: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('Failed to cancel booking');
  return response.json();
}
```

## Cập nhật SearchResultsPage

Thay thế mock data bằng API call:

```typescript
import { searchTrips } from '../utils/api';

// Trong component
useEffect(() => {
  const loadTrips = async () => {
    try {
      const results = await searchTrips({
        from,
        to,
        date,
        passengers: parseInt(searchParams.get('passengers') || '1'),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        busType: selectedBusTypes.length === 1 ? selectedBusTypes[0] : undefined,
        timeSlot: selectedTimeSlots.length === 1 ? selectedTimeSlots[0] : undefined,
        sortBy,
      });
      setTrips(results);
      setFilteredTrips(results);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };
  loadTrips();
}, [from, to, date, priceRange, selectedBusTypes, selectedTimeSlots, sortBy]);
```

## Cập nhật SeatSelectionPage

```typescript
import { getTripSeats, holdSeats } from '../utils/api';

useEffect(() => {
  const loadSeats = async () => {
    try {
      const seatsData = await getTripSeats(tripId);
      setSeats(seatsData);
    } catch (error) {
      console.error('Error loading seats:', error);
    }
  };
  loadSeats();
}, [tripId]);
```

## Cập nhật CheckoutPage

```typescript
import { createBooking } from '../utils/api';

const handlePayment = async () => {
  setIsProcessing(true);
  try {
    const booking = await createBooking({
      tripId: trip.id,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      pickupPoint: customerInfo.pickupPoint,
      dropoffPoint: customerInfo.dropoffPoint,
      seats: seats.map(seat => ({ seatId: seat.id })),
    });
    
    // Navigate to success page
    navigate('/orders', { 
      state: { 
        newOrder: booking,
        showSuccess: true 
      } 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.');
  } finally {
    setIsProcessing(false);
  }
};
```

## Mapping dữ liệu từ API

Backend trả về dữ liệu có cấu trúc hơi khác với mock data. Cần map lại:

```typescript
// Map trip từ API response
const mapTripFromAPI = (apiTrip: any): Trip => ({
  id: apiTrip.id,
  company: apiTrip.company.name,
  companyRating: apiTrip.company.rating,
  from: apiTrip.fromStation.name,
  to: apiTrip.toStation.name,
  departureTime: apiTrip.departureTime,
  arrivalTime: apiTrip.arrivalTime,
  duration: formatDuration(apiTrip.duration), // Convert minutes to "6h 40p"
  price: Number(apiTrip.price),
  busType: apiTrip.busType,
  availableSeats: apiTrip.availableSeats,
  totalSeats: apiTrip.totalSeats,
  amenities: apiTrip.amenities || [],
});
```

## Lưu ý

- Đảm bảo backend đang chạy tại `http://localhost:3000`
- Xử lý lỗi và loading states
- CORS đã được cấu hình trong backend để cho phép requests từ frontend

