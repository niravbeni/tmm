'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

export default function LobbyPage() {
  const { socket, gameState, setTeamName, isLoading } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Please enter a team name');
      return;
    }
    
    if (!socket) {
      setError('Unable to connect to server');
      return;
    }
    
    // Check if team name already exists
    if (gameState?.teams && gameState.teams[inputValue]) {
      setError('Team name already taken');
      return;
    }
    
    // Register the team with the server
    socket.emit('registerTeam', inputValue, false);
    setTeamName(inputValue);
    
    // Redirect facilitators to results page, other players to hand page
    router.push('/hand');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse text-2xl font-medium">Connecting to server...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center p-4 h-full">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Say Less.</h1>
      
      <div className="w-full max-w-md card p-6 rounded-lg">
        <h2 className="text-2xl font-medium mb-6 text-center">Enter Team Name</h2>
        
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="modern-input w-full"
              placeholder="Enter team name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="modern-button w-full clickable"
          >
            Join Game
          </button>
        </form>
      </div>
    </main>
  );
}
