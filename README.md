# RoomSync (Rent & Flatmate Finder)

RoomSync is a premium, production-ready MERN stack application designed to help users find suitable rooms and flatmates in Pune. The platform features role-based workflows, Gemini AI-powered compatibility matching with rule-based fallback logic, a real-time chat messenger, custom dynamic status tracking, and a comprehensive admin command center.

---

## 🚀 Features

### 👤 Role-Based Portals & Dashboards
- **Tenants**: Express interests in listings, track application statuses, maintain preferred budgets and locations, and chat directly with landlords once accepted.
- **Owners**: Add/manage room listings with rich image attachments, review tenant profiles, evaluate compatibility scores, and trigger instant chat channels.
- **Admins**: Monitor site statistics, manage users and listings, perform bulk audit actions, search log timelines, and toggle "Live Mode" for automatic dashboard refreshes.

### 🧠 Gemini AI Compatibility Engine
- Leverages the Google Gemini Flash API (`gemini-2.5-flash`) to generate semantic compatibility percentages (0-100%) and textual explanations based on budget, move-in schedules, and locations.
- Automatically falls back to a deterministic **Rule-Based Matching Algorithm** if the AI API key is missing or rate limits are reached.

### 💬 Real-Time Messaging & Notifications
- Fully integrated WebSocket client via **Socket.IO** for instant chat message bubbles, status indicators, and typing notifications.
- **In-App Notification Center**: Real-time push alerts (bell icon dropdown in Navbar) notifying users of new messages, incoming match requests, or approval updates.
- **Auto-Read Queue**: Once a notification is clicked or bulk-marked as read, it is optimistically swept from the active dropdown view.

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cloud instance)
- Google Gemini API Key or OpenAI API Key
- Cloudinary Account (for listing image hosting)

### Installation Steps

1. **Clone the repository and install client dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Install server dependencies**:
   ```bash
   cd ../server
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `server` directory and a `.env` file in the `client` directory (see the [Environment Variables](#-environment-variables) section below).

4. **Seed the database (Optional)**:
   Populate MongoDB with realistic Pune-based dummy owners, completed tenant profiles, and active listings:
   ```bash
   cd server
   node seed_data.js
   ```

5. **Start the development servers**:
   *   **Backend Server**:
       ```bash
       cd server
       npm run dev
       ```
   *   **Frontend Client**:
       ```bash
       cd client
       npm run dev
       ```

---

## 📁 Folder Structure

```text
RoomSync/
├── client/                     # Frontend Vite + React SPA
│   ├── public/                 # Static assets (favicons, logos)
│   └── src/
│       ├── components/         # Reusable UI widgets & Route Guards (GuestRoute, ProtectedRoute)
│       ├── context/            # Global React Contexts (AuthContext)
│       ├── hooks/              # Custom react hooks (useAuth)
│       ├── layouts/            # Shared layouts (Navbar, Sidebars, AdminLayout)
│       ├── pages/              # Screen components (Dashboard, ChatsPage, AdminDashboard)
│       ├── services/           # Api service wrappers (notificationService, adminService)
│       └── utils/              # Client-side utility functions
│
├── server/                     # Backend Express REST API
│   ├── config/                 # Cloudinary, Database, and Socket setups
│   ├── controllers/            # Request handlers (authController, notificationController)
│   ├── middleware/             # Route authentication, error handlers, and async wrappers
│   ├── models/                 # Mongoose collection schemas (User, Listing, Chat)
│   ├── routes/                 # Express route entrypoints
│   ├── services/               # Core business logic layer (compatibilityService, interestService)
│   ├── socket/                 # Socket.IO connection event registers
│   └── utils/                  # Helper routines (generateToken)
```

---

## 🔌 API Documentation

All protected routes require a `Bearer <token>` string passed in the `Authorization` request header.

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Registers a new tenant or owner account |
| `POST` | `/login` | Public | Authenticates credentials and returns a JWT |
| `GET` | `/me` | Private | Retrieves active user account profile |
| `PATCH`| `/profile` | Private | Updates name and email details |
| `PATCH`| `/password` | Private | Changes security passwords |

### 🏠 Listing Routes (`/api/listings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Private (Owner) | Publishes a new room listing (with image upload) |
| `GET` | `/` | Private | Browses and filters active listings |
| `GET` | `/:id` | Private | Gets specific listing details and prospects |
| `PUT` | `/:id` | Private (Owner) | Updates listing details |
| `DELETE`| `/:id` | Private (Owner) | Deletes a property listing |

### 👤 Tenant Routes (`/api/tenant`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/profile` | Private (Tenant) | Configures preferred locations, budget range, and bio |
| `GET` | `/profile` | Private | Fetches profile setup stats and configurations |
| `PUT` | `/profile` | Private (Tenant) | Modifies tenant search parameters |

### 🤝 Interest & Match Routes (`/api/interests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Private (Tenant) | Submits a match interest request |
| `GET` | `/` | Private | Retrieves incoming/outgoing requests |
| `PATCH`| `/:id/status`| Private (Owner) | Approves (`accepted`) or declines (`declined`) match requests |

### 💬 Chat Messenger Routes (`/api/chats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Private | Retrieves list of match chat rooms |
| `GET` | `/:id/messages`| Private | Fetches conversation transcripts |
| `POST` | `/:id/messages`| Private | Sends a text message inside a chat |

### 🔔 Notification Routes (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Private | Gets recent unread/read push notifications |
| `PATCH`| `/:id/read` | Private | Marks a single notification as read |
| `POST` | `/read-all` | Private | Marks all user notifications as read |

### 🛡️ Admin Management Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Private (Admin) | Compiles total system statistics and charts data |
| `GET` | `/users` | Private (Admin) | Lists/searches all users |
| `GET` | `/listings` | Private (Admin) | Lists/searches all room listings |
| `GET` | `/interests`| Private (Admin) | Audits active match expressions |
| `GET` | `/chats` | Private (Admin) | Audits chat room indices |
| `GET` | `/activity` | Private (Admin) | Fetches historical timeline logs |
| `POST` | `/users/bulk-status`| Private (Admin) | Blocks or activates multiple users |
| `POST` | `/users/bulk-delete`| Private (Admin) | Deletes multiple users |
| `POST` | `/listings/bulk-status`| Private (Admin)| Activates/deactivates multiple listings |
| `POST` | `/listings/bulk-delete`| Private (Admin)| Deletes multiple listings |

---

## 🗄️ Database Schema

### 1. `User` Collection
Stores basic accounts data and access credentials.
- `name` (String, required)
- `email` (String, unique, index)
- `password` (String, select: false)
- `role` (String, Enum: `['tenant', 'owner', 'admin']`)
- `avatar` (String)
- `isActive` (Boolean, default: true)
- `lastLoginAt` (Date)
- **Indexes**: `{ role: 1, createdAt: -1 }`

### 2. `Listing` Collection
Holds details of published properties.
- `owner` (ObjectId -> User, ref)
- `title` (String, max 150)
- `description` (String, max 5000)
- `location` (String, index)
- `rent` (Number, index)
- `roomType` (String, Enum: `['private-room', 'shared-room', 'studio', 'apartment', 'other']`)
- `genderPreference` (String, Enum: `['any', 'male', 'female']`)
- `availableFrom` (Date, index)
- `furnished` (Boolean)
- `amenities` (Array of Strings)
- `images` (Array of objects containing `url` and `publicId`)
- `status` (String, Enum: `['active', 'filled']`)
- **Indexes**: `{ owner: 1, createdAt: -1 }`, `{ title: 'text', description: 'text', location: 'text' }`

### 3. `TenantProfile` Collection
Stores tenant preferences and searching statuses.
- `user` (ObjectId -> User, ref, unique)
- `preferredLocations` (Array of Strings, index)
- `budgetRange` (Object containing `min` and `max` Numbers)
- `moveInDate` (Date, index)
- `roomPreferences` (Array of Strings)
- `lifestylePreferences` (Array of Strings)
- `bio` (String)
- `gender` (String, Enum: `['male', 'female', 'other']`)
- `isSearching` (Boolean)
- **Indexes**: `{ moveInDate: 1, isSearching: 1 }`

### 4. `Compatibility` Collection
Stores evaluations of listings against tenant criteria.
- `listing` (ObjectId -> Listing, ref)
- `tenantProfile` (ObjectId -> TenantProfile, ref)
- `score` (Number)
- `explanation` (String)
- `source` (String, Enum: `['ai', 'rule-based']`)
- `evaluatedAt` (Date)

### 5. `Interest` Collection
Tracks requests sent between flatmate searchers.
- `tenant` (ObjectId -> User, ref)
- `owner` (ObjectId -> User, ref)
- `listing` (ObjectId -> Listing, ref)
- `tenantMessage` (String)
- `status` (String, Enum: `['pending', 'accepted', 'declined']`)
- `ownerResponseMessage` (String)
- `respondedAt` (Date)

### 6. `Chat` & `Message` Collections
Houses messenger operations.
- **Chat**: Reference links to user parties (`tenant`, `owner`), corresponding listing (`listing`), interest source (`interest`), and `lastMessage` pointer.
- **Message**: Tracks the room context (`chat`), sender pointer (`sender`), content body (`content`), response links (`replyTo`), and timestamps.

### 7. `Notification` Collection
Stores in-app push alerts.
- `recipient` (ObjectId -> User, ref, index)
- `sender` (ObjectId -> User, ref)
- `type` (String, Enum: `['interest_received', 'interest_accepted', 'interest_declined', 'new_message']`)
- `title` (String)
- `content` (String)
- `isRead` (Boolean, default: false)
- `link` (String)

---

## 🤖 AI Core: Gemini Scoring

### AI Prompt Template
```text
You are an expert real estate matching assistant. Calculate a compatibility score (0 to 100) and provide a concise explanation (max 2-3 sentences) indicating how well a tenant's preferences match a listed room.

Room Listing details:
- Location: {listing.location}
- Monthly Rent: ₹{listing.rent}
- Available Date: {listing.availableFrom}
- Room Type: {listing.roomType}

Tenant Profile details:
- Preferred Locations: {profile.preferredLocations}
- Budget Range: ₹{profile.min} to ₹{profile.max}
- Target Move-in Date: {profile.moveInDate}

Evaluation criteria:
1. Budget Match: Rent should ideally fall within the budget range.
2. Location Match: Listing location should match or be close to the tenant's preferred locations.
3. Move-in Date Match: Listing available date should be near or before the tenant's target move-in date.

Return ONLY a JSON object with this exact structure:
{
  "score": <integer score from 0 to 100>,
  "explanation": "<concise explanation detail>"
}
```

### Example Input
#### Listing Document:
```json
{
  "title": "Beautiful Studio in Koregaon Park",
  "location": "Lane 5, Koregaon Park, Pune",
  "rent": 14000,
  "roomType": "studio",
  "availableFrom": "2026-08-01T00:00:00.000Z"
}
```
#### Tenant Profile Document:
```json
{
  "preferredLocations": ["Koregaon Park", "Viman Nagar"],
  "budgetRange": { "min": 10000, "max": 15000 },
  "moveInDate": "2026-08-01T00:00:00.000Z"
}
```

### Example Output
```json
{
  "score": 100,
  "explanation": "This room offers an excellent match, perfectly aligning with the tenant's budget of ₹10,000-₹15,000 and their target move-in date. Additionally, the Koregaon Park location is one of the tenant's top preferred areas, ensuring a high degree of compatibility."
}
```

---

## 🌐 Environment Variables

### `/server/.env` Configurations
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/roomsync
JWT_SECRET=your_super_secure_jwt_secret_token
CLIENT_URL=https://roomsync-client.vercel.app

# AI Keys
GEMINI_API_KEY=your_google_gemini_api_key

# Image Attachments Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Optional Mail Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### `/client/.env` Configurations
```env
VITE_API_BASE_URL=https://roomsync-server.render.com/api
VITE_SOCKET_URL=https://roomsync-server.render.com
```

---

## 🚢 Deployment Guide

### Backend Deployment (Render / Heroku)
1. Register/Login on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository.
4. Configure service build settings:
   - **Environment**: `Node`
   - **Root Directory**: `server` (or leave blank if repository is server-only)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Head to the **Environment** tab and add all variables listed in the `/server/.env` configurations. Note: Make sure `CLIENT_URL` matches your frontend Vercel domain URL.
6. Trigger the manual build and copy the generated Web Service URL.

### Frontend Deployment (Vercel)
1. Register/Login on [Vercel](https://vercel.com/).
2. Select **Add New Project** and link your GitHub repository.
3. In configuration parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables `VITE_API_BASE_URL` and `VITE_SOCKET_URL` pointing to your deployed backend Render domain URL.
5. Click **Deploy**. Vercel will bundle and spin up your application.

---

## ⚖️ License
Licensed under the [ISC License](LICENSE). All rights reserved.