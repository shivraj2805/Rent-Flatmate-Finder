# Step-by-Step Development

Rent & Flatmate Finder is a MERN-based marketplace for connecting tenants and owners around room listings, compatibility scoring, and real-time communication.

---

# Technology Stack

Frontend

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios
* Socket.IO Client

Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Socket.IO
* Multer
* Cloudinary
* Nodemailer
* OpenAI API or Gemini API

Deployment

* Vercel
* Render
* MongoDB Atlas

---

# Development Steps

## Step 1 – Project Initialization

Create the complete folder structure.

Frontend

* Create Vite React app
* Install dependencies
* Configure Tailwind CSS
* Configure React Router
* Create folders:

  * components
  * pages
  * layouts
  * hooks
  * services
  * context
  * utils
  * assets

Backend

* Initialize Express project
* Install dependencies
* Create folders:

  * controllers
  * routes
  * models
  * middleware
  * services
  * config
  * socket
  * utils
  * uploads

Configure

* MongoDB connection
* Environment variables
* Express server
* CORS
* Error handling

When finished, STOP and wait for my approval.

---

## Step 2 – Database Design

Create all Mongoose models.

Collections

* User
* Listing
* TenantProfile
* Compatibility
* Interest
* Chat
* Message

Define relationships.

Create indexes where needed.

When finished, STOP.

---

## Step 3 – Authentication

Implement

* Register
* Login
* JWT
* Password Hashing
* Role Middleware
* Protected Routes

Roles

* Tenant
* Owner
* Admin

Test all APIs.

STOP.

---

## Step 4 – Frontend Authentication

Build

* Login Page
* Register Page
* Authentication Context
* Protected Routes
* Navbar
* Sidebar
* Dashboard Layout

STOP.

---

## Step 5 – Owner Dashboard

Create pages

* Dashboard
* Add Listing
* Edit Listing
* My Listings

Features

* CRUD Listings
* Upload Images
* Cloudinary Integration

STOP.

---

## Step 6 – Tenant Dashboard

Create

* Profile Page
* Edit Profile

Fields

* Preferred Location
* Budget Range
* Move-in Date

Save to MongoDB.

STOP.

---

## Step 7 – Browse Listings

Implement

* Search
* Filter
* Budget Filter
* Location Filter
* Listing Details

STOP.

---

## Step 8 – AI Compatibility Engine

Whenever

* Tenant profile changes
* Listing changes

Call OpenAI/Gemini.

Prompt

Given this room listing

Location
Rent
Available Date
Room Type

and this tenant profile

Preferred Location
Budget Range
Move-in Date

Return ONLY

{
score,
explanation
}

Store

* Score
* Explanation

inside MongoDB.

Do NOT recalculate every request.

STOP.

---

## Step 9 – Rule-Based Fallback

If AI API fails

Generate score

Budget Match

Location Match

Move-in Date Match

Store result.

Application should continue working.

STOP.

---

## Step 10 – Compatibility Ranking

Sort listings

Highest Score First.

Show

* Score
* Explanation

on every card.

STOP.

---

## Step 11 – Interest Request

Tenant

Send Interest.

Owner

Accept

Decline

Pending

Accepted

Declined

STOP.

---

## Step 12 – Real-Time Chat

Use Socket.IO.

Only after acceptance.

Features

* Send Message
* Receive Message
* Save Messages
* Previous Messages
* Auto Scroll

Optional

* Typing Indicator
* Online Status

STOP.

---

## Step 13 – Email Notifications

Owner

Receive email

High compatibility (>80)

Tenant

Receive email

Accepted

Declined

Use Nodemailer.

STOP.

---

## Step 14 – Admin Panel

Dashboard

Manage

* Users
* Listings
* Chats
* Interests

Show Statistics.

STOP.

---

## Step 15 – UI Improvements

Add

* Loading
* Skeleton
* Toast Notifications
* Empty States
* Error Pages
* Responsive Design

STOP.

---

## Step 16 – Testing

Test every API.

Test

* Authentication
* Listings
* AI
* Chat
* Emails
* Admin

Fix all errors.

STOP.

---

## Step 17 – Documentation

Generate

README.md

Include

* Features
* Setup
* Installation
* Folder Structure
* API Documentation
* Database Schema
* AI Prompt
* Example Input
* Example Output
* Deployment Guide

Generate

.env.example

STOP.

---

## Coding Rules

* Use MVC architecture.
* Use Service Layer.
* Use reusable React components.
* Use async/await.
* Validate every request.
* Use centralized error handling.
* Write clean code.
* Follow REST API conventions.
* Do not generate placeholder code.
* Every feature should be fully functional before moving to the next step.
* At the end of each step, ask: **"Step X completed successfully. Would you like me to continue to Step X+1?"**
