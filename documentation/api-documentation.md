# RoomSync REST API Mappings Manual

All requests require `Content-Type: application/json` and proper bearer headers where specified.

---

## 🔑 1. User Authentication APIs (`/api/auth`)

### 1. Register User
- **Method & Path**: `POST /api/auth/register`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123",
    "role": "tenant"
  }
  ```
- **Success Response (`210 Created`)**:
  ```json
  {
    "success": true,
    "token": "eyJhbG...",
    "user": { "id": "60d001", "name": "Jane Doe", "email": "jane@example.com", "role": "tenant" }
  }
  ```
- **Errors**:
  - `400 Bad Request` (Validation fails: password weak).
  - `409 Conflict` (Email already registered).

### 2. Login User
- **Method & Path**: `POST /api/auth/login`
- **Authentication**: Public
- **Request Body**:
  ```json
  { "email": "jane@example.com", "password": "Password123" }
  ```
- **Success Response (`200 OK`)**: Matches registration.
- **Errors**:
  - `401 Unauthorized` (Wrong credentials).

### 3. Current User Session
- **Method & Path**: `GET /api/auth/me`
- **Authentication**: Required (All roles)
- **Success Response (`200 OK`)**: User details.

---

## 🏠 2. Listings Portfolio APIs (`/api/listings`)

### 1. List Listings
- **Method & Path**: `GET /api/listings`
- **Authentication**: Required (All roles)
- **Parameters**: `search`, `location`, `maxRent`, `roomType`
- **Success Response (`200 OK`)**: List of listings.

### 2. Fetch Listing Details
- **Method & Path**: `GET /api/listings/:id`
- **Authentication**: Required (All roles)

### 3. Create Listing
- **Method & Path**: `POST /api/listings`
- **Authentication**: Required (`owner`, `admin`)
- **Request Body**: Multipart form data with fields and file uploads.

### 4. Delete Listing
- **Method & Path**: `DELETE /api/listings/:id`
- **Authentication**: Required (Owner of listing, `admin`)
- **Success Response (`200 OK`)**: `{ "success": true, "message": "Listing deleted successfully" }`

### 5. Patch Listing Status
- **Method & Path**: `PATCH /api/listings/:id/status`
- **Authentication**: Required (Owner of listing, `admin`)
- **Request Body**: `{ "status": "filled" }`

---

## 👤 3. Tenant Profile APIs (`/api/profile`)

### 1. Fetch Profile Preferences
- **Method & Path**: `GET /api/profile` (or `GET /api/tenant/profile` as legacy)
- **Authentication**: Required (All roles)

### 2. Upsert Profile Preferences
- **Method & Path**: `PUT /api/profile` (or `PUT /api/tenant/profile` as legacy)
- **Authentication**: Required (`tenant`, `admin`)
- **Request Body**:
  ```json
  {
    "preferredLocations": ["Koregaon Park"],
    "budgetRange": { "min": 10000, "max": 15000 },
    "moveInDate": "2026-08-01",
    "roomPreferences": ["studio"],
    "bio": "Searching for a room",
    "gender": "female"
  }
  ```

---

## 🧠 4. Compatibility Scoring APIs (`/api/compatibility`)

### 1. Fetch Room Compatibility
- **Method & Path**: `GET /api/compatibility/:listingId`
- **Authentication**: Required (`tenant`)
- **Success Response (`200 OK`)**: Compatibility object containing detailed category breakdown.

### 2. Trigger Background Recalculation
- **Method & Path**: `POST /api/compatibility/recalculate`
- **Authentication**: Required (`tenant`, `owner`)

---

## 🤝 5. Interest Requests APIs (`/api/interests`)

### 1. Send Request
- **Method & Path**: `POST /api/interests`
- **Authentication**: Required (`tenant`, `admin`)
- **Request Body**: `{ "listingId": "60d002", "tenantMessage": "Hello!" }`

### 2. Respond to Request
- **Method & Path**: `PATCH /api/interests/:id` (or `PATCH /api/interests/:id/status` as legacy)
- **Authentication**: Required (`owner`, `admin`)
- **Request Body**: `{ "status": "accepted", "responseMessage": "Let's connect!" }`

---

## 💬 6. Chat & Messenger APIs (`/api/chats` & `/api/messages`)

### 1. List User Chats
- **Method & Path**: `GET /api/chats`
- **Authentication**: Required (Participants only)

### 2. Fetch Messages Log
- **Method & Path**: `GET /api/chats/:id/messages`
- **Authentication**: Required (Participants only)
- **Parameters**: `limit`, `before`

### 3. Send Message
- **Method & Path**: `POST /api/messages` (or `POST /api/chats/:id/messages` as legacy)
- **Authentication**: Required (Participants only)
- **Request Body**: `{ "chatId": "60d005", "content": "Hello!", "replyToId": "60d006" }`

---

## 🔔 7. Notifications APIs (`/api/notifications`)

### 1. List Notifications
- **Method & Path**: `GET /api/notifications`
- **Authentication**: Required

### 2. Mark Read
- **Method & Path**: `PATCH /api/notifications/:id/read`
- **Authentication**: Required

---

## 👑 8. Admin Portal APIs (`/api/admin`)

### 1. Dashboard Metrics
- **Method & Path**: `GET /api/admin/dashboard`
- **Authentication**: Required (`admin`)

### 2. List Users Registry
- **Method & Path**: `GET /api/admin/users`
- **Authentication**: Required (`admin`)

### 3. Remove User
- **Method & Path**: `DELETE /api/admin/users/:id`
- **Authentication**: Required (`admin`)
- **Action**: Calls `adminService.deleteUser(id)` trigger cascade clean up.

### 4. Remove Listing
- **Method & Path**: `DELETE /api/admin/listings/:id`
- **Authentication**: Required (`admin`)
- **Action**: Calls `listingService.deleteListingById(id)` trigger cascade clean up.
