# Rent & Flatmate Finder

Rent & Flatmate Finder is a MERN-based marketplace for connecting tenants and owners around room listings, compatibility scoring, and real-time communication.

## Overview

The application is being built as a production-ready full stack platform with:

- Role-based authentication for tenants, owners, and admins
- Owner listing management
- Tenant profile management
- Search, filtering, and ranking of listings
- AI-backed compatibility scoring with fallback logic
- Interest requests and acceptance workflows
- Real-time chat after approval
- Email notifications
- Admin moderation tools

## Tech Stack

Frontend:

- React.js with Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Multer
- Cloudinary
- Nodemailer
- OpenAI API or Gemini API

Deployment:

- Vercel
- Render
- MongoDB Atlas

## Features

- Secure registration and login
- JWT-protected routes
- Owner and tenant dashboards
- Listing CRUD operations
- Image upload support
- Tenant profile saving
- Compatibility scoring stored in MongoDB
- Interest status flow: pending, accepted, declined
- Private chat after acceptance
- Email alerts for key actions
- Admin management views

## Project Structure

```text
client/
  src/
    components/
    context/
    hooks/
    layouts/
    pages/
    services/
    utils/
  public/
  .env.example

server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  socket/
  uploads/
  utils/
  .env.example
```

## Getting Started

### Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Configure environment variables

Copy the example files:

- [client/.env.example](client/.env.example)
- [server/.env.example](server/.env.example)

### Start development servers

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

## Environment Variables

### Client

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Server

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rent-flatmate-finder
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173

OPENAI_API_KEY=
GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## API Endpoints

### Health

- `GET /api/health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/protected`
- `GET /api/auth/tenant`
- `GET /api/auth/owner`
- `GET /api/auth/admin`

All protected routes require a bearer token in the `Authorization` header.

## Database Models

- `User`
- `Listing`
- `TenantProfile`
- `Compatibility`
- `Interest`
- `Chat`
- `Message`

## Development Notes

- The project follows an MVC-style backend structure with a service layer where needed.
- Frontend pages and shared UI live under `client/src`.
- The step-by-step development prompt is kept separately in [Documents/steps.md](Documents/steps.md).

## License

No license has been defined yet.