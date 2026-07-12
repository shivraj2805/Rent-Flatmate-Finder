# RoomSync Local Installation & Setup Guide

This guide details the steps required to configure and launch the RoomSync developer stack locally.

---

## 🛠️ Software Requirements
Ensure the following tools are installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local Community Server v6.0+ OR a MongoDB Atlas cluster URL

---

## 📁 Repository Structure
```
d:/Unthinkable Ass/
├── client/          # React Frontend (Vite)
├── server/          # Express Backend (Node.js)
└── documentation/   # Technical Documentation
```

---

## 🔑 Environment Settings (.env)

### 1. Backend Environment Configurations
Create a **`.env`** file inside the `server/` directory. Use the template below:

```env
# Server Port Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/roomsync

# JWT Token Signing Secret
JWT_SECRET=production_secret_key_change_me_in_prod

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Configurations (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_email@gmail.com
SMTP_PASS=your_smtp_app_password
SMTP_FROM="RoomSync Alerts" <no-reply@roomsync.com>

# Allowed client URL
CLIENT_URL=http://localhost:5173
```

> [!NOTE]
> If `SMTP_HOST` or `GEMINI_API_KEY` are omitted, the backend will still run:
> - Compatibility scoring will gracefully fallback to deterministic rules.
> - Email dispatches will bypass SMTP and log alerts directly to the console.

### 2. Frontend Environment Configurations
Create a **`.env`** file inside the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Step-by-Step Installation

### Step 1: Clone and Set Up Server Dependencies
Open a terminal in the project root:
```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Optional: Seed initial database listings, users, and profiles
npm run seed
```

### Step 2: Set Up Client Dependencies
Open a second terminal window in the project root:
```bash
# Navigate to the client folder
cd client

# Install frontend dependencies
npm install
```

---

## 🏃 Running the Application

### 1. Launch Backend Server
In the `server/` folder terminal run:
```bash
npm run dev
```
The server will boot on `http://localhost:5000`. You should see logs confirming database connection and Socket.IO initialization.

### 2. Launch React Frontend
In the `client/` folder terminal run:
```bash
npm run dev
```
The Vite development server will boot on `http://localhost:5173`. Open this URL in your web browser.
