# RoomSync Deployment Guide

This guide details the complete deployment process for **RoomSync**, covering local environment setup, database seeding, and production deployments on cloud providers (Render for the Node/Express backend and Vercel for the React/Vite frontend).

---

## 🛠️ Prerequisites & Environmental Keys

Before beginning setup, ensure you have accounts on:
1. **Node.js** (v16+) installed locally.
2. **MongoDB Atlas** for database hosting.
3. **Google AI Studio** for a Gemini API Key.
4. **Cloudinary** for storing uploaded listing images.
5. **SMTP Mail Provider** (e.g. Gmail, Mailtrap) for notifications.

---

## 💻 Local Setup & Installation

### Step 1: Install Dependencies
Open two terminal windows to install dependencies separately for the client and server:

**For Frontend Client**:
```bash
cd client
npm install
```

**For Backend Server**:
```bash
cd server
npm install
```

### Step 2: Configure Environment Variables
Create `.env` files in both directories following the template configurations:

#### `/server/.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/roomsync
JWT_SECRET=generate_a_long_secure_random_string_here
CLIENT_URL=http://localhost:5173

# Gemini AI Key
GEMINI_API_KEY=AIzaSy...

# Cloudinary Storage Configurations
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Mail Configurations (Optional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

#### `/client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Seed Database (Optional)
To populate your local/cloud database with realistic Pune-based users, listings, profiles, and chats:
```bash
cd server
node seed_data.js
```

### Step 4: Run Dev Servers
Start both servers concurrently:
- Run Client: `cd client && npm run dev` (Runs on `http://localhost:5173`)
- Run Server: `cd server && npm run dev` (Runs on `http://localhost:5000`)

---

## 🚀 Deploying to Production

### 1. Backend Web Service (Render)
Render is used to host Node/Express web apps.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following build settings:
   - **Name**: `roomsync-backend`
   - **Environment**: `Node`
   - **Region**: Select region closest to your users.
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Click **Advanced** and add the environment variables listed in the `/server/.env` section. 
   - *Note*: Set `NODE_ENV` to `production` and update `CLIENT_URL` to point to your Vercel URL.
6. Click **Create Web Service**. Save the generated URL (e.g. `https://roomsync-backend.onrender.com`).

---

### 2. Frontend React Application (Vercel)
Vercel is optimized for building and deploying React SPAs.

1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Connect your GitHub repository.
3. Configure the following project parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://roomsync-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://roomsync-backend.onrender.com`
5. Click **Deploy**. Vercel will build and serve your app at a generated domain (e.g. `https://roomsync.vercel.app`).
6. **Crucial Step**: Go back to your **Render Environment Settings** and update the `CLIENT_URL` variable to match the deployed Vercel URL (e.g., `https://roomsync.vercel.app`), then redeploy the backend Web Service.

---

## 🔍 Post-Deployment Verifications

Once deployed, verify:
- **CORS Config**: Inspect console logs in the browser. If you get a CORS block, double check `CLIENT_URL` on the Render backend env panel.
- **WebSocket connection**: Chat and notification features require connection. Look for Socket.IO logs in Render runtime panel.
- **AI Key**: Add a listing or update a tenant profile, and verify in Render logs that `evaluateAndSaveCompatibility` completes with `source: 'ai'`.
