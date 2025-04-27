#!/bin/bash

echo "Stopping any running servers..."
pkill -f "node.*backend" || true
pkill -f "node.*frontend" || true

echo "Starting backend server..."
cd backend
npm run dev &
backend_pid=$!

echo "Starting frontend server..."
cd ../frontend
npm run dev &
frontend_pid=$!

echo "Servers started!"
echo "Backend PID: $backend_pid"
echo "Frontend PID: $frontend_pid"
echo ""
echo "The application will be available at: http://localhost:3000"
echo "To stop both servers, press Ctrl+C or run: kill $backend_pid $frontend_pid"

wait 