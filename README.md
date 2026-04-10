# Smart Parking Lot System

A full-stack parking lot management system with a React frontend and an Express API backed by MongoDB.

## Local development

### Backend
```bash
cd backend
npm install
npm run dev
```

Required backend environment variables:
- `MONGODB_URI`: MongoDB connection string
- `FRONTEND_URL`: frontend origin, for example `http://localhost:3000`

You can start from [backend/.env.example](c:/Vikas/SmartParking/backend/.env.example).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Optional frontend environment variables:
- `REACT_APP_API_BASE_URL`: API origin. Leave empty for local CRA proxy, set it in production.

You can start from [frontend/.env.example](c:/Vikas/SmartParking/frontend/.env.example).

## API endpoints

- `GET /api/parking/slots`
- `POST /api/parking/park`
- `POST /api/parking/exit`
- `GET /api/parking/tickets`
- `GET /api/parking/history`

## Deployment

### Frontend on Vercel
- Import the repo and set the root directory to `frontend`.
- Build command: `npm run build`
- Output directory: `build`
- Environment variable: `REACT_APP_API_BASE_URL=https://your-render-service.onrender.com`

### Backend on Render
- Create a MongoDB database, for example MongoDB Atlas.
- Create a Render Web Service with root directory `backend`.
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGODB_URI=<MongoDB connection string>`
  - `FRONTEND_URL=https://your-vercel-app.vercel.app`
  - `NODE_ENV=production`

The backend initializes collections and seeds parking slots automatically on startup.

## Tech stack

- Backend: Node.js, Express, MongoDB
- Frontend: React 18, Create React App
- HTTP client: Axios
