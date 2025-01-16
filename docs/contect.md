# Hotel CRM Documentation

## API Configuration

### Available APIs
- Hotels API: `https://apiservice.hotelonline.co/api/hotels`
  - This is the only real API endpoint available
  - Requires authentication token

### Development Mode
For development, the system uses mock data for all services except hotels:
- Users/Auth: Mock data with any email and password "password123"
- Bookings: Mock data
- Guests: Mock data
- Contacts: Mock data
- Tickets: Mock data
- Finance: Mock data

### Production Mode
- API Base URL: `https://apiservice.hotelonline.co/api`
- Authentication:
  - Email: `admin@hotelonline.co`
  - Password: `admin123`
  - Endpoint: `/auth/login`

### Development Setup
1. Set `IS_DEV = true` in `src/services/api.ts` to use mock data for all services except hotels
2. Use any email with password "password123" for login
3. Hotels will still use the real API with the production credentials

### Production Setup
1. Set `IS_DEV = false` in `src/services/api.ts`
2. Use the production credentials for login
3. Only hotels API will work, other services will use mock data