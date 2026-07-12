# RoomSync API Documentation

All API requests must be sent to the base URL and utilize proper authentication headers where applicable.

- **Base URL**: `https://your-domain.com/api` (or `http://localhost:5000/api` in development)
- **Content-Type**: `application/json`
- **Authentication**: JWT authentication. Protected endpoints require a token passed in the header as:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

---

## 🔑 Authentication Endpoints (`/auth`)

### 1. Register User
Creates a new tenant or owner account.
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123",
    "role": "tenant" // or "owner"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "tenant",
      "avatar": "",
      "isActive": true
    }
  }
  ```

### 2. Login User
Verifies credentials and returns a JSON Web Token.
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "tenant",
      "avatar": "",
      "isActive": true
    }
  }
  ```

### 3. Get Active User Details
Retrieves detailed profile data of the logged-in user.
- **Endpoint**: `GET /auth/me`
- **Access**: Private (All Roles)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "tenant",
      "avatar": "",
      "isActive": true
    }
  }
  ```

### 4. Update Profile Settings
Updates basic profile settings for the authenticated user.
- **Endpoint**: `PUT /auth/profile`
- **Access**: Private (All Roles)
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "janesmith@example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Smith",
      "email": "janesmith@example.com",
      "role": "tenant"
    }
  }
  ```

### 5. Update Password
Changes password credentials.
- **Endpoint**: `PUT /auth/password`
- **Access**: Private (All Roles)
- **Request Body**:
  ```json
  {
    "currentPassword": "Password123",
    "newPassword": "NewSecurePassword123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

## 🏠 Listing Endpoints (`/listings`)

### 1. Get All Listings
Retrieves active room listings. Supports filtering and text searching.
- **Endpoint**: `GET /listings`
- **Access**: Private (All Roles)
- **Query Parameters**:
  - `search`: Matches query in title, description, or location.
  - `location`: Matches listing location.
  - `minRent` / `maxRent`: Filters listings by rent range.
  - `roomType`: Filters by listing room type (e.g. `studio`, `apartment`).
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1,
    "listings": [
      {
        "_id": "60d000000000000000000002",
        "title": "Modern Studio in Koregaon Park",
        "location": "Koregaon Park, Pune",
        "rent": 15000,
        "roomType": "studio",
        "availableFrom": "2026-08-01T00:00:00.000Z",
        "furnished": true,
        "images": []
      }
    ]
  }
  ```

### 2. Create Listing
Publishes a new room listing (supports files via `multipart/form-data`).
- **Endpoint**: `POST /listings`
- **Access**: Private (Owner or Admin)
- **Form Data Fields**:
  - `title`, `description`, `location`, `rent`, `roomType`, `availableFrom`, `genderPreference`, `furnished`, `amenities` (array/comma-separated)
  - `images`: File attachments (maximum 10 files)
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Listing created successfully",
    "listing": {
      "_id": "60d000000000000000000002",
      "owner": "60d000000000000000000009",
      "title": "Modern Studio in Koregaon Park",
      "location": "Koregaon Park, Pune",
      "rent": 15000,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "roomsync/abcde"
        }
      ]
    }
  }
  ```

### 3. Get Listing by ID
Retrieves details of a specific property listing, including its calculated compatibility scores if requested.
- **Endpoint**: `GET /listings/:id`
- **Access**: Private (All Roles)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "listing": { ... },
    "compatibility": {
      "score": 95,
      "explanation": "Perfect match for your budget and locations."
    }
  }
  ```

### 4. Delete Listing
Removes a listing.
- **Endpoint**: `DELETE /listings/:id`
- **Access**: Private (Listing Owner or Admin)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Listing deleted successfully"
  }
  ```

---

## 👤 Tenant Profile Endpoints (`/tenant`)

### 1. Get Tenant Profile
Fetches preferences and profiles configured for the logged-in user.
- **Endpoint**: `GET /tenant/profile`
- **Access**: Private (All Roles)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "profile": {
      "preferredLocations": ["Koregaon Park", "Viman Nagar"],
      "budgetRange": { "min": 10000, "max": 18000 },
      "moveInDate": "2026-08-01T00:00:00.000Z",
      "isSearching": true
    }
  }
  ```

### 2. Update/Create Profile
Upserts preferred locations, budgets, dates, and bio.
- **Endpoint**: `PUT /tenant/profile`
- **Access**: Private (Tenant or Admin)
- **Request Body**:
  ```json
  {
    "preferredLocations": ["Koregaon Park", "Kalyani Nagar"],
    "budgetRange": { "min": 12000, "max": 16000 },
    "moveInDate": "2026-08-01",
    "roomPreferences": ["studio", "private-room"],
    "lifestylePreferences": ["non-smoker", "pet-friendly"],
    "bio": "Software engineer looking for a room.",
    "gender": "female",
    "isSearching": true
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Tenant profile updated successfully",
    "profile": { ... }
  }
  ```

---

## 🤝 Interest Request Endpoints (`/interests`)

### 1. Send Interest Request
Initiates a match request to check compatibility and unlock direct messaging.
- **Endpoint**: `POST /interests`
- **Access**: Private (Tenant or Admin)
- **Request Body**:
  ```json
  {
    "listing": "60d000000000000000000002",
    "tenantMessage": "Hi, I am interested in your room listing!"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Interest request submitted successfully",
    "interest": {
      "_id": "60d000000000000000000003",
      "tenant": "60d000000000000000000001",
      "listing": "60d000000000000000000002",
      "owner": "60d000000000000000000009",
      "status": "pending"
    }
  }
  ```

### 2. Respond to Interest Request
Allows the listing owner to accept or decline interest.
- **Endpoint**: `PATCH /interests/:id/status`
- **Access**: Private (Owner or Admin)
- **Request Body**:
  ```json
  {
    "status": "accepted", // or "declined"
    "ownerResponseMessage": "Sure, let's chat!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Interest request updated",
    "interest": {
      "_id": "60d000000000000000000003",
      "status": "accepted",
      "ownerResponseMessage": "Sure, let's chat!"
    }
  }
  ```

---

## 💬 Chat Endpoints (`/chats`)

### 1. Get User Chats
Retrieves list of active chat rooms the logged-in user participates in.
- **Endpoint**: `GET /chats`
- **Access**: Private (Tenant or Owner)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "chats": [
      {
        "_id": "60d000000000000000000005",
        "listing": { "title": "Modern Studio" },
        "tenant": { "name": "Jane Doe" },
        "owner": { "name": "John Smith" },
        "lastMessage": null
      }
    ]
  }
  ```

### 2. Fetch Chat Messages
Loads all historical message entries for a specific chat room.
- **Endpoint**: `GET /chats/:id/messages`
- **Access**: Private (Participants only)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d000000000000000000006",
        "sender": "60d000000000000000000001",
        "content": "Hi John!",
        "createdAt": "2026-07-12T14:00:00.000Z"
      }
    ]
  }
  ```

### 3. Send Message
Sends a message into the chat room.
- **Endpoint**: `POST /chats/:id/messages`
- **Access**: Private (Participants only)
- **Request Body**:
  ```json
  {
    "content": "Hello, is the room still available?"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": {
      "_id": "60d000000000000000000007",
      "chat": "60d000000000000000000005",
      "sender": "60d000000000000000000001",
      "content": "Hello, is the room still available?"
    }
  }
  ```

---

## 🔔 Notification Endpoints (`/notifications`)

### 1. Get Notifications
Retrieves push notifications for the active user.
- **Endpoint**: `GET /notifications`
- **Access**: Private (All Roles)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "notifications": [
      {
        "_id": "60d000000000000000000008",
        "type": "interest_received",
        "title": "New Interest Request",
        "content": "Jane Doe expressed interest in Modern Studio.",
        "isRead": false
      }
    ]
  }
  ```

### 2. Mark Notification as Read
Updates `isRead` status of a single alert.
- **Endpoint**: `PATCH /notifications/:id/read`
- **Access**: Private
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "notification": {
      "_id": "60d000000000000000000008",
      "isRead": true
    }
  }
  ```

### 3. Mark All Read
Marks all notifications for the active user as read.
- **Endpoint**: `POST /notifications/read-all`
- **Access**: Private
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```

---

## 🛡️ Admin Command Endpoints (`/admin`)

All Admin routes require user accounts to have `role: 'admin'`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | Retrieves total users, listings, requests, chats, and compatibility stats. |
| `GET` | `/admin/users` | Lists and searches all users registered on the platform. |
| `GET` | `/admin/listings` | Lists and searches all room listings posted. |
| `GET` | `/admin/interests` | Displays all interest requests and matches status. |
| `GET` | `/admin/chats` | Displays all chat logs and rooms. |
| `GET` | `/admin/activity` | Fetches historical log timeline for security audits. |
| `POST` | `/admin/users/bulk-status` | Actives/blocks multiple user accounts in one action. |
| `POST` | `/admin/users/bulk-delete` | Deletes multiple user accounts. |
| `POST` | `/admin/listings/bulk-status` | Actives/deactivates multiple listings in bulk. |
| `POST` | `/admin/listings/bulk-delete` | Deletes multiple listings in bulk. |
| `DELETE` | `/admin/users/:id` | Deletes a single user profile. |
| `DELETE` | `/admin/listings/:id` | Deletes a single listing. |
