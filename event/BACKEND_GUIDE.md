# Event Next Door - Backend Integration & API Specification

## 🎯 Backend Overview

The backend is built with **Node.js + Express** and uses **Supabase** as the database. This guide provides all the information needed to implement the API endpoints that the frontend expects.

---

## 📋 Required API Endpoints

### Authentication Routes

#### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+254741938327"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 3. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "john@example.com"
  }
}
```

---

### Events Routes

#### 1. Get All Events (with filters)
```http
GET /api/events?category=music&location=Nairobi&search=festival
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_id",
      "title": "Sunset Music Festival",
      "description": "Amazing festival",
      "category": "music",
      "location": "Uhuru Gardens",
      "date": "2025-05-24",
      "time": "14:00",
      "image": "image_url",
      "attendees": 150,
      "price": 500,
      "organizer": {
        "id": "user_id",
        "name": "John Doe"
      }
    }
  ],
  "count": 1
}
```

#### 2. Get Event Details
```http
GET /api/events/:id
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "event_id",
    "title": "Sunset Music Festival",
    "description": "Amazing festival with live music",
    "category": "music",
    "location": "Uhuru Gardens",
    "date": "2025-05-24",
    "time": "14:00",
    "endTime": "23:00",
    "image": "image_url",
    "attendees": 150,
    "price": 500,
    "maxCapacity": 500,
    "organizer": {
      "id": "user_id",
      "name": "John Doe",
      "image": "organizer_image_url"
    },
    "tags": ["music", "outdoor", "festival"],
    "attendeeList": [
      {
        "id": "attendee_id",
        "name": "Jane Smith",
        "image": "attendee_image_url"
      }
    ]
  }
}
```

#### 3. Create Event
```http
POST /api/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "endTime": "HH:MM",
  "price": number,
  "maxCapacity": number,
  "image": "image_url"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "event_id",
    "title": "New Event",
    "createdAt": "2025-05-01T10:00:00Z"
  }
}
```

#### 4. Update Event
```http
PUT /api/events/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  ...
}
```

#### 5. Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### Bookings Routes

#### 1. Get User's Bookings
```http
GET /api/bookings
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_id",
      "eventId": "event_id",
      "event": {
        "id": "event_id",
        "title": "Sunset Music Festival",
        "date": "2025-05-24",
        "location": "Uhuru Gardens",
        "image": "image_url"
      },
      "status": "confirmed",
      "bookingDate": "2025-05-01T10:00:00Z",
      "ticketCount": 2
    }
  ]
}
```

#### 2. Create Booking
```http
POST /api/bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventId": "event_id",
  "ticketCount": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "booking_id",
    "eventId": "event_id",
    "status": "confirmed",
    "ticketCount": 1
  }
}
```

#### 3. Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### User Profile Routes

#### 1. Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+254741938327",
    "profileImage": "image_url",
    "bio": "Event enthusiast",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### 2. Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "profileImage": "image_url"
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  location VARCHAR(255),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  end_time TIME,
  image_url VARCHAR(500),
  price DECIMAL(10, 2),
  max_capacity INTEGER,
  attendees INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'confirmed',
  booking_date TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Event Attendees Table
```sql
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

---

## 🔐 Authentication Implementation

### JWT Token Structure
```javascript
{
  "iss": "event-next-door",
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490  // 1 hour expiration
}
```

### Middleware - Authentication Check
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    req.user = user;
    next();
  });
};
```

---

## ✅ Implementation Checklist

### Priority 1 (Critical)
- [ ] Set up Express server
- [ ] Connect to Supabase database
- [ ] Implement user registration endpoint
- [ ] Implement user login endpoint
- [ ] Create JWT authentication middleware
- [ ] Test auth flow

### Priority 2 (High)
- [ ] Implement events CRUD endpoints
- [ ] Implement bookings endpoints
- [ ] Add input validation
- [ ] Add error handling
- [ ] Test all endpoints

### Priority 3 (Medium)
- [ ] Add pagination for events list
- [ ] Implement search/filtering
- [ ] Add category filtering
- [ ] Implement location-based filtering
- [ ] Add image upload handling

### Priority 4 (Nice to Have)
- [ ] Implement user profile endpoints
- [ ] Add email verification
- [ ] Add password reset
- [ ] Implement notifications
- [ ] Add activity logging

---

## 🛠️ Example Implementation (Node.js + Express)

### Setup
```bash
npm install express bcryptjs jsonwebtoken dotenv @supabase/supabase-js
```

### Environment Variables (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
```

### Basic Server Setup
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user to Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password_hash: hashedPassword
      }])
      .select();
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: data[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: data[0].id,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        email: data[0].email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

---

## 📊 API Response Standards

### Success Response (200-201)
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response (400-500)
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## 🧪 Testing

### Manual Testing with cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+254741938327",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'

# Get Events
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Create collection "Event Next Door"
2. Add requests for each endpoint
3. Set environment variable for token
4. Test auth flow end-to-end

---

## 🚀 Deployment

### Heroku Deployment
```bash
heroku create your-app-name
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_KEY=...
heroku config:set JWT_SECRET=...
git push heroku main
```

### Environment Setup
```
Production: NODE_ENV=production
Staging: NODE_ENV=staging
Development: NODE_ENV=development
```

---

## 📝 Error Handling

### Common Error Codes
```
AUTH_INVALID_CREDENTIALS - Login failed
AUTH_EMAIL_EXISTS - Email already registered
AUTH_TOKEN_EXPIRED - JWT token expired
EVENT_NOT_FOUND - Event doesn't exist
BOOKING_NOT_FOUND - Booking doesn't exist
DATABASE_ERROR - Database operation failed
VALIDATION_ERROR - Input validation failed
```

---

## 🔒 Security Best Practices

✅ **Password Hashing** - Use bcrypt with salt rounds 10+
✅ **JWT Validation** - Always verify tokens
✅ **CORS Configuration** - Whitelist allowed origins
✅ **Input Validation** - Validate all inputs
✅ **SQL Injection** - Use parameterized queries (Supabase handles this)
✅ **Rate Limiting** - Implement on auth endpoints
✅ **HTTPS Only** - Use HTTPS in production
✅ **Environment Variables** - Never commit secrets

---

## 📞 Support & Troubleshooting

**Issue**: Token expired error
- **Solution**: Implement token refresh endpoint

**Issue**: CORS errors
- **Solution**: Add frontend URL to CORS whitelist

**Issue**: Database connection fails
- **Solution**: Check Supabase URL and key are correct

**Issue**: Password validation fails
- **Solution**: Ensure password meets strength requirements

---

**Last Updated**: 2026-09-01  
**Status**: ✅ **READY FOR IMPLEMENTATION**  
**Repository**: https://github.com/blackkk59-netizen/event
