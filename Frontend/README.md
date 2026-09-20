# Pulse - AI-Powered Music Streaming Platform

A modern, premium-quality music streaming web application built with React, Node.js, and Supabase.

## Features

- **Music Player** - Full-featured player with play/pause, seek, volume, repeat, shuffle, queue
- **Authentication** - Email/password and Google OAuth via Supabase
- **Playlists** - Create, manage, and share playlists
- **Liked Songs** - Like and save favorite songs
- **Search** - Real-time search for songs and artists
- **Recently Played** - Track listening history
- **Admin Dashboard** - Upload, manage songs, view analytics
- **Realtime Features** - Live listener counts, real-time updates

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- React Router
- Axios

### Backend
- Node.js + Express.js
- Supabase (auth, database, storage)

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. **Clone and install dependencies separately:**
```bash
cd pulse
cd Frontend && npm install
cd ../backend && npm install
```

2. **Set up Supabase:**

Create a new Supabase project and run the SQL below in the SQL Editor.

3. **Configure environment variables:**

Copy `.env.example` to `.env` in both Frontend and backend directories:

**Frontend/.env:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001/api
```

**backend/.env:**
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

4. **Start development servers:**
In two terminals:
```bash
cd Frontend && npm run dev
```

```bash
cd backend && npm run dev
```

5. **Open http://localhost:5173**

## Project Structure

```
pulse/
├── Frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API services
│   │   └── lib/           # Supabase config
│   └── ...
├── backend/               # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── config/        # Configuration
│   │   └── index.js       # Entry point
│   └── ...
└── README.md
```

## Default Admin User

After creating your Supabase project:
1. Register a new user
2. Go to Supabase Dashboard > Authentication > Users
3. Edit the user and add `role: admin` to user metadata

## Demo Songs

Add sample songs via the Admin Dashboard upload feature or directly in Supabase.

## License

MIT