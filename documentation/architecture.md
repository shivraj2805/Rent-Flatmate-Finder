# RoomSync System Architecture & Technology Stack

This document details the software layers, data boundaries, component interfaces, and third-party systems that constitute RoomSync's platform.

---

## 🏛️ System Component Boundaries

RoomSync uses a decoupled client-server architecture. All communications are orchestrated over HTTP RESTful endpoints and bi-directional real-time WebSocket channels (Socket.IO).

```
 ┌─────────────────────────────────────────────────────────┐
 │                     REACT CLIENT                        │
 │  (Tailwind Styling, Context State, Socket.IO Client)   │
 └────────────────────────────┬────────────────────────────┘
                              │
                  REST / WS Channels (JSON)
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                     EXPRESS SERVER                      │
 │                                                         │
 │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
 │  │ Controllers  │  │   Services   │  │  Middlewares  │  │
 │  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
 │         │                 │                  │          │
 └─────────┼─────────────────┼──────────────────┼──────────┘
           │                 │                  │
   Mongoose ORM        Third-Party APIs     JWT Auth
           │                 │                  │
 ┌─────────▼────────┐ ┌──────▼───────┐  ┌───────▼───────┐
 │     MONGODB      │ │ Gemini / AI  │  │  Cloudinary   │
 │   COLLECTIONS    │ │ Nodemailer   │  │  Image Store  │
 └──────────────────┘ └──────────────┘  └───────────────┘
```

---

## 📁 Backend Layer Division (SOLID/MVC)

The Express backend strictly enforces separation of concerns:

### 1. Route Routing Layer (`/routes`)
- Maps HTTP methods and REST paths to specific controller actions.
- Injects JWT authentication guards and schema request validators.

### 2. Request Validation Layer (`/validators`)
- Defines strict Joi schemas to enforce parameter bounds, body parameters, and data types before executing controller logic.

### 3. Middleware Filters Layer (`/middleware`)
- Intercepts requests to verify authentication (`protect`), validate user roles (`authorizeRoles`), parse form files (`multer`), and intercept backend exceptions (`errorHandler`).

### 4. Controller Orchestration Layer (`/controllers`)
- Extracts parameters, forwards execution to services, and returns consistent JSON response payloads. Controllers do not containing database queries or scoring logic.

### 5. Core Services Business Logic Layer (`/services`)
- Houses the core business algorithms of the platform.
- Performs MongoDB manipulations, triggers Socket.IO broadcasts, dispatches Nodemailer alerts, and triggers Gemini evaluations.

### 6. Database Schema ORM Layer (`/models`)
- Defines Mongoose schemas with strict validations, default values, indices, and pre-save/post-save integrity hooks.

---

## 🔌 Core Integrations

### 1. AI Compatibility Scoring Engine (Gemini)
- Calculates a match profile on-the-fly. If the LLM experiences rate limits, timeouts, or API key issues, a local rules-based fallback runs with a matching JSON response payload structure.

### 2. Real-Time Chat & Handshake Authentication
- Initiates Socket.IO connections. A JWT verification middleware validates connection requests. Users join isolated rooms matching accepted interest requests.

### 3. Media Upload (Cloudinary)
- Handles multipart listing pictures. Deleting listings triggers a cascade that destroys files in Cloudinary.

### 4. Email Services (Nodemailer SMTP)
- Reads premium HTML layouts from disk and dispatches email notifications for high compatibility score matches and interest updates.
