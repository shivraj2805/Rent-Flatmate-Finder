# RoomSync Architecture Diagram

This document describes the high-level architecture of **RoomSync (Rent & Flatmate Finder)**. The system is designed using a clean Client-Server Model with an event-driven component layout to support real-time messaging, notifications, and AI-driven match-making.

---

## Component Architecture

Below is a diagram showing the key modules, databases, and external service integrations inside the RoomSync platform.

```mermaid
graph TD
    %% Define Nodes
    subgraph Client ["Client Layer (React SPA)"]
        ReactApp["React / Vite UI App"]
        CtxAuth["Auth Context & Hooks"]
        WebSocketsClient["Socket.IO Client"]
    end

    subgraph Server ["Server Layer (Express API)"]
        ExpressApp["Express API Server"]
        routes["Routes Middleware"]
        controllers["Controllers"]
        services["Service Logic Layer"]
        socketServer["Socket.IO Server"]
        middleware["Auth & Validation Middleware"]
    end

    subgraph Database ["Data & Storage Layer"]
        MDB[("MongoDB Atlas Database")]
        Cloudinary[("Cloudinary Media Store")]
    end

    subgraph ThirdParty ["External API Integrations"]
        Gemini["Google Gemini Flash API"]
        Nodemailer["SMTP Mail Server (Nodemailer)"]
    end

    %% Client and Server Communication
    ReactApp -->|REST API Requests / JSON| routes
    WebSocketsClient <-->|WebSockets (Event-Driven Chat & Alerts)| socketServer

    %% Server Internal Routing
    routes --> middleware
    middleware --> controllers
    controllers --> services

    %% Server Integrations
    services -->|Mongoose Queries| MDB
    services -->|API Requests (Gemini 2.5 Flash)| Gemini
    services -->|Email Delivery (Nodemailer)| Nodemailer
    controllers -->|Direct Image Uploads| Cloudinary

    %% Colors and Styling
    classDef client fill:#0366d6,stroke:#fff,stroke-width:2px,color:#fff;
    classDef server fill:#28a745,stroke:#fff,stroke-width:2px,color:#fff;
    classDef database fill:#f66a0a,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#6f42c1,stroke:#fff,stroke-width:2px,color:#fff;

    class ReactApp,CtxAuth,WebSocketsClient client;
    class ExpressApp,routes,controllers,services,socketServer,middleware server;
    class MDB,Cloudinary database;
    class Gemini,Nodemailer external;
```

---

## System Components

### 1. Frontend Client Layer
- **Vite & React.js**: Fast single-page application bundling, using standard CSS/Tailwind for responsive styling.
- **Auth Context**: Persists current user session, parses JWT payload, and controls route protection (`ProtectedRoute` and `GuestRoute`).
- **Socket.IO Client**: Establishes persistent full-duplex TCP tunnels to receive typing indicators, real-time message bubbles, and push notifications.

### 2. Backend Server Layer
- **Node.js & Express.js**: Handles HTTP routing, JWT verification, and payload validation.
- **RESTful Controllers**: Standard MVC controllers handling incoming requests and returning uniform JSON structures.
- **Service Layer**: Decoupled business logic handling database queries, calculating scores, triggers notifications, and sending automated mail dispatches.
- **Socket.IO Config & Middleware**: Manages connection events, rooms, and registers connected clients to deliver events asynchronously.

### 3. Data & Media Storage
- **MongoDB Atlas**: Serves as the central datastore, mapping documents to schemas via Mongoose. Uses index structures (e.g. compound indices, text index searches) for optimized query executions.
- **Cloudinary**: Offloads file hosting by storing listing images securely on the cloud. The server uploads files via Multer memory buffers and saves the return HTTPS URL and unique public IDs.

### 4. External Services
- **Google Gemini API**: Models (`gemini-2.5-flash`) process listing parameters against tenant preferences to return structured JSON matching scores.
- **Nodemailer SMTP Manager**: Dispatches transactional emails (e.g., when match request is approved, or high-compatibility notification) using a configured SMTP host (e.g., Mailtrap, SendGrid).

---

> [!NOTE]  
> All API communications from the Frontend layer to the Server layer are protected by JWT Bearer tokens included in the `Authorization` header, except for public endpoints like registration and login.
