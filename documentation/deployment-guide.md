# RoomSync Production Deployment Guide

This guide details the steps required to deploy the RoomSync application to production environments.

---

## 🗄️ Database Setup: MongoDB Atlas

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Deploy Cluster**: Create a free-tier cluster in your preferred cloud region.
3. **Database User**: Create a database user with password access. Note down the credentials.
4. **IP Access List**: Add `0.0.0.0/0` to allow access from hosting platforms.
5. **Connection String**: Copy the connection string format:
   `mongodb+srv://<username>:<password>@cluster.mongodb.net/roomsync?retryWrites=true&w=majority`

---

## 💻 Backend Hosting: Render

### Setup Steps
1. Log in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following build configurations:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Expand the **Advanced** section to add environment variables (see checklist below).

### Environment Variables Checklist (Render)
- `PORT` = `10000`
- `NODE_ENV` = `production`
- `MONGO_URI` = *(Your MongoDB Atlas connection URL)*
- `JWT_SECRET` = *(Secure random string)*
- `GEMINI_API_KEY` = *(Gemini API key)*
- `CLOUDINARY_CLOUD_NAME` = *(Cloudinary Cloud name)*
- `CLOUDINARY_API_KEY` = *(Cloudinary API key)*
- `CLOUDINARY_API_SECRET` = *(Cloudinary Secret key)*
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `465`
- `SMTP_USER` = *(Your SMTP email)*
- `SMTP_PASS` = *(Your SMTP app password)*
- `CLIENT_URL` = *(Your Vercel deployment URL, e.g., `https://roomsync.vercel.app`)*

---

## 🖥️ Frontend Hosting: Vercel

### Setup Steps
1. Log in to [Vercel](https://vercel.com) and create a **New Project**.
2. Import your GitHub repository.
3. Set the following build configurations:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** section to add client keys (see checklist below).

### Environment Variables Checklist (Vercel)
- `VITE_API_BASE_URL` = `https://your-render-service.onrender.com/api`
- `VITE_SOCKET_URL` = `https://your-render-service.onrender.com`

---

## 🚦 Post-Deployment Checklist
1. Verify that login and registration operate correctly.
2. Verify listing images upload to Cloudinary.
3. Open browser console and verify Socket.IO registers connection without CORS violations.
4. Verify email alerts for compatibility matching and interest status updates.
