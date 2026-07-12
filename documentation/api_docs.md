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

---

## 🏠 Listing Endpoints (`/listings`)

### 1. Get All Listings
Retrieves active room listings. Includes calculated compatibility scores against the requesting tenant's preferences.
- **Endpoint**: `GET /listings`
- **Access**: Private (All Roles)
- **Query Parameters**:
  - `search`: Matches query in title, description, or location.
  - `location`: Matches listing location.
  - `maxRent`: Filters listings by rent range.
  - `roomType`: Filters by room type.
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
        "images": [],
        "compatibility": {
          "score": 91,
          "budgetScore": 38,
          "locationScore": 30,
          "dateScore": 13,
          "roomTypeScore": 10,
          "strengths": [
            "Rent fits your budget range",
            "Located in your preferred area"
          ],
          "weaknesses": [
            "Available 3 days after move-in date"
          ],
          "explanation": "Excellent overall compatibility because the budget and preferred location align closely.",
          "scoringMethod": "LLM",
          "llmProvider": "Gemini",
          "source": "ai"
        }
      }
    ]
  }
  ```

---

## 👤 Tenant Profile Endpoints (`/tenant`)

### 1. Get Tenant Profile
Fetches preferences and profiles configured for the logged-in user.
- **Endpoint**: `GET /tenant/profile`
- **Access**: Private (All Roles)

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
    "lifestylePreferences": ["non-smoker"],
    "bio": "Software engineer looking for a room.",
    "gender": "female",
    "isSearching": true
  }
  ```

---

## 🤝 Interest Request Endpoints (`/interests`)

### 1. Send Interest Request
Initiates a match request to check compatibility and unlock direct messaging.
- **Endpoint**: `POST /interests`
- **Access**: Private (Tenant or Admin)

### 2. Respond to Interest Request
Allows the listing owner to accept or decline interest. Accepting unlocks the chat room.
- **Endpoint**: `PATCH /interests/:id/status`
- **Access**: Private (Owner or Admin)
- **Request Body**:
  ```json
  {
    "status": "accepted", // or "declined"
    "ownerResponseMessage": "Sure, let's chat!"
  }
  ```

---

## 💬 Chat Messenger Endpoints (`/chats`)

### 1. Get User Chats
Retrieves list of active chat rooms the logged-in user participates in.
- **Access Rule**: Only returns rooms associated with an **accepted** interest request.
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
        "interest": { "_id": "60d000000000000000000003", "status": "accepted" },
        "lastMessage": null
      }
    ]
  }
  ```

### 2. Fetch Chat Messages (With Pagination)
Loads historical message entries for a specific chat room.
- **Access Rule**: Rejected with `403 Forbidden` if the interest request status is not accepted.
- **Endpoint**: `GET /chats/:id/messages`
- **Access**: Private (Participants only)
- **Query Parameters**:
  - `limit`: Number of messages to return (default: `50`).
  - `before`: ISO Date string. Fetches messages sent *prior* to this timestamp.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1,
    "messages": [
      {
        "_id": "60d000000000000000000006",
        "chatId": "60d000000000000000000005",
        "senderId": "60d000000000000000000001",
        "receiverId": "60d000000000000000000009",
        "listingId": "60d000000000000000000002",
        "message": "Hi John!",
        "messageType": "text",
        "timestamp": "2026-07-12T14:00:00.000Z",
        "createdAt": "2026-07-12T14:00:00.000Z"
      }
    ]
  }
  ```

### 3. Send Message
Sends a text message inside a chat.
- **Access Rule**: Rejected with `403 Forbidden` if the interest request status is not accepted.
- **Endpoint**: `POST /chats/:id/messages`
- **Access**: Private (Participants only)
- **Request Body**:
  ```json
  {
    "content": "Hello, is the room still available?",
    "replyToId": "60d000000000000000000006" // optional (for quoting)
  }
  ```

---

## 🔌 Socket.IO Event Guide

Socket connections require a JWT token passed during handshake initialization:
```javascript
const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('rentFlatmateToken') }
});
```

### Supported Events:
- `join_room` (emitted by client with `roomId`): Joins the room for a specific chat room. Server validates user membership and interest acceptance.
- `join_user_room` (emitted by client with `userId`): Joins the user's personal room for notification pushes. Server validates ownership.
- `typing` / `stop_typing` (emitted by client): Displays typing bubbles to the other participant in the chat room.
- `user_online` / `user_offline` (broadcast by server): Alerts clients when users change online statuses.
