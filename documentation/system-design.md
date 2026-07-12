# RoomSync System Design Brief

This document outlines the architectural patterns, data pipelines, and design trade-offs made in the RoomSync platform.

---

## 1. Modular Layer Division (SOLID/MVC)
RoomSync follows MVC architecture and SOLID design principles. 
- The **Routing Layer** is the gatekeeper, wrapping Joi request validation middleware and JWT auth middleware.
- The **Controller Layer** is lean: it accepts requests, extracts parameters, delegates business logic to the service layer, and maps responses.
- The **Service Layer** encapsulates all business logic (calculations, AI queries, SMTP dispatches, image processing). This keeps database operations testable and isolated.
- The **Database Layer** represents Mongoose models enforcing schemas constraints and indexing optimizations.

---

## 2. AI Compatibility Engine & Fallback Flow
The compatibility calculation engine evaluates listings against tenant profiles.

### Concurrency Lock
A global in-memory evaluation cache checks incoming requests. If an evaluation for a `listingId-profileId` combination is in progress, subsequent parallel calls are queued or ignored. This prevents duplicate API calls.

### LLM Query
RoomSync calls Gemini 2.5 Flash with detailed system instructions. It parses the response JSON and saves the score, breakdowns, strengths, and weaknesses to the database with `scoringMethod = 'LLM'`.

### Fallback Processing
If the LLM call fails due to missing keys, API rate limits, or network timeouts, the system runs local fallback rules. It uses identical weighted criteria (Budget 40%, Location 30%, Move-In Date 20%, Room Type 10%) and formatting, saving the record with `scoringMethod = 'Rule-Based'` to ensure uninterrupted service.

---

## 3. Real-Time Chat & Handshake Security
The messaging system balances real-time performance and strict security controls.

### Handshake JWT Authentication
Sockets connect to the server by passing a JWT token in the handshake auth block. The server verifies this token, links the user object to the socket session, and registers the connection.

### Room Access Guards
- Chat messaging is restricted to accepted interests. The system verifies that the interest request status is `accepted` and that the socket client user is a participant before allowing them to join the room.
- Personal notification rooms require the target user ID to match the authenticated socket user ID, preventing eavesdropping.

### Message Pagination
To reduce load, messages are retrieved using cursor pagination (`limit` and `before` query parameters). The client loads history dynamically as they scroll or click, prepending older logs.

---

## 4. Notification & SMTP Flow
RoomSync integrates push alerts with email notifications.

### In-App Pushes
Mongoose post-save hooks on the `Notification` model fetch the Socket.IO instance and emit a `new_notification` event to the recipient's personal socket room in real-time. If the user is offline, the notification remains unread in MongoDB and loads on login.

### Transactional Emails
High compatibility matches (>80%) and interest request status updates (Accepted/Declined) trigger email alerts. The email service reads HTML templates from disk, replaces placeholder tags, and dispatches them asynchronously using Nodemailer.
