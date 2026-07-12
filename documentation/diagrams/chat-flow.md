# Diagram: Chat Initialization & Messaging Sequence

This sequence diagram details the chat lifecycle: interest request acceptance, room creation, handshake validation, and real-time messaging persistence.

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Tenant Browser
    actor Owner as Listing Owner
    participant API as Express Router
    participant Service as Chat Service
    participant DB as MongoDB Database
    participant Socket as Socket.IO Hub
    participant SMTP as Nodemailer SMTP

    %% Chat Activation
    Owner->>API: Respond to Match Request (accepted)
    API->>Service: respondToInterest(interestId, status: 'accepted')
    Service->>DB: Update Interest request status to 'accepted'
    Service->>DB: Upsert Chat room (owner, tenant, listing)
    Service->>SMTP: sendInterestStatusEmail(tenant, status: 'accepted')
    Service-->>API: Chat activated
    API-->>Owner: Request approved, direct message unlocked

    %% Socket Connection & Room Join
    Tenant->>Socket: Socket Connection Handshake (Auth: JWT Token)
    Socket->>Socket: jwt.verify() Handshake Authentication
    Socket-->>Tenant: Connection established (Authenticated User ID attached)

    Tenant->>Socket: join_room(chatId)
    Socket->>DB: Find Chat room and check Interest status
    alt Interest status is accepted AND user is participant
        DB-->>Socket: Verified
        Socket->>Socket: Add socket connection to room(chatId)
        Socket-->>Tenant: Joined room successfully
    else Validation fails
        DB-->>Socket: Rejection / Validation fail
        Socket-->>Tenant: Emit 'error' (Unauthorized to join)
    end

    %% Real-time Messaging
    Tenant->>API: Send Message: POST /api/messages { chatId, content }
    API->>Service: saveMessage(chatId, senderId, content)
    Service->>DB: Save Message document (chatId, senderId, receiverId, message)
    Service->>DB: Update Chat lastMessage and lastMessageAt
    DB-->>Service: Saved Message details
    Service-->>API: Message persistent
    API->>Socket: Broadcast message object to room(chatId)
    Socket->>Owner: Emit 'receive_message' in real-time
    API-->>Tenant: 201 Created response
```
