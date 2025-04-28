# Say-Less Workshop App

A digital card game facilitator for live, in-person workshops based on the Say-Less card game concept.

## Project Structure

- `frontend/`: Next.js web application
- `backend/`: Node.js + Socket.IO server

## Prerequisites

- Node.js (v18 or later recommended)
- npm

## Installation

Clone the repository and install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

You'll need to run both the backend server and the frontend development server:

### Backend

```bash
cd backend
npm run dev
```

The backend server will run on http://localhost:3001

### Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## Game Flow

1. Teams enter their team names on the lobby page
2. The facilitator gives a verbal clue
3. Teams select a card that matches the clue
4. Teams vote on which card belongs to the "Storyteller"
5. Results are displayed with scores
6. Move to the next round or reset the game

## Deployment

The app is designed to be deployed on Render:

- Backend: Deploy as a Web Service
- Frontend: Deploy as a Static Site

Make sure to set the appropriate environment variables in your deployment platform:

### Backend Environment Variables

- `PORT`: The port to run the server on (default: 3001)
- `FRONTEND_URL`: The URL of the frontend application

### Frontend Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: The URL of the backend server

## License

This project is intended for educational and workshop purposes. 