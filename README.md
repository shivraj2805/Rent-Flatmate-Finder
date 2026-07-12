# RoomSync - Rent & Flatmate Finder

RoomSync is a premium MERN stack application designed to help users find suitable rooms and flatmates in Pune. The platform features role-based workflows, Gemini AI-powered compatibility matching with rule-based fallback logic, a real-time secure chat messenger, custom dynamic status tracking, and a comprehensive admin command center.

---

## 📖 Project Documentation Portal

All detailed project documentation, architecture flowcharts, database ER models, setup guides, API specs, and testing guides are organized in the dedicated **[`documentation/`](file:///d:/Unthinkable%20Ass/documentation)** folder at the root of the project:

### 🚀 Setup & Launch Guides
- **[Installation & Local Setup Guide](file:///d:/Unthinkable%20Ass/documentation/setup-guide.md)**: Local developer requirements, environment details, and quickstart commands.
- **[Testing & Scenarios Manual](file:///d:/Unthinkable%20Ass/documentation/testing-guide.md)**: Testing scenarios for authentication, listings, chats, and SMTP mails.
- **[Deployment Manual](file:///d:/Unthinkable%20Ass/documentation/deployment-guide.md)**: Production deployment instructions for MongoDB Atlas, Render, and Vercel.

### 🧠 System Architecture & Design
- **[Architecture Specification](file:///d:/Unthinkable%20Ass/documentation/architecture.md)**: Multi-layer system architecture and tech stack details.
- **[System Design Brief](file:///d:/Unthinkable%20Ass/documentation/system-design.md)**: Design summaries of compatibility scoring, fallback handling, chat, and database integrity.
- **[Database Schema & Indexes](file:///d:/Unthinkable%20Ass/documentation/database-schema.md)**: Field mappings, validation constraints, and query indices.
- **[RESTful API Documentation](file:///d:/Unthinkable%20Ass/documentation/api-documentation.md)**: Request body parameters list, controller actions, and endpoint schemas.

### 🔌 Feature System Documentation
- **[LLM Compatibility Engine](file:///d:/Unthinkable%20Ass/documentation/llm-integration.md)**: Gemini integration prompt inputs, JSON outputs, and fallback calculations.
- **[Real-Time Chat & Persistence](file:///d:/Unthinkable%20Ass/documentation/chat-system.md)**: Socket.IO event bindings, handshake JWT authentication, and pagination.
- **[Notification Flows & SMTP Service](file:///d:/Unthinkable%20Ass/documentation/notification-flow.md)**: In-app real-time alerts and email templates.

### 📊 System Flow Diagrams (Mermaid)
- **[Diagram: High-Level Architecture](file:///d:/Unthinkable%20Ass/documentation/diagrams/architecture-diagram.md)**: Component boundary mapping.
- **[Diagram: Entity-Relationship Model](file:///d:/Unthinkable%20Ass/documentation/diagrams/database-er-diagram.md)**: Database schemas relations.
- **[Diagram: AI Scoring Sequence](file:///d:/Unthinkable%20Ass/documentation/diagrams/ai-flow.md)**: Gemini calculations and fallback sequence.
- **[Diagram: Chat & Messages Sequence](file:///d:/Unthinkable%20Ass/documentation/diagrams/chat-flow.md)**: Rooms join validation and persistence sequence.
- **[Diagram: Notification Pipelines](file:///d:/Unthinkable%20Ass/documentation/diagrams/notification-flow.md)**: In-app pushes and SMTP email alerts.

---

## 🛠️ Quick Installation Summary

For full details, see the **[Local Setup Guide](file:///d:/Unthinkable%20Ass/documentation/setup-guide.md)**.

### 1. Server Configuration
```bash
cd server
npm install
# Seed initial listings and tenant profiles
npm run seed
npm run dev
```

### 2. Client Configuration
```bash
cd client
npm install
npm run dev
```

---

## ⚖️ License
Licensed under the [ISC License](file:///d:/Unthinkable%20Ass/LICENSE). All rights reserved.