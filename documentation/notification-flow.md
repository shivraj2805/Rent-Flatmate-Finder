# RoomSync Notification Flows & SMTP Service

This document details the real-time notification system, database triggers, and email notification flows.

---

## 🔔 Real-Time Notification Flows

RoomSync supports both real-time in-app pushes and automated SMTP email alerts to ensure users stay informed about matches and messages.

### Flow Diagram
```
  Platform Action (e.g. interest sent / accepted)
                     │
                     ▼
         Create Notification Document
                     │
                     ▼
          Mongoose Post-Save Hook
                     │
                     ▼
         Check Active Sockets Registry
           ├── Active  ──► Dispatch 'new_notification' via Socket
           └── Inactive ──► Saved in DB (Loaded on login)
                     │
                     ▼
             Trigger Email Alert
           (Nodemailer SMTP Dispatch)
```

---

## 💬 In-App Notification Trigger

When a notification is saved to the database:
1. A post-save hook on the `Notification` model is triggered.
2. It fetches the Socket.IO instance.
3. It emits a `new_notification` event to the recipient's personal room (`io.to(doc.recipient.toString()).emit()`).
4. The client Navbar listens for this event, plays a subtle chime, increments the badge count, and appends the notification to the popover.

---

## 📧 Automated Email Alerts (SMTP)

RoomSync uses **Nodemailer** to send transactional email alerts. The email service loads modern HTML layouts from disk, replaces placeholder tags, and dispatches them asynchronously.

### 1. High Compatibility Alert
- **Trigger**: Compatibility score is calculated at **>80%**.
- **Recipient**: Listing Owner.
- **Content**: Details the matching tenant, compatibility score, matching categories summary, and includes a call-to-action button to view requests.
- **Template File**: `server/templates/compatibilityAlert.html`

### 2. Match Interest Status Alert
- **Trigger**: Landlord approves (`accepted`) or rejects (`declined`) a tenant's interest request.
- **Recipient**: Tenant User.
- **Content**: Details the landlord's decision, matching message, and includes a link to open the chat room (if accepted) or view dashboards.
- **Template File**: `server/templates/interestStatus.html`

---

## ⚙️ SMTP Configurations and Resilience
Email sending parameters are read from environment variables:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

If these variables are not configured (e.g., in a local development environment), the service logs a console warning instead of crashing. This ensures development continues smoothly without SMTP setups.
