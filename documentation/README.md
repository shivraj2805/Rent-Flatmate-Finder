# RoomSync - Rent & Flatmate Finder Documentation

Welcome to the official documentation repository for **RoomSync - Rent & Flatmate Finder**. This portal contains all technical specifications, setup manuals, API endpoints mappings, system designs, and flow diagrams.

---

## 📖 Document Navigation Index

### 🚀 Getting Started
- **[Installation & Local Setup Guide](file:///d:/Unthinkable%20Ass/documentation/setup-guide.md)**: Local developer requirements, environment details, and quickstart commands.
- **[Testing & Scenarios Manual](file:///d:/Unthinkable%20Ass/documentation/testing-guide.md)**: Manual verification procedures and testing scenarios.
- **[Deployment Manual](file:///d:/Unthinkable%20Ass/documentation/deployment-guide.md)**: Production release guide for MongoDB Atlas, Render, and Vercel.

### 🧠 System Architecture & Design
- **[Architecture Specification](file:///d:/Unthinkable%20Ass/documentation/architecture.md)**: Multi-layer system architecture details.
- **[System Design Brief](file:///d:/Unthinkable%20Ass/documentation/system-design.md)**: 800-word design summary of compatibility, chat, notifications, and databases.
- **[Database Schema & Indices](file:///d:/Unthinkable%20Ass/documentation/database-schema.md)**: Field mappings, validation constraints, and query indices.
- **[RESTful API Documentation](file:///d:/Unthinkable%20Ass/documentation/api-documentation.md)**: Comprehensive controller mapping and endpoints list.

### 🔌 Feature Systems Design
- **[LLM Compatibility Engine](file:///d:/Unthinkable%20Ass/documentation/llm-integration.md)**: Gemini integration, prompts, parameters, and local fallback weights.
- **[Real-Time Chat & Persistence](file:///d:/Unthinkable%20Ass/documentation/chat-system.md)**: Socket.IO events, secure rooms, and message storage.
- **[Notification Flows & SMTP Service](file:///d:/Unthinkable%20Ass/documentation/notification-flow.md)**: Real-time alerts and email templates.

### 📊 System Flow Diagrams (Mermaid)
- **[Diagram: High-Level Architecture](file:///d:/Unthinkable%20Ass/documentation/diagrams/architecture-diagram.md)**: Component boundary mapping.
- **[Diagram: Entity-Relationship Model](file:///d:/Unthinkable%20Ass/documentation/diagrams/database-er-diagram.md)**: Database schemas relations.
- **[Diagram: AI Scoring Sequence](file:///d:/Unthinkable%20Ass/documentation/diagrams/ai-flow.md)**: Gemini calculations and fallback sequence.
- **[Diagram: Chat & Messages Sequence](file:///d:/Unthinkable%20Ass/documentation/diagrams/chat-flow.md)**: Rooms join validation and persistence sequence.
- **[Diagram: Notification Pipelines](file:///d:/Unthinkable%20Ass/documentation/diagrams/notification-flow.md)**: In-app pushes and SMTP email alerts.

---

## 🎯 Project Overview

### Problem Statement
Finding matching apartments and compatible flatmates in urban hubs like Pune is traditionally fragmented. Users face mismatched budget expectations, location disputes, conflicting moving timelines, and lifestyle friction (habits, room layouts). Furthermore, initial contact channels are unsafe, letting users chat before checking match intent, leading to spam.

### Solution Overview
**RoomSync** is a secure, intelligent, and real-time portal connecting flatmate searchers and listing owners. 
- It uses a **weighted AI Compatibility Scoring Engine** (powered by Gemini) with a rule-based deterministic fallback to rank listings for tenants.
- Direct messaging is **strictly locked** until a landlord accepts a tenant's interest request.
- Integrated real-time communications (Socket.IO with JWT authorization), instant notifications, and email alerts keep matching fluid and transparent.
