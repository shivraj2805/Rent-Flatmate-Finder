# RoomSync Real-Time Chat & Message Persistence

This document details the real-time communications flow, socket events, connection security guards, and database persistence mapping of RoomSync.

---

## 🔒 Security & Access Control

### 1. Connection Authentication Middleware
Every socket connection requires verification. The client sends the verified JWT token during connection handshakes:
```javascript
const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('rentFlatmateToken') }
});
```
On the server, a Socket.IO middleware intercepts the handshake, verifies the token via `jwt.verify()`, and attaches the authenticated payload (user ID and role) to the socket object:
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  // Verify token and attach user to socket instance...
  socket.user = decoded;
  next();
});
```
If the token is missing or expired, the connection is rejected.

### 2. Room Guard Authorization
Direct messaging is restricted to authorized users:
- **Chat Rooms**: Joining a chat room (`join_room` event) requires that the associated interest request has an `accepted` status. Additionally, the user must be either the owner or the tenant of the chat room. If these checks fail, the join request is rejected.
- **Personal Channels**: Joining a notification channel (`join_user_room` event) requires that the target user ID matches the authenticated socket's user ID, preventing users from eavesdropping on notifications.

---

## 🔌 Socket.IO Event Mappings

| Event Name | Sender | Payload | Description |
| :--- | :--- | :--- | :--- |
| **`join_room`** | Client | `roomId` (Chat ID) | Client requests to join a chat room. Server validates status and membership before calling `socket.join()`. |
| **`join_user_room`** | Client | `userId` | Client joins their personal notification room. |
| **`leave_room`** | Client | `roomId` | Client leaves a chat room. |
| **`typing`** | Client | `{ roomId, userName }` | Broadcasts typing bubbles to other members in the room. |
| **`stop_typing`** | Client | `{ roomId }` | Hides typing bubbles for other members. |
| **`get_online_users`**| Client | Callback function | Retrieves the list of currently online user IDs. |
| **`user_online`** | Server | `{ userId }` | Broadcast globally when a user connects. |
| **`user_offline`** | Server | `{ userId }` | Broadcast globally when all sockets for a user disconnect. |
| **`receive_message`** | Server | Message object | Broadcasts a new message to all participants in a chat room. |

---

## 💾 Message Persistence

All messages are persisted to MongoDB.

### Schema Fields
- `chatId` / `chat`: Reference to the Chat container.
- `senderId` / `sender`: Reference to the Author User.
- `receiverId`: Reference to the Recipient User.
- `listingId`: Reference to the Listings context.
- `message` / `content`: String message text.
- `messageType`: Type of message (`'text'`, `'image'`, `'system'`).
- `timestamp`: Delivery date.
- `replyTo`: Reference pointer to a parent message (used for quote replies).

---

## 📊 Message Pagination & Scrolling

To optimize page loading, RoomSync uses cursor pagination:
- The initial message load requests the latest 50 messages:
  `GET /api/chats/:id/messages?limit=50`
- To load older messages, the client clicks "Load previous messages". This triggers a fetch request passing the timestamp of the oldest message in memory:
  `GET /api/chats/:id/messages?limit=50&before=2026-07-12T14:00:00.000Z`
- The server retrieves messages sent prior to that timestamp, and the client prepends them to the chat history.
