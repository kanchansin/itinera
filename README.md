# Itinera

Itinera is an AI-powered group travel planning app that generates itineraries and lets users share, save, and reuse them within a community — think trip planning with an Instagram-style social layer on top.

## Features

- **AI itinerary generation** — describe a trip and get a structured, editable itinerary back, powered by the Groq API
- **Group planning** — plan trips collaboratively with friends
- **Social feed** — save trips as shareable guides/posts, browse other users' trips, and reuse them as your own
- **Engagement** — likes, follows, and photo sharing on trip guides
- **Location & notifications** — location tracking and push notifications for trip-related updates
- **Auth** — Google OAuth and JWT-based authentication

## Tech Stack

**Client** (`/client`)
- React Native (Expo) with TypeScript
- NativeWind (Tailwind for React Native)
- React Navigation
- Firebase client SDK
- Axios for API calls
- Expo Location & Notifications

**Server** (`/server`)
- Node.js + Express
- Firebase Admin SDK
- Groq SDK for AI-generated itineraries
- JWT authentication
- PostgreSQL
- Dockerized for deployment

**Infrastructure**
- Firebase (Auth/data) via the Firebase Admin SDK on the server and Firebase client SDK on the client
- Dockerized backend, deployable to any container host (e.g. Cloud Run)

## Project Structure

```
itinera/
├── client/          # React Native (Expo) app
│   ├── app/         # App routes/screens
│   ├── components/  # UI components
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── services/     # API, Firebase, location, notifications, storage
│   └── constants/
└── server/          # Express API
    ├── src/
    │   ├── config/    # Database config
    │   └── routes/    # auth, trips, users, destinations, interactions, ai, guides
    ├── server.js
    └── DockerFile
```

## Getting Started

### Prerequisites
- Node.js
- npm
- A Firebase project (client + admin credentials)
- A Groq API key

### Server setup
```bash
cd server
npm install
npm run dev
```

### Client setup
```bash
cd client
npm install
npx expo start
```

## Notes

The itinerary-generation service originally used the Gemini API but was switched to Groq after running into rate limits on Gemini's free tier that were causing crashes.

## License

MIT