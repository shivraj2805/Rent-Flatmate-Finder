# RoomSync Testing & Verification Manual

This document details the testing scenarios, input validation parameters, and functional verification checks to validate RoomSync's operation.

---

## 🔑 Scenario 1: Authentication & Access Control

### 1. User Registration (`POST /api/auth/register`)
- **Valid Input**:
  - Name: "Amit Kumar", Email: "amit@example.com", Password: "Password123" (contains letters and numbers), Role: "tenant".
  - Expected: `201 Created`, returns JWT token and user profile object.
- **Validation Bounds**:
  - Empty field: Return `400 Bad Request` with message: "Name cannot be empty".
  - Short password (<8 chars): Return `400 Bad Request` with message: "Password must be at least 8 characters long".
  - Simple password: Password must contain letters and numbers.
  - Duplicate email: Return `409 Conflict` with message: "Email is already registered".

### 2. Login Flow (`POST /api/auth/login`)
- **Input**:
  - Email: "amit@example.com", Password: "Password123".
  - Expected: `200 OK`, returns JWT token and user profile object.
- **Failures**:
  - Wrong password: Return `401 Unauthorized` with message: "Invalid email or password".
  - Missing field: Return `400 Bad Request`.

---

## 🏠 Scenario 2: Room Listing Lifecycle

### 1. Listing Creation (`POST /api/listings`)
- **Access**: Restricted to landlords (`owner` role) or admins.
- **Input**:
  - Title: "Charming studio", Description: "Nice private room in Koregaon Park", Rent: 14000 (positive number), location: "Koregaon Park", roomType: "studio", availableFrom: "2026-08-01", images: *(At least one file)*.
  - Expected: `201 Created`, listing object saved with references to owner.
- **Validation Bounds**:
  - Negative rent: Return `400 Bad Request` with message: "Rent must be a positive number greater than 0".
  - Missing image: Return `400 Bad Request` with message: "At least one image is required".

### 2. Cascade Deletion (`DELETE /api/listings/:id`)
- **Access**: Owner of listing or admin.
- **Verification**:
  - Delete listing.
  - Check MongoDB: All associated `Compatibility`, `Interest`, and `Chat` records (and their messages) must be deleted from the database automatically.
  - Check Cloudinary console: Verified that all hosted image public IDs have been destroyed.

---

## 🧠 Scenario 3: AI Compatibility Scoring & Fallback

### 1. Successful LLM Scoring
- **Trigger**: Tenant views listing details or sends match request.
- **Verification**:
  - Check MongoDB: A new `Compatibility` record exists with `scoringMethod = 'LLM'`, `llmProvider = 'Gemini'`, showing score breakdowns (Budget, Location, Date, Room Type).
  - Verify `strengths` and `weaknesses` list points match the parameters.

### 2. Fallback Rules-Based Activation
- **Trigger**: Revoke or rename `GEMINI_API_KEY` in backend `.env` file, then recalculate.
- **Verification**:
  - Verify that matching executes without failing.
  - Check MongoDB: Verified that a `Compatibility` record was saved containing matching scores, but with `scoringMethod = 'Rule-Based'` and `llmProvider = null`.

---

## 💬 Scenario 4: Chat Systems & Persistent Messages

### 1. Direct Messaging Lock
- **Verification**:
  - Log in as Tenant. Attempt to join socket room or send message to Chat room before landlord accepts the request.
  - Expected: API returns `403 Forbidden` and socket emits room authorization error.

### 2. Message History Pagination
- **Verification**:
  - Populate 100 messages in a chat.
  - Request messages: `GET /api/chats/:chatId/messages?limit=50`. Verify that only the latest 50 messages are returned in chronological order.
  - Request next page: `GET /api/chats/:chatId/messages?limit=50&before=<timestamp>`. Verify that older messages are returned.

---

## 📧 Scenario 5: SMTP Automated Notifications

### 1. High Compatibility Matches
- **Action**: Evaluate compatibility for a tenant with matching parameters (matching rent, preferred locations, timelines).
- **Verification**:
  - If score > 80, check console log (or email client inbox if SMTP is active): An email is sent to the listing owner detailing the match.

### 2. Interest Response Updates
- **Action**: Landlord accepts tenant match request.
- **Verification**:
  - Check console log: An email is sent to the tenant announcing approval and sharing a link to open the chat room.
